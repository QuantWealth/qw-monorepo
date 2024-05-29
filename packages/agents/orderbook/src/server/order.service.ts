import { Injectable } from "@nestjs/common";
import { getUserOrders, getUserOrdersBySigner, submitOrder, executeOrder, cancelOrder, getOrder, getOrders } from "./operations";
import { IOrder } from "qw-orderbook-db";

@Injectable()
export class OrderService {
  getUserOrders(userWallet: string) {
    return getUserOrders(userWallet);
  }

  getUserOrdersBySigner(userSigner: string) {
    return getUserOrdersBySigner(userSigner);
  }

  submitOrder(orderData: IOrder) {
    return submitOrder(orderData);
  }

  executeOrder(orderId: string) {
    return executeOrder(orderId);
  }

  cancelOrder(orderId: string) {
    return cancelOrder(orderId);
  }

  getOrder(orderId: string) {
    return getOrder(orderId);
  }

  getOrders(start: number, end: number, status?: string, distribution?: boolean) {
    return getOrders(start, end, status, distribution);
  }
}
