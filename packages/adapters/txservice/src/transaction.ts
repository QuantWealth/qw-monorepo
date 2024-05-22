import { TransactionState } from "./state";

// Base Transaction type for read transactions
export interface ReadTransaction {
  chainId: number;
  nonce: number;
  gasLimit?: string;
  state: TransactionState;
  error?: string;
  confirmations?: number;
}

// Extended Transaction type for write transactions
export interface WriteTransaction extends ReadTransaction {
  hash?: string; // Optional property for write transactions
  attempt?: number;
  bumps?: number;
  minedBlockNumber?: number;
  confirmedBlockNumber?: number;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}
