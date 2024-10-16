import {
    ApiProperty,
    ApiResponseOptions,
  } from '@nestjs/swagger';
  import { IsOptional, IsString, IsArray } from 'class-validator';
  
  
const DefaultResponse = {
    status: 200,
    message: 'Success',
};
  
export const RPrices: ApiResponseOptions = {
    status: 200,
    description: 'API - returning the prices of each hour (within 24hours)',
    schema: {
        example: {
            ...DefaultResponse,
            data: [
                {
                    token_name: 'Ethereum',
                    token_symbol: 'ETH',
                    decimals: 18,
                    token_address: '0x...',
                    prices: [
                        {
                            price: 1234,
                            created_at: "2023-10-15T03:00:00.000Z"
                        }
                    ]
                }
            ],
        },
    },
};
  
export class ISetAlert {
    @ApiProperty({ type: String, required: true })
    @IsString()
    token_symbol: string;

    @ApiProperty({ type: Number, required: true })
    dollar: number;

    @ApiProperty({ type: String, required: true })
    @IsString()
    email: string;
}
  
export const RSetAlert: ApiResponseOptions = {
    status: 200,
    description: 'API  - setting alert for specific price.(parameters are chain, dollar, email) -> I change chain to token_symbol',
    schema: {
        example: {
            ...DefaultResponse,
            data: {
                id: 1234,
                token_name: 'Ethereum',
                token_symbol: 'ETH',
                dollar: 2000,
                email: 'example@gmail.com'
            },
        },
    },
};
  
export class ISwapRate {
    @ApiProperty({ type: Number, required: true })
    eth_amount: number;
}
  
export const RSwapRate: ApiResponseOptions = {
    status: 200,
    description: 'API - get swap rate (eth to btc)',
    schema: {
        example: {
            ...DefaultResponse,
            data: {
                btc_amount: 1234,
                total_fee: {
                  eth: 1234,
                  dollar: 1234
                }
            },
        },
    },
};