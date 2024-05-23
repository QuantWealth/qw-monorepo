import { TransactionState } from "./state";
import { BigNumber, ethers } from "ethers";

// Transaction type for write transactions, used in tracking on-chain tx via local storage.
export interface Transaction {
  chainId: number;
  nonce: number;
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
  ethersTransaction?: ethers.providers.TransactionResponse;
}
