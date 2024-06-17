import { IOrder, IUser, OrderModel, UserModel } from "./schema";

/**
 * Retrieves all orders associated with a specific user wallet.
 * @param userWallet - The wallet address of the user to fetch orders for.
 * @returns A promise resolving to an array of orders linked to the given wallet address.
 */
async function getUserOrders(userWallet: string): Promise<IOrder[]> {
  return await OrderModel.find({ wallet: userWallet }).exec();
}

/**
 * Retrieves all orders associated with a specific signer.
 * @param userSigner - The signer identifier to fetch orders for.
 * @returns A promise resolving to an array of orders linked to the given signer.
 */
async function getUserOrdersBySigner(userSigner: string): Promise<IOrder[]> {
  return await OrderModel.find({ signer: userSigner }).exec();
}

/**
 * Submits a new order to the database.
 * @param orderData - The order data to be saved.
 * @returns A promise that resolves with the saved order document.
 */
async function submitOrder(orderData: IOrder): Promise<IOrder> {
  const order = new OrderModel(orderData);
  return await order.save();
}

/**
 * Marks an order as executed based on its ID and updates the executed timestamp.
 * @param orderId - The ID of the order to be marked as executed.
 * @param hashes - The array of transaction hashes related to the execution.
 * @returns A promise resolving to the result of the update operation.
 */
async function executeOrder(orderId: string, hashes: string[]): Promise<IOrder | null> {
  // Ensure the order exists.
  const order = await OrderModel.findOne({ id: orderId }).exec();
  if (!order) {
    throw new Error("Order does not exist.");
  }

  await OrderModel.updateOne(
    { id: orderId },
    {
      status: "E",
      "timestamps.executed": Date.now(),
      hashes: hashes
    }
  ).exec();

  return await OrderModel.findOne({ id: orderId }).exec();
}

/**
 * Cancels an order by updating its status to "Canceled" and setting the cancelled timestamp.
 * @param orderId - The ID of the order to cancel.
 * @returns A promise resolving to the result of the update operation.
 * @throws Error if the order is already executed.
 */
async function cancelOrder(orderId: string): Promise<IOrder | null> {
  // Ensure the order exists and is not executed.
  const order = await OrderModel.findOne({ id: orderId }).exec();
  if (!order) {
    throw new Error("Order does not exist.");
  }
  if (order.status === "E") {
    throw new Error("Cannot cancel executed order.");
  }

  await OrderModel.updateOne(
    { id: orderId },
    {
      status: "C",
      "timestamps.cancelled": Date.now()
    }
  ).exec();

  return await OrderModel.findOne({ id: orderId }).exec();
}

/**
 * Retrieves a single order by its ID.
 * @param orderId - The ID of the order to retrieve.
 * @returns A promise resolving to the order document or null if not found.
 */
async function getOrder(orderId: string): Promise<IOrder | null> {
  return await OrderModel.findOne({ id: orderId }).exec();
}

/**
 * Retrieves orders based on a set of criteria including time range, status, and distribution type.
 * @param start - The start of the timestamp range for filtering orders.
 * @param end - The end of the timestamp range for filtering orders.
 * @param status - Optional. The status of the orders to filter (e.g., "P", "E", "C").
 * @param distribution - Optional. The distribution flag of the orders to filter (true for credit, false for debit).
 * @returns A promise resolving to an array of orders that match the given criteria.
 */
async function getOrders(start: Date, end: Date, status?: string, distribution?: boolean): Promise<IOrder[]> {
  const query: any = {
    "timestamps.placed": { $gte: start, $lte: end }
  };
  if (status) query.status = status;
  if (distribution !== undefined) query.distribution = distribution;
  
  return await OrderModel.find(query).exec();
}

/**
 * Retrieves a user by their ID.
 * @param id - The ID of the user to retrieve.
 * @returns A promise resolving to the user document or null if not found.
 */
async function getUser(id: string): Promise<IUser | null> {
  return await UserModel.findOne({ id }).exec();
}

/**
 * Creates a new user in the database.
 * @param user - The user data to be saved.
 * @returns A promise that resolves with the saved user document.
 */
async function createUser(user: IUser): Promise<IUser> {
  return await UserModel.create(user);
}

/**
 * Retrieves a user by their signer.
 * @param signer - The signer identifier to fetch the user for.
 * @returns A promise resolving to the user document or null if not found.
 */
async function getUserBySigner(signer: string): Promise<IUser | null> {
  return await UserModel.findOne({ signer }).exec();
}

/**
 * Retrieves a user by their wallet address.
 * @param wallet - The wallet address to fetch the user for.
 * @returns A promise resolving to the user document or null if not found.
 */
async function getUserByWallet(wallet: string): Promise<IUser | null> {
  return await UserModel.findOne({ wallet }).exec();
}

export { getUserOrders, getUserOrdersBySigner, submitOrder, executeOrder, cancelOrder, getOrder, getOrders, getUser, createUser, getUserBySigner, getUserByWallet };
