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
} from 'qw-utils';
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
    userSignedTransactionData: string,
  ) {
    // TODO: Replace constants with configuration.
    const rpc = 'https://1rpc.io/sepolia';
    const gelatoApiKey = 'fake-api-key';

    // createTransactions
    const transactions = await createTransactions([userSignedTransactionData]);

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
  // async handleBatchExecuteOrders() {
  // const signer =
  //   '0x5d0f6356861e10edebf756675712773ccac4c7c65a0daf733c7d8747df911b6d';
  // const safe = initQW({ rpc, address, signer });
  // create batch transactions for pending orders, pull the data from orderbook DB and create receiveFuns batch transactions, return transactions[]
  // create execute transaction for pending orders, pull the data from orderbook DB and create execute transactions, return transactions[]
  // sign the above batch transcations by signSafeTransaction and then executeRelayTransaction to relay the batch transactions.
  // }
}
