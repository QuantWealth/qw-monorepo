import mongoose from "mongoose";

/// Order Schema
export interface IOrder {
  id: string;
  signer: string;
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
  signer: { type: String, required: true },
  wallet: { type: String, required: true },
  timestamp: { type: Number, required: true },
  dapps: [{ type: String, required: true }],
  distribution: { type: Boolean, required: true },
  amounts: [{ type: String, required: true }],
  signatures: [{ type: String, required: true }],
  status: { type: String, enum: ["P", "E", "C"], required: true },
});
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
  }
  next();
});

/// User Schema
export interface IUser {
  id: string;
  wallet: string;
  deployed: boolean;
}
const UserSchema = new mongoose.Schema<IUser>(
  {
    id: { type: String, required: true, unique: true },
    wallet: { type: String, required: true },
    deployed: { type: Boolean, required: true },
  },
  { timestamps: true }
);

/// Models
const OrderModel = mongoose.model<IOrder>("Order", OrderSchema);
const UserModel = mongoose.model<IUser>("User", UserSchema);

export { OrderModel, UserModel };
