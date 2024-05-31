import { Controller, Get, Post, Param, Body, Query, Put, Delete, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { IOrder } from 'qw-orderbook-db';
import { GuardianAuthGuard } from './guardian-auth.guard';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('user/:wallet')
  getUserOrders(@Param('wallet') wallet: string) {
    // TODO: Implement user auth.
    return this.orderService.getUserOrders(wallet);
  }

  @Get('signer/:signer')
  getUserOrdersBySigner(@Param('signer') signer: string) {
    // TODO: Implement user auth.
    return this.orderService.getUserOrdersBySigner(signer);
  }

  @Post('submit')
  submitOrder(@Body() orderData: IOrder) {
    // TODO: Implement user auth.
    return this.orderService.submitOrder(orderData);
  }

  @Put('execute/:id')
  @UseGuards(GuardianAuthGuard)
  executeOrder(@Param('id') id: string, @Body('hashes') hashes: string[]) {
    // TODO: GuardianAuthGuard uses keys in plaintext, should be hashed and salted.
    return this.orderService.executeOrder(id, hashes);
  }

  @Delete('cancel/:id')
  cancelOrder(@Param('id') id: string) {
    // TODO: Implement user auth.
    return this.orderService.cancelOrder(id);
  }

  @Get(':id')
  getOrder(@Param('id') id: string) {
    return this.orderService.getOrder(id);
  }

  @Get()
  getOrders(
    @Query('start') start: number,
    @Query('end') end: number,
    @Query('status') status?: string,
    @Query('distribution') distribution?: boolean
  ) {
    return this.orderService.getOrders(start, end, status, distribution);
  }
}
