import { ethers } from "ethers";

// Replace with your own values
const PRIVATE_KEY = ""; // Replace with your private key
const USDC_SEPOLIA_CONTRACT_ADDRESS = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8";
const MINT_AMOUNT = ethers.parseUnits("500", 18); // Example mint amount, 1000 tokens with 18 decimals
const RPC_URL = 'https://1rpc.io/sepolia';

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

export const mint = async (recipientAddress: string): Promise<void> => {
  if (!PRIVATE_KEY) {
    console.error("Private key is missing");
    return;
  }

  // Connect to the Ethereum network
const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  // Connect to the ERC-20 contract
  const erc20Contract = new ethers.Contract(USDC_SEPOLIA_CONTRACT_ADDRESS, ABI, wallet);

  try {
    // Call the mint function
    const tx = await erc20Contract.mint(recipientAddress, MINT_AMOUNT);
    console.log("Mint transaction hash:", tx.hash);

    // Wait for the transaction to be confirmed
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block", receipt.blockNumber);
  } catch (error) {
    console.error("Error minting tokens:", error);
  }
}
