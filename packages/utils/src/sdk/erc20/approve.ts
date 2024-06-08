import { ethers, TransactionRequest } from "ethers";
import {ERC20_ABI} from "../../constants"
import { Transaction } from "@safe-global/safe-core-sdk-types";

export type ApproveParams = {
  contractAddress: string;
  amount: BigInt;
  provider: ethers.JsonRpcApiProvider;
  spender: string;
}

export const approve =  (params: ApproveParams): Transaction => {

  const { contractAddress, amount, provider, spender } = params;
  try {
    // Connect to the ERC-20 contract
    const erc20Contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
    const data = erc20Contract.interface.encodeFunctionData('approve', [spender, amount]);

    const transactionObj: Transaction = {
      to: contractAddress,
      data: data,
      value: '0',
    };
    return transactionObj;
  } catch (error) {
    console.error("Error creating approve transaction:", error);
    throw error;
  }
}
