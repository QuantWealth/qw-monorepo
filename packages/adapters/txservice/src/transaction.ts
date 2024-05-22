import { TransactionState } from './state';

// Base Transaction type for read transactions.
export interface ReadTransaction {
  nonce: number;
  gasLimit: string;
  state: TransactionState;
  error?: string;
  confirmations?: number;
}

// Extended Transaction type for write transactions.
export interface WriteTransaction extends ReadTransaction {
  hash?: string;
  attempt?: number;
  bumps?: number;
  minedBlockNumber?: number;
  confirmedBlockNumber?: number;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  error?: string;
  confirmations?: number;
}
