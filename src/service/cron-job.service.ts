import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { HelperService } from 'src/helper/helper.service';
import { PrismaService } from 'src/helper/prisma.service';
import { ITokenPrice } from 'src/helper/classes/web3';
import * as Tokens from 'src/assets/tokens.json';

@Injectable()
export class CronJobService {
  private stateLoopPrice: boolean;
  private stateLoopTargetPrice: boolean;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly helperService: HelperService,
  ) {}

  // Recommendation:
  // - if want to use the free version and the token is limited to < 10. I recommend using https://www.geckoterminal.com/dex-api first to get the price (if onchain data)
  // - or use Binance Public API for get the price data (if exchange data). Example: https://www.binance.com/api/v3/ticker/price?symbol=ETHUSDT
  @Cron(CronExpression.EVERY_5_MINUTES) // 5 minutes
  async handlePrice() {
    if (!this.stateLoopPrice) {
      this.stateLoopPrice = true;
      try {
        let getTokenPrices = await this.prismaService.token.findMany();
        if (!getTokenPrices || (getTokenPrices && getTokenPrices.length == 0)) {
          getTokenPrices = await this.prismaService.token.createManyAndReturn({
            data: Tokens,
          });
        }
        const paramsToken: ITokenPrice[] = await getTokenPrices.map((data) => ({
          tokenAddress: data.token_address,
          exchange: 'uniswapv3',
        }));
        const prices = await this.helperService.getPrices(paramsToken);
        if (prices && prices.length > 0) {
          const passingPriceLogs = await Promise.all(
            prices.map(async (data) => ({
              token_id: (
                await getTokenPrices.find(
                  (token) =>
                    token.token_address.toLowerCase() ==
                    data.tokenAddress.toLowerCase(),
                )
              ).id,
              price: data.usdPrice,
            })),
          );
          await this.prismaService.tokenPriceLogs.createMany({
            data: passingPriceLogs,
          });
          const logs1HourAgo = await this.prismaService.tokenPriceLogs.findMany(
            {
              where: {
                created_at: {
                  gte: new Date(new Date().setHours(new Date().getHours() - 1)),
                  lte: new Date(
                    new Date().setMinutes(new Date().getMinutes() - 55),
                  ),
                },
              },
              orderBy: {
                created_at: 'asc',
              },
              include: {
                token: true,
              },
            },
          );
          if (logs1HourAgo && logs1HourAgo.length > 0) {
            await Promise.all(
              passingPriceLogs.map(async (data) => {
                const fIndex = await logs1HourAgo.findIndex(
                  (log) => log.token_id == data.token_id,
                );
                if (fIndex > -1) {
                  const oldPrice = Number(logs1HourAgo[fIndex].price);
                  const priceChange =
                    ((data.price - oldPrice) / oldPrice) * 100;
                  const isMore3Percent = priceChange > 3;
                  if (isMore3Percent) {
                    const token_string = `${logs1HourAgo[fIndex].token.token_name} (${logs1HourAgo[fIndex].token.token_symbol})`;
                    await this.helperService.sendAlert(
                      token_string,
                      priceChange,
                    );
                  }
                }
              }),
            );
            this.stateLoopPrice = true;
          } else {
            this.stateLoopPrice = false;
          }
        } else {
          this.stateLoopPrice = false;
        }
      } catch (error) {
        this.stateLoopPrice = false;
      }
    }
  }

  @Cron('*/5 * * * * * ') // 5 seconds
  async handleTargetPrice() {
    if (!this.stateLoopTargetPrice) {
      this.stateLoopTargetPrice = true;
      try {
        const getAlerts = await this.prismaService.alert.findMany({
          where: {
            triggered: false,
          },
          orderBy: {
            created_at: 'desc',
          },
          include: {
            token: {
              include: {
                tokenPriceLogs: {
                  orderBy: {
                    created_at: 'desc',
                  },
                  take: 1,
                },
              },
            },
          },
        });
        if (getAlerts && getAlerts.length > 0) {
          await Promise.all(
            getAlerts.map(async (data) => {
              const isMoreTargetPrice =
                data.token.tokenPriceLogs[0].price >= data.target_price;
              if (isMoreTargetPrice) {
                await Promise.all([
                  this.helperService.sendPriceAlert(
                    data.email,
                    `${data.token.token_name} (${data.token.token_symbol})`,
                    Number(data.target_price),
                  ),
                  this.prismaService.alert.update({
                    where: {
                      id: data.id,
                    },
                    data: {
                      triggered: true,
                    },
                  }),
                ]);
              }
            }),
          );
          this.stateLoopTargetPrice = true;
        } else {
          this.stateLoopTargetPrice = false;
        }
      } catch (error) {
        console.log({ error });
        this.stateLoopTargetPrice = false;
      }
    }
  }
}
