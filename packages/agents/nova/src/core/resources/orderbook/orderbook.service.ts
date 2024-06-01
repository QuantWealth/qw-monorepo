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

  // call approve at utils to get the transaction request
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

  // add the order details to orderbook-db and call executeRelayTransaction to relay the approve.
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

    // createTransactions
    const transactions = await createTransactions([userSignedTransaction]);

    // createGelatoRelayPack
    const safe = await initSCW({ rpc, address: userScwAddress });
    const gelatoRelayPack = await createGelatoRelayPack({
      gelatoApiKey,
      protocolKit: safe,
    });

    // relayTransaction -> SafeTransaction
    let safeTransaction = await relayTransaction({
      transactions,
      gelatoRelayPack,
    });

    // signSafeTransaction
    safeTransaction = await signSafeTransaction({
      protocolKit: safe,
      safeTransaction,
    });

    // executeRelayTransaction
    await executeRelayTransaction({
      gelatoRelayPack,
      signSafeTransaction: safeTransaction,
    });
  }

  // Wrap the below
  async handleBatchExecuteOrders() {
    // TODO: Replace constants with configuration.
    const rpc = 'https://1rpc.io/sepolia';
    const chainId = 11155111;
    const qwManagerAddress = '0x0000000000000000000000000000000000000123';
    const erc20TokenAddress = '0x0000000000000000000000000000000000000456';

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

    // TODO: sign the above batch transcations by signSafeTransaction and then executeRelayTransaction to relay the batch transactions.
    // TODO: update order status from pending to executed, optionally record hashes of transactions in order.hashes?
    // Order schema should really record the gelato relay ID in this case...

    // const signer =
    //   '0x5d0f6356861e10edebf756675712773ccac4c7c65a0daf733c7d8747df911b6d';
    // const safe = initQW({ rpc, address, signer });
  }
}
