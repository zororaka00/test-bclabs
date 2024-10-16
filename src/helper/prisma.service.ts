import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super();

    // Middleware to convert BigInt and Decimal to number
    this.$use(async (params, next) => {
      const result = await next(params);

      const convertBigIntAndDecimalToNumber = (obj: any) => {
        if (Array.isArray(obj)) {
          return obj.map(convertBigIntAndDecimalToNumber);
        }

        if (typeof obj === 'object' && obj !== null) {
          for (const key in obj) {
            if (typeof obj[key] === 'bigint') {
              obj[key] = Number(obj[key]);
            } else if (obj[key] instanceof Prisma.Decimal) {
              obj[key] = parseFloat(obj[key].toString());
            } else if (typeof obj[key] === 'object') {
              convertBigIntAndDecimalToNumber(obj[key]);
            }
          }
        }
        return obj;
      };

      return convertBigIntAndDecimalToNumber(result);
    });
  }

  async onModuleInit() {
    this.logger.log('Connecting to database...');
    try {
      await this.$connect();
      this.logger.log('Successfully connected to database');
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async getHourlyTokenPrices(tokenId: number) {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const hourlyPrices = await this.$queryRaw`
        WITH hours AS (
          SELECT generate_series(
            date_trunc('hour', ${twentyFourHoursAgo}::timestamp),
            date_trunc('hour', ${now}::timestamp),
            '1 hour'::interval
          ) AS hour
        ),
        latest_prices AS (
          SELECT DISTINCT ON (date_trunc('hour', created_at))
            date_trunc('hour', created_at) AS hour,
            price,
            created_at
          FROM "TokenPriceLogs"
          WHERE token_id = ${tokenId}
            AND created_at >= ${twentyFourHoursAgo}
            AND created_at <= ${now}
          ORDER BY date_trunc('hour', created_at), created_at DESC
        )
        SELECT 
          h.hour,
          COALESCE(lp.price, 0) AS price,
          COALESCE(lp.created_at, h.hour) AS created_at
        FROM hours h
        LEFT JOIN latest_prices lp ON h.hour = lp.hour
        ORDER BY h.hour
      `;

    return (hourlyPrices as any[]).map((row) => ({
      price: Number(row.price),
      created_at: row.created_at,
    }));
  }
}
