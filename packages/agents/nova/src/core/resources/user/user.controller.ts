import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { UserBalanceQuery } from './dto/user-balance-query.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Retrieves user token balance
   * @param {UserBalanceQuery} query - query params containing user wallet address and the way returned data should be arranged
   * @returns userTokenBalance array
   */
  @HttpCode(HttpStatus.OK)
  @Get('balance')
  getUserBalance(@Query() query: UserBalanceQuery) {
    const data = this.userService.getUserBalance();

    return {
      statusCode: HttpStatus.OK,
      message: 'Retrieved token balance successfully',
      data,
    };
  }
}
