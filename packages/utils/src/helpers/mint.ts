import { ethers } from "ethers";

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

interface MintParams {
  privateKey: string;
  contractAddress: string;
  amount: BigInt;
  rpcUrl: string;
  recipientAddress: string;
}

const mint: (params: MintParams) => Promise<void> = async ({ privateKey, contractAddress, amount, rpcUrl, recipientAddress }) => {
  // Connect to the Ethereum network
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  // Connect to the ERC-20 contract
  const erc20Contract = new ethers.Contract(contractAddress, ABI, wallet);

  try {
    // Call the mint function
    const tx = await erc20Contract.mint(recipientAddress, amount);
    console.log("Mint transaction hash:", tx.hash);

    // Wait for the transaction to be confirmed
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block", receipt.blockNumber);
  } catch (error) {
    console.error("Error minting tokens:", error);
  }
}

export default mint;
