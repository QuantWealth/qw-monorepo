import { Inject, Injectable } from '@nestjs/common';
import { DefiApyQueryDto } from './dto/approve.dto';
import { DefiApyResponse } from './dto/execute.dto';
import {
  getSCW,
  initQW,
  approve,
  createTransactions,
  createGelatoRelayPack,
  relayTransaction,
  signSafeTransaction,
  executeRelayTransaction,
  receiveFunds,
  execute,
  USDT_SEPOLIA,
} from '@qw/utils';
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types';
import { getOrders, IOrder } from '@qw/orderbook-db';
import { ethers } from 'ethers';
import { getConfig } from '../../../config';
import { OrderModel } from '@qw/orderbook-db/dist/schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrderbookService {
  @Inject('ORDER_MODEL')
  private orderModel: typeof OrderModel,
  private wallet;
  public config;
  public signer;
  public provider;

  constructor() {
    this.init();
  }

  async init() {
    try {
      this.config = await getConfig();
      this.wallet = new ethers.Wallet(this.config.privateKey);

      const rpc = this.config.chains[0].providers[0];

      this.provider = new ethers.JsonRpcProvider(rpc);

      this.signer = this.wallet.connect(this.provider);
      console.log('Wallet initialized with address:', this.signer.address);
    } catch (error) {
      console.error('Error initializing wallet:', error);
    }
  }

  async createApproveTransaction(
    tokenAddress: string,
    amount: string,
  ): Promise<ethers.TransactionRequest> {
    const qwManagerAddress =
      this.config.chains[0].contractAddresses.QWManager.address;

    return approve({
      contractAddress: tokenAddress,
      amount: BigInt(amount),
      provider: this.provider,
      spender: qwManagerAddress,
    });
  }

  // creates the pending order in orderbook and sends the approval transaction to gelato
  async sendApproveTransaction(
    userScwAddress: string,
    userSignedTransaction: MetaTransactionData,
    amount: string,
    strategyType: "FLEXI" | "FIXED"
  ) {
    const amounts = [amount]; // Currently, there is only one child contract, so the entire amount will be allocated to it.
    const qwAaveV3Address = '0x0000000000000000000000000000000000000123';
    const dapps = [qwAaveV3Address];
    try {
      await this._createOrder(userScwAddress, amounts, dapps, userSignedTransaction, strategyType);
      await this._sendApproveTransaction(userScwAddress, userSignedTransaction);
    } catch (err) {
      console.error('Error sending approving tx:', err);
    }
  }

  private async _sendApproveTransaction(
    userScwAddress: string,
    userSignedTransaction: MetaTransactionData,
  ) {
    const rpc = this.config.chains[0].providers[0];
    const gelatoApiKey = this.config.gelatoApiKey;

    // Create the gelato relay pack using an initialized SCW.
    const safeQW = await initQW({
      rpc,
      signer: this.signer,
      address: userScwAddress,
    });
    const gelatoRelayPack = await createGelatoRelayPack({
      gelatoApiKey,
      protocolKit: safeQW,
    });

    // This will derive from MetaTransactionData and the gelato relay pack a SafeTransaction.
    const safeTransaction = await relayTransaction({
      transactions: [userSignedTransaction],
      gelatoRelayPack,
    });

    // Execute the relay transaction using gelato.
    await executeRelayTransaction({
      gelatoRelayPack,
      signedSafeTransaction: safeTransaction,
    });
  }

  // internal fn
  private async _createOrder(
    userScwAddress: string,
    amounts: string[],
    dapps: string[],
    userSignedTransaction: MetaTransactionData,
    strategyType: "FLEXI" | "FIXED" // TODO: make it enum
  ) {
    const currentTimestamp = Date.now();

    this.orderModel.create({
      id: uuidv4(),
      signer: userScwAddress,
      wallet: userScwAddress,
      dapps,
      amounts,
      signatures: [userSignedTransaction],
      status: "P",
      strategyType,
      timestamps: {
        placed: currentTimestamp // Set the current timestamp as the placed time
      }
    })
  }

  /**
   * Handles the batch execution of orders, both the receiveFunds and execute steps.
   * Retrieves pending orders, processes them, and executes them using Gelato relay.
   * @returns A promise that resolves when all transactions have been executed.
   */
  async handleBatchExecuteOrders() {
    // TODO: Replace constants with configuration.
    const rpc = this.config.chains[0].providers[0];
    const chainId = Object.keys(this.config.chains)[0];
    const qwManagerAddress =
      this.config.chains[0].contractAddresses.QWManager.address;
    const erc20TokenAddress = USDT_SEPOLIA;
    const gelatoApiKey = this.config.gelatoApiKey;
    const qwScwAddress = await getSCW({ rpc, address: this.signer.address });
    const signer = this.signer;

    // Get the start and end dates for a period of 1 month into the past to now.
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    const end = new Date();
    end.setSeconds(end.getSeconds() + 10);

    // Get pending orders.
    const pendingOrders: IOrder[] = getOrders(start, end, 'P', false); // TODO: Confirm that 'false' meaning debit is correct here.
    const provider = new ethers.JsonRpcProvider(rpc, chainId);

    const receiveFundsRequests: MetaTransactionData[] = [];
    let totalSum = BigInt(0);

    for (const order of pendingOrders) {
      // TODO: Orderbook IOrder schema should have token address(es).
      // User is supplying multiple dapps, but we will combine the amounts and we are assuming the same token address for now.
      const sum = order.amounts.reduce(
        (acc, val) => acc + BigInt(val),
        BigInt(0),
      );

      totalSum = BigInt(totalSum) + BigInt(sum);

      // Derive the receive funds transaction request, push to batch.

      const txReq = receiveFunds({
        contractAddress: qwManagerAddress,
        provider,
        user: order.signer,
        token: erc20TokenAddress,
        amount: sum,
      });

      receiveFundsRequests.push({
        to: String(await txReq.to!),
        value: String(txReq.value!),
        data: txReq.data,
      });
    }

    // target array should be present at orders
    const _target = ['0xA52a11Be28bEA0d559370eCbE2f1CB8B1e8e3EcA']; // AAVE V3 contract address
    const target = _target; /// Addresses of the child contracts
    const tokens = [USDT_SEPOLIA]; /// Token addresses for each child contract
    const amount = [totalSum];
    // execute request preparation

    const callData = ['']; /// Calldata for each child contract

    const _executeRequests: ethers.TransactionRequest = execute({
      contractAddress: qwManagerAddress,
      provider,
      target,
      callData,
      tokens,
      amount,
    });

    const executeRequests = {
      to: String(await _executeRequests.to!),
      value: String(_executeRequests.value!),
      data: _executeRequests.data,
    };

    const relayRequests: MetaTransactionData[] =
      receiveFundsRequests.concat(executeRequests);

    // Init the QW safe for signing/wrapping relayed batch transactions below.
    const safe = await initQW({ rpc, address: qwScwAddress, signer });

    // First, we relay receiveFunds.
    {
      // Create the MetaTransactionData.
      const transactions = await createTransactions({
        transactions: relayRequests,
      });

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
        signedSafeTransaction: safeTransaction,
      });

      // update the status of the orderbook.
      // TODO: update order status from pending to executed, optionally record hashes of transactions in order.hashes?
      // Order schema should really record the gelato relay ID in this case...
      await Promise.all(
        pendingOrders.map((order) =>
          OrderModel.updateOne(
            { id: order.id },
            {
              status: "E",
              "timestamps.executed": Date.now(),
            }
          ).exec()
        )
      );
    }
  }
}
