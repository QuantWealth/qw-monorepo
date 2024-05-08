import mongoose, { Schema, Document, Model } from "mongoose";

/// Strategy Subdocument Schema
// Maximum number of dapps that can be linked here.
const STRATEGY_DAPPS_LIMIT = 30; // TODO: Move to config or constants file
export interface IStrategy extends Document {
  ip: string;       // Hostname.
  name: string;     // Colloquial name.
  inputs: string[]; // List of keys for input data requirement.
  dapps: string[];  // List of dapp addresses this strategy uses.
  iat: number;      // Insolvent Amount Tolerance (%).
  active: boolean;  // Whether this strategy is online/active.
  metadata: any;    // Any extra data that needs to be documented.
  // TODO: Could also include chain IDs, operations that need to be executed for the strategy, etc.
}
const StrategySchema: Schema<IStrategy> = new Schema({
  id: { type: String, required: true, unique: true, length: 32 },
  ip: { type: String, required: true },
  name: { type: String, required: true },
  inputs: { type: [String], required: true },
  dapps: {
    type: [String],
    required: true,
    validate: [
      (val: string[]) => val.length <= STRATEGY_DAPPS_LIMIT,
      `Strategy exceeds the limit for dapps. Limit: ${STRATEGY_DAPPS_LIMIT}`
    ]
  },
  active: { type: Boolean, required: true },
  iat: { type: Number, required: true },
  metadata: Schema.Types.Mixed
});

/// Strategy Directory Schema
export interface IDirectory extends Document {
  strategies: {
    [key: string]: IStrategy;
  };
}
const DirectorySchema: Schema<IDirectory> = new Schema({
  strategies: {
    type: Map,
    of: StrategySchema
  }
});
  

/// Asset Data Subdocument Schema
// Asset pair market data: [timestamp, volume, open, close]
export type AssetDataTuple = [number, number, number, number];
export interface IAssetData {
  series: AssetDataTuple[];
}
const AssetDataSchema: Schema<IAssetData> = new Schema({
  series: {
    type: [[Number]], // Array of arrays to hold the tuple data.
    required: true
  }
});

/// TVL Data Subdocument Schema
// Strategy TVL data tuple: [timestamp, amount]
export type TVLDataTuple = [number, number];
export interface ITVLData {
  series: TVLDataTuple[]; 
}
const TVLDataSchema: Schema<ITVLData> = new Schema({
  series: {
    type: [[Number]],
    required: true
  }
});

/// Market Data Schema
export interface IMarketData extends Document {
  // TVL is keyed by strategy ID.
  tvl: Map<string, ITVLData>;
  // Assets map is keyed by asset pairs, like "USDT-ETH".
  assets: Map<string, IAssetData>
  // ... other data like sentiment analysis, order books, etc
}
const MarketDataSchema: Schema<IMarketData> = new Schema({
  tvl: { type: Map, of: TVLDataSchema },
  assets: { type: Map, of: AssetDataSchema }
});


/// Models
export const Strategy: Model<IStrategy> = mongoose.model<IStrategy>("Strategy", StrategySchema);
export const Directory: Model<IDirectory> = mongoose.model<IDirectory>("Directory", DirectorySchema);

export const AssetData: Model<IAssetData> = mongoose.model<IAssetData>("AssetData", AssetDataSchema);
export const TVLData: Model<ITVLData> = mongoose.model<ITVLData>("TVLData", TVLDataSchema);
export const MarketData: Model<IMarketData> = mongoose.model<IMarketData>("MarketData", MarketDataSchema);
