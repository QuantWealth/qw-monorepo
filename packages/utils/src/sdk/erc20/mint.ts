import { ethers, TransactionRequest } from "ethers";
import {ERC20_ABI} from "../../constants"

export type MintParams = {
  contractAddress: string;
  amount: BigInt;
  provider: ethers.JsonRpcApiProvider;
  recipientAddress: string;
}

export const mint =  (params: MintParams): TransactionRequest => {

  const { contractAddress, amount, provider, recipientAddress } = params;
  try {
    // Connect to the ERC-20 contract
    const erc20Contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
    const data = erc20Contract.interface.encodeFunctionData('mint', [recipientAddress, amount]);

    const transactionObj: TransactionRequest = {
      to: contractAddress,
      data: data
    };
    return transactionObj;
  } catch (error) {
    console.error("Error creating mint transaction:", error);
    throw error;
  }
}
