import { Safe4337Pack } from "@safe-global/relay-kit";
import SafeApiKit from "@safe-global/api-kit";
import Safe from "@safe-global/protocol-kit";
import {
  MetaTransactionData,
  OperationType,
} from "@safe-global/safe-core-sdk-types";

export async function executePendingTransactions() {
  // TODO: Execute pending transactions

  // APPROVE(OPTIONAL Better to move this at nova side)
  // Getting allowance from user wallet to our QWManager contract

  // receive the batch of approve transactions of user
  /// order book should have record of users and approve signature for this transaction.

  const safe4337Pack = await getSafe4337Pack();

  // signedSafeOperation : User signature for approve
  // we can also do this during user's interaction at Nova for MVP
  for (const signedSafeOperation of signedSafeOperations) {
    // Execute the transaction
    const userOperationHash = await safe4337Pack.executeTransaction({
      executable: signedSafeOperation,
    });
  }

  // TRANSFERS
  // Transfer funds from user wallet to our QWManager contract
  /// https://docs.safe.global/core-api/transaction-service-guides/transactions

  /// here safe address is ours where we have funds for transaction fees.
  const safeProtocolKit = await Safe.init({
    provider: config.RPC_URL,
    signer: config.OWNER_A_PRIVATE_KEY,
    safeAddress: config.SAFE_ADDRESS,
  });

  //qwManager.receiveFunds(user_address, amount);
  const transactions: MetaTransactionData[] = [
    {
      to: "0xAddress1",
      value: "0",
      data: "0xData1",
    },
    {
      to: "0xAddress2",
      value: "0",
      data: "0xData2",
    },
    // Add more transactions as needed
  ];

  const safeTransaction = await safeProtocolKit.createTransaction({
    transactions,
  });
  const txResponse = await safeProtocolKit.executeTransaction(safeTransaction);


  /// EXECUTION

  // address[] memory _targetQwChild,
  // bytes[] memory _callData,
  // address _tokenAddress,
  // uint256 _amount

  // a single transaction execute needs to happen, data should be available at orderbook

  console.log("Executing pending transactions...");
}

const getSafe4337Pack = async (): Promise<any> => {
  const safe4337Pack = {};
  // const safe4337Pack = await Safe4337Pack.init({
  //   // ...
  //   paymasterOptions: {
  //     isSponsored: true,
  //     paymasterUrl: `https://api.pimlico.io/v2/sepolia/rpc?apikey=${PIMLICO_API_KEY}`, // Get the API key from the config
  //     paymasterAddress: '0x...',
  //     paymasterTokenAddress: '0x...',
  //     sponsorshipPolicyId // Optional value to set the sponsorship policy id from Pimlico
  //   }
  // })
  return safe4337Pack;
};
