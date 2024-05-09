import { UserModel, IOrder, OrderModel } from "./schema";

// TODO: Add and get for user data.

// Retrieve orders by user ID
function getUserOrders(userId: string) {
  return OrderModel.find({ user: userId });
}

// Submit a new order
function submitOrder(orderData: IOrder) {
  const order = new OrderModel(orderData);
  return order.save();
}

// Mark an order as executed by ID
function executeOrder(orderId: string) {
  return OrderModel.updateOne({ id: orderId }, { status: "E" });
}

// Cancel an order by ID
function cancelOrder(orderId: string) {
  return OrderModel.updateOne({ id: orderId }, { status: "C" });
}

// Retrieve a single order by ID
function getOrder(orderId: string) {
  return OrderModel.findOne({ id: orderId });
}

// Retrieve orders based on criteria
function getOrders(start: number, end: number, status?: string, distribution?: boolean) {
  const query: any = {
    timestamp: { $gte: start, $lte: end }
  };
  if (status) query.status = status;
  if (distribution !== undefined) query.distribution = distribution;
  
  return OrderModel.find(query);
}

export { getUserOrders, submitOrder, executeOrder, cancelOrder, getOrder, getOrders };
