import mongoose from "mongoose";

/// Order Schema
/// TODO: amounts, dapps, signatures, stratrgyType need to be in a object[] 
interface MetaTransactionData  {
  to: string;
  value: string;
  data: string;
}
interface IOrder {
  id: string;
  signer: string; // signer address
  wallet: string; // SCW wallet address
  timestamps: {
    placed: Date;
    executed?: Date;
    cancelled?: Date;
  };
  dapps: string[];
  distribution?: boolean;
  amounts: string[];
  signatures?: MetaTransactionData[];
  status: "P" | "E" | "C"; // Pending, Executed, Canceled
  hashes?: string[]; // Optional array of transaction hashes
  strategyType: "FLEXI" | "FIXED";
}

const OrderSchema = new mongoose.Schema<IOrder>({
  id: { type: String, required: true, unique: true },
  signer: { type: String, required: true },
  wallet: { type: String, required: true },
  timestamps: {
    placed: { type: Date, required: true },
    executed: { type: Date },
    cancelled: { type: Date }
  },
  dapps: [{ type: String, required: true }],
  distribution: { type: Boolean, required: false },
  amounts: [{ type: String, required: true }],
  signatures: [{ 
    to: { type: String, required: true },
    value: { type: String, required: true },
    data: { type: String, required: true }
   }],
  status: { type: String, enum: ["P", "E", "C"], required: true },
  hashes: [{ type: String }],
  strategyType: { type: String, enum: ["FLEXI", "FIXED"], required: true },
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
    this.timestamps.placed = new Date();
  }
  next();
});

/// User Schema
interface IUser {
  id: string;
  wallet: string;
  network: string;
  deployed: boolean;
  providers: string[];
}
const UserSchema = new mongoose.Schema<IUser>(
  {
    id: { type: String, required: true, unique: true },
    wallet: { type: String, required: true },
    network: { type: String, required: true },
    deployed: { type: Boolean, required: true },
    providers: [{ type: String, required: true }],
  },
  { timestamps: true }
);

/// Models
const OrderModel = mongoose.model<IOrder>("Order", OrderSchema);
const UserModel = mongoose.model<IUser>("User", UserSchema);

export { OrderModel, IOrder, UserModel, IUser, UserSchema, OrderSchema };
