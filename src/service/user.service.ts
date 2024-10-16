import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from 'src/helper/prisma.service';

@Injectable()
export class UserService {
  private feePercentage: number;

  constructor(
    private configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    this.feePercentage = Number(this.configService.get('FEE_PERCENTAGE'));
  }

  async get_prices() {
    let result = {
      message: 'Data not found',
      data: null,
    };
    try {
      const getTokens = await this.prismaService.token.findMany();
      const allData = await Promise.all(
        getTokens.map(async (data) => {
          const dataPrices = await this.prismaService.getHourlyTokenPrices(
            data.id,
          );
          return {
            token_name: data.token_name,
            token_symbol: data.token_symbol,
            decimals: data.decimals,
            token_address: data.token_address,
            prices: dataPrices,
          };
        }),
      );
      result = {
        message: 'Success',
        data: allData,
      };
      return result;
    } catch (error) {
      return result;
    }
  }

  async set_alert(params: {
    token_symbol: string;
    dollar: number;
    email: string;
  }) {
    let result = {
      message: 'Request is fail',
      data: null,
    };
    try {
      const getToken = await this.prismaService.token.findFirst({
        where: {
          token_symbol: params.token_symbol,
        },
      });
      if (getToken) {
        const setAlert = await this.prismaService.alert.create({
          data: {
            token_id: getToken.id,
            target_price: params.dollar,
            email: params.email,
          },
        });
        result = {
          message: 'Success',
          data: {
            id: setAlert.id,
            token_name: getToken.token_name,
            ...params,
          },
        };
        return result;
      } else {
        return result;
      }
    } catch (error) {
      return result;
    }
  }

  async get_swap_rate(eth_amount: number) {
    let result = {
      message: 'Data not found',
      data: null,
    };
    try {
      const getTokens = await this.prismaService.token.findMany({
        where: {
          token_symbol: {
            in: ['ETH', 'BTC'],
          },
        },
        include: {
          tokenPriceLogs: {
            orderBy: {
              created_at: 'desc',
            },
            take: 1,
          },
        },
      });
      const ethPrice = Number(
        (await getTokens.find((data) => data.token_symbol === 'ETH'))
          .tokenPriceLogs[0].price,
      );
      const btcPrice = Number(
        (await getTokens.find((data) => data.token_symbol === 'BTC'))
          .tokenPriceLogs[0].price,
      );
      if (ethPrice > 0 && btcPrice > 0) {
        const btcAmount = (eth_amount * ethPrice) / btcPrice;
        const fee = eth_amount * this.feePercentage;
        result = {
          message: 'Success',
          data: {
            btc_amount: btcAmount,
            total_fee: {
              eth: fee,
              dollar: fee * Number(ethPrice),
            },
          },
        };
        return result;
      } else {
        return result;
      }
    } catch (error) {
      console.log({ error });
      return result;
    }
  }
}
