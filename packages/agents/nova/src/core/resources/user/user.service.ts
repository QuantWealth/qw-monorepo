import { BalancesResponse, CovalentClient } from '@covalenthq/client-sdk';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IUser, UserModel } from '@qw/orderbook-db';
import {
  initSCW,
  createSCW,
  getSCW,
  isSCWDeployed,
  mint,
  createTransactions,
  normalizeMetaTransaction,
  createGelatoRelayPack,
  relayTransaction,
  signSafeTransaction,
  executeRelayTransaction,
  getDeployedSCW,
} from '@qw/utils';
import { UserBalanceQueryDto } from './dto/user-balance-query.dto';
import { UserDataQueryDto } from './dto/user-data-query.dto';
import { UserInitBodyDto } from './dto/user-init-body.dto';
import { USDC_SEPOLIA } from 'src/common/constants';
import { ethers } from 'ethers';
import { UserSendTxBodyDto } from './dto/user-send-tx-body.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_MODEL')
    private userModel: typeof UserModel,
  ) {}

  /**
   * This service is called by /user/balance endpoint
   * It retrieves the token balance of the user
   * @returns token balance array
   */
  async getUserBalance(query: UserBalanceQueryDto): Promise<BalancesResponse> {
    // TODO: move to env
    const cKey = 'ckey_ff063ff59c7242dca5076e02ffc';

    const client = new CovalentClient(cKey);
    const resp = await client.BalanceService.getTokenBalancesForWalletAddress(
      'eth-sepolia',
      query.walletAddress,
      {
        quoteCurrency: 'USD',
        nft: false,
      },
    );
    return resp.data;
  }

  /**
   * This service is called by /user/init endpoint
   * It deploys the smart contract and initializes the user
   * @returns transaction
   */
  async userInit({ walletAddress, provider }: UserInitBodyDto): Promise<void> {
    // TODO: move to environment variables for security
    const rpcUrl = 'https://1rpc.io/sepolia';
    const gelatoApiKey = 'gelato_api_key';
    const qwSafeAddress = ''; // Address of the safe
    const qwSafeOwnerPrivateKey = ''; // Private key of the safe owner

    // Initialize the user's smart contract wallet (SCW)
    const userSafe = await initSCW({ rpc: rpcUrl, address: walletAddress });

    // Check if the SCW is already deployed
    const hasSCW = await isSCWDeployed({
      rpc: rpcUrl,
      address: walletAddress,
      safe: userSafe,
    });

    // If SCW is already deployed, throw an error
    if (hasSCW) {
      throw new HttpException('SCW already deployed', HttpStatus.BAD_REQUEST);
    }

    // Create the SCW deployment transaction
    const deploymentTransaction = await createSCW({
      rpc: rpcUrl,
      address: walletAddress,
      safe: userSafe,
    });

    // Get the SCW address
    const safeAddress = await getSCW({
      rpc: rpcUrl,
      address: walletAddress,
      safe: userSafe,
    });

    // Create a mint transaction for the user's SCW
    const mintTx = mint({
      contractAddress: USDC_SEPOLIA,
      provider: new ethers.JsonRpcProvider(rpcUrl),
      amount: ethers.parseUnits('500', 18), // Mint 500 tokens
      recipientAddress: safeAddress,
    });

    // Prepare the array of transactions
    const transactionsArr = [deploymentTransaction, mintTx];

    // Normalize transactions to MetaTransactionData format
    const metaTransactionsArr = transactionsArr.map((tx) =>
      normalizeMetaTransaction({ tx }),
    );

    // Create transactions to be relayed
    const transactionsToBeRelayed = await createTransactions({
      transactions: metaTransactionsArr,
    });

    // Get QW's deployed Safe's instance
    const qwSafe = await getDeployedSCW({
      rpc: rpcUrl,
      safeAddress: qwSafeAddress,
      signer: qwSafeOwnerPrivateKey,
    });

    // Create Gelato relay pack with the protocol kit and API key
    const gelatoRelayPack = await createGelatoRelayPack({
      protocolKit: qwSafe,
      gelatoApiKey,
    });

    // Relay the transactions
    const safeTransaction = await relayTransaction({
      transactions: transactionsToBeRelayed,
      gelatoRelayPack,
    });

    // Sign the safe transaction
    const signedSafeTransaction = await signSafeTransaction({
      safeTransaction,
      protocolKit: qwSafe,
    });

    // Execute the relay transaction
    executeRelayTransaction({
      signedSafeTransaction,
      gelatoRelayPack,
    });

    // Check if the user already exists in the database
    if ((await this.userModel.find({ id: walletAddress })).length > 0) {
      // Update the user's providers if they already exist
      await this.userModel.updateOne(
        {
          id: walletAddress,
        },
        {
          $addToSet: { providers: provider },
        },
      );
    } else {
      // Create a new user record if they do not exist
      await this.userModel.create({
        id: walletAddress,
        wallet: safeAddress,
        network: 'eth-sepolia',
        deployed: true,
        providers: [provider],
      });
    }
  }

  /**
   * This service is called by /user/data endpoint
   * It returns the user data
   * @returns transaction
   */
  async userData({ walletAddress }: UserDataQueryDto): Promise<IUser> {
    const user = await this.userModel.findOne({ id: walletAddress });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    delete user.__v;
    delete user._id;
    return user;
  }

  /**
   * This service is called by /user/sendTx endpoint
   * It submits the transaction
   * @returns transaction
   */
  async sendTx({ signedTx }: UserSendTxBodyDto): Promise<void> {
    return;
  }
}
