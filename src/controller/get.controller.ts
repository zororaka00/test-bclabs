import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';

import { UserService } from 'src/service/user.service';
import { ISwapRate, RPrices, RSwapRate } from './dto';

@ApiTags('User (GET)')
@Controller()
export class UserGetController {
  constructor(private readonly userService: UserService) {}

  @Get('prices')
  @ApiResponse(RPrices)
  async get_prices(@Res() res) {
    const result = await this.userService.get_prices();
    return res
      .status(200)
      .header('Content-Type', 'application/json; charset=utf-8')
      .json(result);
  }

  @Get('swap/rate')
  @ApiResponse(RSwapRate)
  async get_swap_rate(@Query() dataQuery: ISwapRate, @Res() res) {
    const result = await this.userService.get_swap_rate(dataQuery.eth_amount);
    return res
      .status(200)
      .header('Content-Type', 'application/json; charset=utf-8')
      .json(result);
  }
}
