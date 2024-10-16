import Moralis from 'moralis';

export interface ITokenPrice {
  tokenAddress;
  exchange: 'uniswapv3';
}

export class Web3Class {
  async getPrices(tokenPrices: ITokenPrice[]) {
    const response = await Moralis.EvmApi.token.getMultipleTokenPrices(
      {
        chain: '0x1',
        include: 'percent_change',
      },
      {
        tokens: tokenPrices,
      },
    );

    return response.toJSON();
  }
}
