import { TransactionState } from "./state";
import { ethers } from "ethers";

// Transaction type for write transactions, used in tracking on-chain tx via local storage.
export interface Transaction {
  chainId: number;
  to: string;
  data: string;
  value: string;
  nonce?: number;
  gasLimit?: string;
  state: TransactionState;
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
  response?: ethers.providers.TransactionResponse;
  receipt?: ethers.providers.TransactionReceipt;
}
