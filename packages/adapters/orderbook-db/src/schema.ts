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
  protocols: {
    [protocol: string]: {
      amount: string;
      signature?: MetaTransactionData;
    }
  };
  distribution: boolean;
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
  protocols: {
    type: Map,
    of: new mongoose.Schema({
      amount: { type: String, required: true },
      signature: {
        to: { type: String },
        value: { type: String },
        data: { type: String }
      }
    })
  },
  distribution: { type: Boolean, required: true },
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

/// Shares Schema
interface IShares {
  count: number;
  protocols: {
    [protocol: string]: {
      totalShares: number;
      userShares: {
        [user: string]: number;
      };
    };
  };
}
const SharesSchema = new mongoose.Schema<IShares>({
  count: { type: Number, required: true },
  protocols: {
    type: Map,
    of: new mongoose.Schema({
      totalShares: { type: Number, required: true },
      userShares: {
        type: Map,
        of: Number,
        required: true
      }
    }),
    required: true
  }
});

/// Epoch Schema
// We track one batch per protocol, which will be composed of many users' contributions.
interface IOpenBatch {
  protocol: string;
  userContributions: {
    [user: string]: number;
  };
  amount: number; // Token amount for open.
}
const OpenBatchSchema = new mongoose.Schema<IOpenBatch>({
  protocol: { type: String, required: true },
  userContributions: {
    type: Map,
    of: Number,
    required: true
  },
  amount: { type: Number, required: true }
});

interface ICloseBatch {
  protocol: string;
  userContributions: {
    [user: string]: number;
  };
  amount: number; // Shares amount for close.
  liquidation: number; // Percentage of holdings to liquidate.
}
const CloseBatchSchema = new mongoose.Schema<ICloseBatch>({
  protocol: { type: String, required: true },
  userContributions: {
    type: Map,
    of: Number,
    required: true
  },
  amount: { type: Number, required: true },
  liquidation: { type: Number, required: true }
});

interface IEpoch {
  // Index tracks the order of epochs. To get the current epoch index, retrieve epoch
  // with the highest value index.
  index: number;
  timestamp: Date;
  opens: {
    orders: string[];
    txs: {
      hash: string;
      batches: IOpenBatch[];
    }[];
  };
  closes: {
    orders: string[];
    txs: {
      hash: string;
      batches: ICloseBatch[];
    }[];
  };
}
const EpochSchema = new mongoose.Schema<IEpoch>({
  index: { type: Number, required: true, unique: true },
  timestamp: { type: Date, required: true },
  opens: {
    orders: [{ type: String, required: true }],
    txs: [
      {
        hash: { type: String, required: true },
        batches: [OpenBatchSchema]
      }
    ]
  },
  closes: {
    orders: [{ type: String, required: true }],
    txs: [
      {
        hash: { type: String, required: true },
        batches: [CloseBatchSchema]
      }
    ]
  }
});

/// Models
const OrderModel = mongoose.model<IOrder>("Order", OrderSchema);
const UserModel = mongoose.model<IUser>("User", UserSchema);
const SharesModel = mongoose.model<IShares>("Shares", SharesSchema);
const EpochModel = mongoose.model<IEpoch>("Epoch", EpochSchema);

export {
  OrderModel,
  IOrder,
  OrderSchema,
  UserModel,
  IUser,
  UserSchema,
  SharesModel,
  IShares,
  SharesSchema,
  EpochModel,
  IEpoch,
  EpochSchema,
  IOpenBatch,
  OpenBatchSchema,
  ICloseBatch,
  CloseBatchSchema,
};
