import { Controller, Get, Post, Param, Body } from "@nestjs/common";
import { OrderService } from "./order.service";
import { IOrder } from "./schema";

@Controller("orders")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get("user/:wallet")
  getUserOrders(@Param("wallet") wallet: string) {
    return this.orderService.getUserOrders(wallet);
  }

  @Get("signer/:signer")
  getUserOrdersBySigner(@Param("signer") signer: string) {
    return this.orderService.getUserOrdersBySigner(signer);
  }

  @Post("submit")
  submitOrder(@Body() orderData: IOrder) {
    return this.orderService.submitOrder(orderData);
  }

  @Post("execute/:id")
  executeOrder(@Param("id") id: string) {
    return this.orderService.executeOrder(id);
  }

  @Post("cancel/:id")
  cancelOrder(@Param("id") id: string) {
    return this.orderService.cancelOrder(id);
  }

  @Get(":id")
  getOrder(@Param("id") id: string) {
    return this.orderService.getOrder(id);
  }

  @Get()
  getOrders(
    @Param("start") start: number,
    @Param("end") end: number,
    @Param("status") status?: string,
    @Param("distribution") distribution?: boolean
  ) {
    return this.orderService.getOrders(start, end, status, distribution);
  }
}
