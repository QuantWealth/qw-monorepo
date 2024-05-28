import mongoose, { Mongoose } from "mongoose";

export * from "./operations";

/**
 * Connects to the Indexer MongoDB instance.
 * This function establishes a connection to the MongoDB database specified by the connection string.
 * It is designed to let any connection errors propagate, allowing higher-level handling or logging
 * mechanisms to deal with them.
 *
 * @param hostname - Address of the mongodb instance to connect to. Default: "mongodb://localhost/orderbook"
 *
 * @throws {MongooseError} Throws an error if the connection fails. (This can include network issues,
 * incorrect credentials, unauthorized access, or unavailable MongoDB service.)
 */
export async function connectOrderbookDB(hostname?: string): Promise<Mongoose> {
  return await mongoose.connect(
    hostname ? hostname : "mongodb://localhost/orderbook"
  );
}
