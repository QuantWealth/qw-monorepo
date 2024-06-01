import { Injectable } from '@nestjs/common';
import { DefiApyQueryDto } from './dto/approve.dto';
import { DefiApyResponse } from './dto/execute.dto';
import {
  initSCW,
  initQW,
  approve,
  createTransactions,
  createGelatoRelayPack,
  relayTransaction,
  signSafeTransaction,
  executeRelayTransaction,
  receiveFunds,
  execute,
} from 'qw-utils';
import { getOrders, IOrder } from 'qw-orderbook-db';
import { ethers } from 'ethers';

@Injectable()
export class OrderbookService {
  /**
   * This service is called by /defi/apy endpoint
   * It retrieves the apy of the asset address provided
   * This only fetches apy from aave
   * @returns apy string
   */

  /**
   * Produces an approve transaction request for a given token address and amount.
   * This calls the approve function from utils to get the transaction request.
   * @param tokenAddress - The address of the token to approve.
   * @param amount - The amount of the token to approve.
   * @returns A promise that resolves to an ethers.TransactionRequest object.
   */
  async produceApproveTransaction(
    tokenAddress: string,
    amount: string,
  ): Promise<ethers.TransactionRequest> {
    // TODO: Replace constants with configuration.
    const rpc = 'https://1rpc.io/sepolia';
    const chainId = 11155111;
    const qwManagerAddress = '0x0000000000000000000000000000000000000123';

    const provider = new ethers.JsonRpcProvider(rpc, chainId);
    return approve({
      contractAddress: tokenAddress,
      amount: BigInt(amount),
      provider,
      spender: qwManagerAddress,
    });
  }

  /**
   * Sends an approve transaction using Gelato relay.
   * Adds the order details to orderbook-db and calls executeRelayTransaction to relay the approve.
   * @param userScwAddress - The smart contract wallet address of the user.
   * @param userSignedTransaction - The signed transaction details.
   * @returns A promise that resolves when the transaction has been relayed.
   */
  async sendApproveTransaction(
    userScwAddress: string,
    userSignedTransaction: {
      to: string;
      value: string;
      data: string;
    },
  ) {
    // TODO: Replace constants with configuration.
    const rpc = 'https://1rpc.io/sepolia';
    const gelatoApiKey = 'fake-api-key';

    // Create the MetaTransactionData.
    const transactions = await createTransactions([userSignedTransaction]);

    // Create the gelato relay pack using an initialized SCW.
    const safe = await initSCW({ rpc, address: userScwAddress });
    const gelatoRelayPack = await createGelatoRelayPack({
      gelatoApiKey,
      protocolKit: safe,
    });

    // This will derive from MetaTransactionData and the gelato relay pack a SafeTransaction.
    let safeTransaction = await relayTransaction({
      transactions,
      gelatoRelayPack,
    });

    // Use protocol kit to sign the safe transaction, enabling it to be relayed.
    safeTransaction = await signSafeTransaction({
      protocolKit: safe,
      safeTransaction,
    });

    // Execute the relay transaction using gelato.
    await executeRelayTransaction({
      gelatoRelayPack,
      signSafeTransaction: safeTransaction,
    });
  }

  /**
   * Handles the batch execution of orders, both the receiveFunds and execute steps.
   * Retrieves pending orders, processes them, and executes them using Gelato relay.
   * @returns A promise that resolves when all transactions have been executed.
   */
  async handleBatchExecuteOrders() {
    // TODO: Replace constants with configuration.
    const rpc = 'https://1rpc.io/sepolia';
    const chainId = 11155111;
    const qwManagerAddress = '0x0000000000000000000000000000000000000123';
    const erc20TokenAddress = '0x0000000000000000000000000000000000000456';
    const gelatoApiKey = 'fake-api-key';
    const qwScwAddress = '0x0000000000000000000000000000000000000789';

    // Get the start and end dates for a period of 1 month into the past to now.
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    const end = new Date();
    end.setSeconds(end.getSeconds() + 10);

    // Get pending orders.
    const pendingOrders: IOrder[] = getOrders(start, end, 'P', false); // TODO: Confirm that 'false' meaning debit is correct here.
    const provider = new ethers.JsonRpcProvider(rpc, chainId);

    const receiveFundsRequests: ethers.TransactionRequest[] = [];
    const executeRequests: ethers.TransactionRequest[] = [];
    for (const order of pendingOrders) {
      // TODO: Orderbook IOrder schema should have token address(es).
      // User is supplying multiple dapps, but we will combine the amounts and we are assuming the same token address for now.
      const sum = order.amounts.reduce(
        (acc, val) => acc + BigInt(val),
        BigInt(0),
      );
      // Derive the receive funds transaction request, push to batch.
      receiveFundsRequests.push(
        receiveFunds({
          contractAddress: qwManagerAddress,
          provider,
          user: order.signer,
          token: erc20TokenAddress,
          amount: sum,
        }),
      );

      // Form the execute transaction request, push to batch.
      executeRequests.push(
        execute({
          contractAddress: qwManagerAddress,
          provider,
          target: order.dapps,
          // TODO: Calldata must come from order? Will need to modify Order schema for this...
          callData: Array(order.dapps.length).fill('0x'),
          // TODO: Order schema must be modified to track token addresses as well...?
          tokens: Array(order.dapps.length).fill(erc20TokenAddress),
          amount: order.amounts.map(BigInt),
        }),
      );
    }

    // Init the QW safe for signing/wrapping relayed batch transactions below.
    const signer =
      '0x5d0f6356861e10edebf756675712773ccac4c7c65a0daf733c7d8747df911b6d';
    const safe = await initQW({ rpc, address: qwScwAddress, signer });

    // First, we relay receiveFunds.
    {
      // Create the MetaTransactionData.
      const transactions = await createTransactions([receiveFundsRequests]);

      // Create the gelato relay pack using an initialized SCW.
      const gelatoRelayPack = await createGelatoRelayPack({
        gelatoApiKey,
        protocolKit: safe,
      });

      // This will derive from MetaTransactionData and the gelato relay pack a SafeTransaction.
      let safeTransaction = await relayTransaction({
        transactions,
        gelatoRelayPack,
      });

      // Use protocol kit to sign the safe transaction, enabling it to be relayed.
      safeTransaction = await signSafeTransaction({
        protocolKit: safe,
        safeTransaction,
      });

      // Execute the relay transaction using gelato.
      await executeRelayTransaction({
        gelatoRelayPack,
        signSafeTransaction: safeTransaction,
      });
    }

    // TODO: Next, we need to track gelato task ID to wait for completion.

    // Finally, we batch execute.
    {
      // Create the MetaTransactionData.
      const transactions = await createTransactions([executeRequests]);

      // Create the gelato relay pack using an initialized SCW.
      const gelatoRelayPack = await createGelatoRelayPack({
        gelatoApiKey,
        protocolKit: safe,
      });

      // This will derive from MetaTransactionData and the gelato relay pack a SafeTransaction.
      let safeTransaction = await relayTransaction({
        transactions,
        gelatoRelayPack,
      });

      // Use protocol kit to sign the safe transaction, enabling it to be relayed.
      safeTransaction = await signSafeTransaction({
        protocolKit: safe,
        safeTransaction,
      });

      // Execute the relay transaction using gelato.
      await executeRelayTransaction({
        gelatoRelayPack,
        signSafeTransaction: safeTransaction,
      });
    }

    // TODO: update order status from pending to executed, optionally record hashes of transactions in order.hashes?
    // Order schema should really record the gelato relay ID in this case...
  }
}
