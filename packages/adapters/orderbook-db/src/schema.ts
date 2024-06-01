import mongoose from "mongoose";
import { Type, Static } from "@sinclair/typebox";

/// Order Schema
const OrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  signer: { type: String, required: true },
  wallet: { type: String, required: true },
  timestamps: {
    placed: { type: Number, required: true },
    executed: { type: Number },
    cancelled: { type: Number },
  },
  dapps: [{ type: String, required: true }],
  distribution: { type: Boolean, required: true },
  amounts: [{ type: String, required: true }],
  signatures: [{ type: String, required: true }],
  status: { type: String, enum: ["P", "E", "C"], required: true },
  hashes: [{ type: String }],
  strategyType: { type: String, enum: ["FLEXI", "FIXED"], required: true },
});

type IOrder = typeof OrderSchema;

// Pre-save middleware to set the order ID.
OrderSchema.pre("save", function (next) {
  // Assuming there is a 'signer' field or similar in the order data.
  // TODO: If 'signer' is not appropriate, adjust accordingly.
  // Set the ID as a hash of (timestamp, signer).
  if (this.isNew) {
    // Guarantee the status is "P" pending.
    this.status = "P";
    // TODO: Include once utils are ready:
    // this.id = keccak256(`${this.timestamp}-${this.wallet}`);
    this.timestamps.placed = Date.now();
  }
  next();
});

/// User Schema
const UserSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    wallet: { type: String, required: true },
    network: { type: String, required: true },
    deployed: { type: Boolean, required: true },
    providers: [{ type: String, required: true }],
  },
  { timestamps: true }
);

type IUser = typeof UserSchema;

/// Models
const OrderModel = mongoose.model<IOrder>("Order", OrderSchema);
const UserModel = mongoose.model<IUser>("User", UserSchema);

export { OrderModel, IOrder, UserModel, IUser };
