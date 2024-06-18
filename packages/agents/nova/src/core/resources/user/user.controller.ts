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
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { IUser } from '@qw/orderbook-db';
import { UserBalanceQueryDto } from './dto/user-balance-query.dto';
import { UserBalanceResponseDto } from './dto/user-balance-response.dto';
import { UserDataQueryDto } from './dto/user-data-query.dto';
import { UserInitBodyDto } from './dto/user-init-body.dto';
import {
  UserInitResponseDto,
  UserResponseDto,
} from './dto/user-init-response.dto';
import { UserSendTxBodyDto } from './dto/user-send-tx-body.dto';
import { UserService } from './user.service';
import { UserSignatureQueryDto } from './dto/user-signature-query.dto';

@ApiTags('user')
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
  async userInit(@Body() body: UserInitBodyDto): Promise<UserResponseDto> {
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

  /**
   * Submits transaction
   * @param {UserSendTxBodyDto} body - body containing signed transaction
   * @returns user data
   */
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Submit transaction',
    type: UserSendTxBodyDto,
  })
  @Post('sendTx')
  async sendTx(@Body() body: UserSendTxBodyDto): Promise<void> {
    return await this.userService.sendTx(body);
  }

  /**
   * Retrieves user sign tx
   * @param {UserSignatureQueryDto} query - query params containing user wallet address and the way returned data should be arranged
   * @returns userTokenBalance array
   */
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get Signature',
    type: UserSignatureQueryDto,
  })
  @Get('signature')
  getSignature(@Query() query: UserSignatureQueryDto): Promise<string> {
    return this.userService.getSignature(query);
  }
}
