import mongoose from "mongoose";

/// User Data Schema
export interface IUser {
  id: string; // Unique identifier for the user
}
const UserSchema = new mongoose.Schema<IUser>({
  id: { type: String, required: true, unique: true },
});
  
/// Order Schema
export interface IOrder {
  id: string;
  user: string;
  wallet: string;
  timestamp: number;
  dapps: string[];
  distribution: boolean;
  amounts: string[];
  signatures: string[];
  status: "P" | "E" | "C"; // Pending, Executed, Canceled
}
const OrderSchema = new mongoose.Schema<IOrder>({
  id: { type: String, required: true, unique: true },
  user: { type: String, required: true },
  wallet: { type: String, required: true },
  timestamp: { type: Number, required: true },
  dapps: [{ type: String, required: true }],
  distribution: { type: Boolean, required: true },
  amounts: [{ type: String, required: true }],
  signatures: [{ type: String, required: true }],
  status: { type: String, enum: ["P", "E", "C"], required: true },
});

/// Models
const UserModel = mongoose.model<IUser>("User", UserSchema);
const OrderModel = mongoose.model<IOrder>("Order", OrderSchema);

export { UserModel, OrderModel };
