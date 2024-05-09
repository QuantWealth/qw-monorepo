import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { GetUserBalanceDto } from './dto/get-user-balance.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(HttpStatus.OK)
  @Get('balance')
  getUserBalance(@Query() query: GetUserBalanceDto) {
    const data = this.userService.getUserBalance();

    return {
      statusCode: HttpStatus.OK,
      message: 'Retrieved token balance successfully',
      data,
    };
  }
}
