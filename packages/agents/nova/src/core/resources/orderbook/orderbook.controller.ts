import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrderbookGetApproveTxQueryDto, OrderbookSendApproveTxQueryDto, OrderbookSendResponseDto } from './dto/approve.dto';
import { OrderbookService } from './orderbook.service';
import { ethers } from 'ethers';
import { Post } from '@nestjs/common';
import { Body } from '@nestjs/common';

@ApiTags('orderbook')
@Controller('orderbook')
export class OrderbookController {
  constructor(private readonly orderbookService: OrderbookService) {}

  /**
 * Creates an approval transaction to allow spending tokens from the user's wallet.
 * @param query The query containing asset address and amount details.
 * @returns A promise that resolves to an ethers.TransactionRequest object representing the approval transaction.
 */
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get transaction for approve',
    type: OrderbookGetApproveTxQueryDto,
  })
  @Get('create-approve')
  createApproveTransaction(
    @Query() query: OrderbookGetApproveTxQueryDto,
  ): Promise<ethers.TransactionRequest> {
    return this.orderbookService.createApproveTransaction(query);
  }

  /**
   * Creates a pending order in the orderbook and sends the approval transaction to Gelato.
   * @param query The query containing amount, wallet addresses, signed transaction, and strategy type details.
 */
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Send approve tx',
    type: OrderbookSendResponseDto,
  })
  @Post('send-approve')
  async sendApprove(@Body() body: OrderbookSendApproveTxQueryDto): Promise<void> {
    return await this.orderbookService.sendApproveTransaction(body);
  }

  /**
   * Creates a pending order in the orderbook and sends the approval transaction to Gelato.
   * @param query The query containing amount, wallet addresses, signed transaction, and strategy type details.
 */
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Batch execute orders',
    type: OrderbookSendResponseDto,
  })
  @Post('batch-execute')
  async batch(): Promise<void> {
    return await this.orderbookService.handleBatchExecuteOrders();
  }
}
