import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { Transaction } from 'src/common/dto/transaction';
import { UserBalanceQueryDto } from './dto/user-balance-query.dto';
import { UserInitBodyDto } from './dto/user-init-body.dto';
import { UserInitResponseDto } from './dto/user-init-response.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  /**
   * Retrieves user token balance
   * @param {UserBalanceQueryDto} query - query params containing user wallet address and the way returned data should be arranged
   * @returns userTokenBalance array
   */
  @HttpCode(HttpStatus.OK)
  @Get('balance')
  getUserBalance(@Query() query: UserBalanceQueryDto) {
    return this.userService.getUserBalance(query);
  }

  /**
   * Retrieves user token balance
   * @param {UserBalanceQueryDto} query - query params containing user wallet address and the way returned data should be arranged
   * @returns userTokenBalance array
   */
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Transaction for SA deployment',
    type: UserInitResponseDto,
  })
  @Post('init')
  async userInit(@Body() query: UserInitBodyDto): Promise<Transaction> {
    return await this.userService.userInit(query);
  }
}
