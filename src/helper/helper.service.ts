import { Injectable } from '@nestjs/common';

import { EmailClass } from './classes/email';
import { ITokenPrice, Web3Class } from './classes/web3';

@Injectable()
export class HelperService {
  constructor(
    private readonly emailClass: EmailClass,
    private readonly web3Class: Web3Class,
  ) {}

  async sendAlert(
    token_string: string,
    increasePercentage: number,
  ): Promise<void> {
    await this.emailClass.sendAlert(token_string, increasePercentage);
  }

  async sendPriceAlert(
    email: string,
    token_string: string,
    currentPrice: number,
  ): Promise<void> {
    await this.emailClass.sendPriceAlert(email, token_string, currentPrice);
  }

  async getPrices(tokenPrices: ITokenPrice[]) {
    return await this.web3Class.getPrices(tokenPrices);
  }
}
