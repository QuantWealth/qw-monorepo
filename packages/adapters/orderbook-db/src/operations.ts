import { IOrder, IUser, OrderModel, UserModel } from "./schema";

/**
 * Retrieves all orders associated with a specific user wallet.
 * @param userWallet - The wallet address of the user to fetch orders for.
 * @returns A promise resolving to an array of orders linked to the given wallet address.
 */
function getUserOrders(userWallet: string) {
  return OrderModel.find({ wallet: userWallet });
}

/**
 * Retrieves all orders associated with a specific signer.
 * @param userSigner - The signer identifier to fetch orders for.
 * @returns A promise resolving to an array of orders linked to the given signer.
 */
function getUserOrdersBySigner(userSigner: string) {
  return OrderModel.find({ signer: userSigner });
}

/**
 * Submits a new order to the database.
 * @param orderData - The order data to be saved.
 * @returns A promise that resolves with the saved order document.
 */
function submitOrder(orderData: IOrder) {
  const order = new OrderModel(orderData);
  return order.save();
}

/**
 * Marks an order as executed based on its ID.
 * @param orderId - The ID of the order to be marked as executed.
 * @returns A promise resolving to the result of the update operation.
 */
function executeOrder(orderId: string) {
  return OrderModel.updateOne({ id: orderId }, { status: "E" });
}

/**
 * Cancels an order by updating its status to "Canceled".
 * @param orderId - The ID of the order to cancel.
 * @returns A promise resolving to the result of the update operation.
 */
function cancelOrder(orderId: string) {
  return OrderModel.updateOne({ id: orderId }, { status: "C" });
}

/**
 * Retrieves a single order by its ID.
 * @param orderId - The ID of the order to retrieve.
 * @returns A promise resolving to the order document or null if not found.
 */
function getOrder(orderId: string) {
  return OrderModel.findOne({ id: orderId });
}

/**
 * Retrieves orders based on a set of criteria including time range, status, and distribution type.
 * @param start - The start of the timestamp range for filtering orders.
 * @param end - The end of the timestamp range for filtering orders.
 * @param status - Optional. The status of the orders to filter (e.g., "P", "E", "C").
 * @param distribution - Optional. The distribution flag of the orders to filter (true for credit, false for debit).
 * @returns A promise resolving to an array of orders that match the given criteria.
 */
function getOrders(start: number, end: number, status?: string, distribution?: boolean) {
  const query: any = {
    timestamp: { $gte: start, $lte: end }
  };
  if (status) query.status = status;
  if (distribution !== undefined) query.distribution = distribution;
  
  return OrderModel.find(query);
}

function getUser(id: string) {
  return UserModel.findOne({ id });
}

function createUser(user: IUser) {
  return UserModel.create(user);
}

export { getUserOrders, getUserOrdersBySigner, submitOrder, executeOrder, cancelOrder, getOrder, getOrders, getUser, createUser };
