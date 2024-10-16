import {
    Controller,
    Body,
    Res,
    Post,
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';

import { UserService } from 'src/service/user.service';
import { ISetAlert, RSetAlert } from './dto';

@ApiTags('User (POST)')
@Controller()
export class UserPostController {
    constructor(private readonly userService: UserService) {}

    @Post('alert/set')
    @ApiResponse(RSetAlert)
    async set_alert(@Body() dataBody: ISetAlert, @Res() res) {
        const result = await this.userService.set_alert(dataBody);
        return res
            .status(200)
            .header('Content-Type', 'application/json; charset=utf-8')
            .json(result);
    }
}
