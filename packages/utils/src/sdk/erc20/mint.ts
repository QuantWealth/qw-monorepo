import { ethers } from "ethers";
import {ERC20_ABI} from "../../constants";
import { Transaction } from '@safe-global/safe-core-sdk-types';

export type MintParams = {
  contractAddress: string;
  amount: BigInt;
  provider: ethers.JsonRpcApiProvider;
  recipientAddress: string;
}

export const mint =  (params: MintParams): Transaction => {

  const { contractAddress, amount, provider, recipientAddress } = params;
  try {
    // Connect to the ERC-20 contract
    const erc20Contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
    const data = erc20Contract.interface.encodeFunctionData('mint', [recipientAddress, amount]);

    const transactionObj: Transaction = {
      to: contractAddress,
      data: data,
      value: '0',
    };
    return transactionObj;
  } catch (error) {
    console.error("Error creating mint transaction:", error);
    throw error;
  }
}
