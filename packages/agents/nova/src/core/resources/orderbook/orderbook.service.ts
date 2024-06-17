import { Inject, Injectable, Logger } from '@nestjs/common';
import { IOrder, OrderModel, getOrders, getUserBySigner, getUserByWallet } from '@qw/orderbook-db';
import {
  USDT_SEPOLIA,
  approve,
  createGelatoRelayPack,
  createTransactions,
  execute,
  executeRelayTransaction,
  executeSignedTypedDataRelayTx,
  getDeployedSCW,
  getSCW,
  getSafeTxTypedData,
  initQW,
  initSCW,
  normalizeMetaTransaction,
  receiveFunds,
  relayTransaction,
  signSafeTransaction,
} from '@qw/utils';
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types';
import { JsonRpcProvider, Wallet, ethers } from 'ethers';
import { ConfigService } from 'src/config/config.service';
import { NovaConfig } from 'src/config/schema';
import { v4 as uuidv4 } from 'uuid';
import {
  OrderbookGetApproveTxDataDto,
  OrderbookGetApproveTxQueryDto,
  OrderbookSendApproveTxQueryDto,
} from './dto/approve.dto';

@Injectable()
export class OrderbookService {
  @Inject('ORDER_MODEL')
  private orderModel: typeof OrderModel = OrderModel;
  private readonly logger = new Logger(OrderbookService.name);
  private wallet: Wallet;
  private config: NovaConfig;
  public signer: Wallet;
  public provider: JsonRpcProvider;

  constructor(private configService: ConfigService) {
    this.init();
  }

  async init() {
    try {
      this.config = this.configService.get();
      this.wallet = new ethers.Wallet(this.config.privateKey);

      const rpc = Object.values(this.config.chains)[0].providers[0];
      this.provider = new ethers.JsonRpcProvider(rpc);

      this.signer = this.wallet.connect(this.provider);
      this.logger.log('Wallet initialized with address:', this.signer.address);
    } catch (error) {
      this.logger.error('Error initializing wallet:', error);
    }
  }

  /**
   * Creates an approval transaction to allow spending tokens from the user's wallet.
   * @param query The query containing asset address and amount details.
   * @returns A promise that resolves to an Transaction object representing the approval transaction.
   */
  async createApproveTransaction(
    query: OrderbookGetApproveTxQueryDto,
  ): Promise<OrderbookGetApproveTxDataDto> {
    try {
      this.logger.log('Creating approve transaction:', query);
      const { assetAddress, walletAddress, amount } = query;
      const qwManagerAddress = Object.values(this.config.chains)[0]
        .contractAddresses.QWManager.address;

      const txData = approve({
        contractAddress: assetAddress,
        amount: BigInt(amount),
        provider: this.provider,
        spender: qwManagerAddress,
      });

      const rpc = Object.values(this.config.chains)[0].providers[0];

      // Get QW's deployed Safe's instance
      const qwSafe = await getDeployedSCW({
        rpc: rpc,
        safeAddress: walletAddress,
        signer: this.config.privateKey,
      });

      const typedData = await getSafeTxTypedData({
        protocolKit: qwSafe,
        txData: txData,
      });

      return {
        txData: txData,
        typedData: JSON.stringify(typedData),
      };
    } catch (error) {
      this.logger.error('Error creating approve transaction:', error);
      throw Error(error);
    }
  }

  /**
   * Creates a pending order in the orderbook and sends the approval transaction to Gelato.
   * @param query The query containing amount, wallet addresses, signed transaction, and strategy type details.
   */
  async sendApproveTransaction(
    query: OrderbookSendApproveTxQueryDto,
  ): Promise<{ taskId: string }> {
    const {
      amount,
      signerAddress,
      walletAddress,
      metaTransaction,
      signature,
      strategyType,
    } = query;
    const amounts = [amount]; // Currently, there is only one child contract, so the entire amount will be allocated to it.
    const qwUniswapV3StableAddress = Object.values(this.config.chains)[0]
      .contractAddresses['QWUniswapV3Stable'].address;
    const dapps = [qwUniswapV3StableAddress];
    try {
      await this._createOrder(
        signerAddress,
        walletAddress,
        amounts,
        dapps,
        metaTransaction,
        strategyType,
      );
      return this._sendApproveTransaction(
        signerAddress,
        metaTransaction,
        signature,
      );
    } catch (err) {
      console.log(err);
      this.logger.error('Error sending approving tx:', err);
    }
  }

  private async _sendApproveTransaction(
    signerAddress: string,
    metaTransaction: MetaTransactionData,
    signature: string,
  ): Promise<{ taskId: string }> {
    const rpc = Object.values(this.config.chains)[0].providers[0];
    const gelatoApiKey = this.config.gelatoApiKey;

    const qwSafe = await initSCW({
      rpc: rpc,
      address: signerAddress,
    });

    // // Create Gelato relay pack with the protocol kit and API key
    const gelatoRelayPack = await createGelatoRelayPack({
      protocolKit: qwSafe,
      gelatoApiKey,
    });

    return executeSignedTypedDataRelayTx({
      safe: qwSafe,
      gelatoRelayPack,
      metaTransaction,
      signer: signerAddress,
      signature: signature,
    });
  }

  /**
   * Validates order data and creates an order in the database.
   * @param signerAddress - The address of the signer.
   * @param walletAddress - The wallet address of the user.
   * @param amounts - An array of string amounts to be converted to BigInt.
   * @param dapps - An array of dapp addresses.
   * @param userSignedTransaction - The signed meta transaction data.
   * @param strategyType - The strategy type, either 'FLEXI' or 'FIXED'.
   * @returns A promise that resolves with the saved order document.
   * @throws Error if validation fails or user verification fails.
   */
  private async _createOrder(
    signerAddress: string,
    walletAddress: string,
    amounts: string[],
    dapps: string[],
    userSignedTransaction: MetaTransactionData,
    strategyType: 'FLEXI' | 'FIXED', // TODO: make it enum
  ) {
    // Validate input variables.
    if (
      !signerAddress ||
      !walletAddress ||
      !amounts ||
      !dapps ||
      !strategyType
    ) {
      throw new Error('Invalid order data');
    }

    // Verify the user by signer and wallet.
    const userBySigner = await getUserBySigner(signerAddress);
    const userByWallet = await getUserByWallet(walletAddress);

    if (!userBySigner || !userByWallet || userBySigner.id !== userByWallet.id) {
      throw new Error('Signer and wallet do not match the same user');
    }

    // Verify that amounts is an array of strings and all numbers are > 0.
    if (
      !Array.isArray(amounts) ||
      !amounts.every(
        (amount) => typeof amount === 'string' && BigInt(amount) > 0,
      )
    ) {
      throw new Error('Invalid amounts array');
    }

    // Verify that dapps array is all valid addresses (basic check for address format).
    const isValidAddress = (address: string) => /^0x[a-fA-F0-9]{40}$/.test(address);
    if (!Array.isArray(dapps) || !dapps.every(isValidAddress)) {
      throw new Error('Invalid dapps array');
    }

    // TODO: Verify that the dapps are registered dapps.

    // Verify strategy type.
    if (strategyType !== 'FLEXI' && strategyType !== 'FIXED') {
      throw new Error('Invalid strategy type');
    }

    const currentTimestamp = Date.now();

    this.orderModel.create({
      id: uuidv4(),
      signer: signerAddress,
      wallet: walletAddress,
      dapps,
      amounts,
      signatures: [userSignedTransaction],
      status: 'P',
      strategyType,
      timestamps: {
        placed: currentTimestamp, // Set the current timestamp as the placed time
      },
    });
  }

  /**
   * Handles the batch execution of orders, both the receiveFunds and execute steps.
   * Retrieves pending orders, processes them, and executes them using Gelato relay.
   * @returns A promise that resolves when all transactions have been executed.
   */
  async handleBatchExecuteOrders() {
    const rpc = Object.values(this.config.chains)[0].providers[0];
    const chainId = Object.keys(this.config.chains)[0];
    const qwManagerAddress =
      this.config.chains[0].contractAddresses.QWManager.address;
    const erc20TokenAddress = USDT_SEPOLIA;
    const gelatoApiKey = this.config.gelatoApiKey;
    const qwScwAddress = await getSCW({ rpc, address: this.signer.address });
    // const signer = this.signer;

    // Get the start and end dates for a period of 1 month into the past to now.
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    const end = new Date();
    end.setSeconds(end.getSeconds() + 10);

    // Get pending orders.
    const pendingOrders: IOrder[] = await getOrders(start, end, 'P', false);
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
    const qwUniswapAddress = Object.values(this.config.chains)[0]
      .contractAddresses['QwUniswapV3Stable'];
    const _target = [qwUniswapAddress]; // Uniswap V3 child contract address
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
    const safe = await initQW({
      rpc,
      address: qwScwAddress,
      signer: this.signer.privateKey,
    });

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
              status: 'E',
              'timestamps.executed': Date.now(),
            },
          ).exec(),
        ),
      );
    }
  }
}
