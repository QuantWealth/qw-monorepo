import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { GetUserBalanceDto } from './dto/get-user-balance.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Retrieves user token balance
   * @param {GetUserBalanceDto} query - query params containing user wallet address and they way returned data should be arranged
   * @returns userTokenBalance array
   */
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
