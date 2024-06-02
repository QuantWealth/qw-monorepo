import { BalancesResponse } from '@covalenthq/client-sdk';
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
import { IUser } from '@qw/orderbook-db';
import { UserBalanceQueryDto } from './dto/user-balance-query.dto';
import { UserBalanceResponseDto } from './dto/user-balance-response.dto';
import { UserDataQueryDto } from './dto/user-data-query.dto';
import { UserInitBodyDto } from './dto/user-init-body.dto';
import { UserInitResponseDto } from './dto/user-init-response.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Retrieves user token balance
   * @param {UserBalanceQueryDto} query - query params containing user wallet address and the way returned data should be arranged
   * @returns userTokenBalance array
   */
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transaction for SA deployment',
    type: UserBalanceResponseDto,
  })
  @Get('balance')
  getUserBalance(
    @Query() query: UserBalanceQueryDto,
  ): Promise<BalancesResponse> {
    return this.userService.getUserBalance(query);
  }

  /**
   * Deploys SCW for user
   * @param {UserInitBodyDto} body - body params containing user wallet address and wallet provider
   * @returns transaction for SCW deployment
   */
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Transaction for SA deployment',
    type: UserInitResponseDto,
  })
  @Post('init')
  async userInit(@Body() body: UserInitBodyDto): Promise<void> {
    return await this.userService.userInit(body);
  }

  /**
   * Retrieves user scw data
   * @param {UserDataQueryDto} query - query params containing user wallet address
   * @returns user data
   */
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transaction for SA deployment',
    type: UserDataQueryDto,
  })
  @Get('data')
  async userData(@Query() query: UserDataQueryDto): Promise<IUser> {
    return await this.userService.userData(query);
  }
}
