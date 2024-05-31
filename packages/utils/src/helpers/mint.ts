import { ethers, Interface } from "ethers";

const ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "mint",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const erc20Interface = new Interface(ABI);

interface MintParams {
  contractAddress: string;
  amount: BigInt;
  rpcUrl: string;
  recipientAddress: string;
}

interface MintTransactionResponse {
  to: string;
  value: number;
  data: string;
}

export const mint: (params: MintParams) => Promise<MintTransactionResponse> = async ({ contractAddress, amount, rpcUrl, recipientAddress }) => {
  try {
    // Connect to the Ethereum network
    const provider = new ethers.JsonRpcProvider(rpcUrl);
  
    // Connect to the ERC-20 contract
    const erc20Contract = new ethers.Contract(contractAddress, ABI, provider);
    const data = erc20Contract.interface.encodeFunctionData('mint', [recipientAddress, amount]);

    const transactionObj: MintTransactionResponse = {
      to: contractAddress,
      value: 0,
      data: data
    };
    return transactionObj;
  } catch (error) {
    console.error("Error creating mint transaction:", error);
    throw error;
  }
}
