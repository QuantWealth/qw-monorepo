import { Injectable } from '@nestjs/common';
import {
  getUserOrders,
  getUserOrdersBySigner,
  submitOrder,
  executeOrder,
  cancelOrder,
  getOrder,
  getOrders,
  getUser,
  createUser,
  IOrder,
  IUser
} from '@qw/orderbook-db';

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

  executeOrder(orderId: string, hashes: string[]) {
    return executeOrder(orderId, hashes);
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

  getUser(id: string) {
    return getUser(id);
  }

  createUser(user: IUser) {
    return createUser(user);
  }
}
