import { BalancesResponse, CovalentClient } from '@covalenthq/client-sdk';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { IUser, UserModel } from '@qw/orderbook-db';
import {
  USDT_SEPOLIA,
  mint,
  createGelatoRelayPack,
  createSCW,
  createTransactions,
  executeRelayTransaction,
  getDeployedSCW,
  getSCW,
  initSCW,
  normalizeMetaTransaction,
  relayTransaction,
  signSafeTransaction,
  isSCWDeployed,
} from '@qw/utils';
import {JsonRpcProvider, parseUnits} from 'ethers';
import { ConfigService } from 'src/config/config.service';
import { NovaConfig } from 'src/config/schema';
import { UserBalanceQueryDto } from './dto/user-balance-query.dto';
import { UserDataQueryDto } from './dto/user-data-query.dto';
import { UserInitBodyDto } from './dto/user-init-body.dto';
import { UserResponseDto } from './dto/user-init-response.dto';
import { UserSendTxBodyDto } from './dto/user-send-tx-body.dto';

@Injectable()
export class UserService {
  private config: NovaConfig;
  private readonly logger = new Logger(UserService.name);

  constructor(
    @Inject('USER_MODEL')
    private userModel: typeof UserModel,
    private configService: ConfigService,
  ) {
    this.config = this.configService.get();
  }

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
  async userInit({ signerAddress, provider }: UserInitBodyDto): Promise<UserResponseDto> {
    const rpcUrl = Object.values(this.config.chains)[0].providers[0]; // RPC URL

    const gelatoApiKey = this.config.gelatoApiKey;
    const qwSafeAddress = '0xC22E238cbAb8B34Dc0014379E00B38D15D806115'; // Address of the safe
    // Initialize the user's smart contract wallet (SCW)
    const userSafe = await initSCW({ rpc: rpcUrl, address: signerAddress });

    // Check if the SCW is already deployed
    const hasSCW = await isSCWDeployed({
      safe: userSafe,
    });

    // If SCW is already deployed
    const users = await this.userModel.find({ id: signerAddress });
    if (users.length > 0 && hasSCW) {
      // Update the user's providers if they already exist
      await this.userModel.updateOne(
        {
          id: signerAddress,
        },
        {
          $addToSet: { providers: provider },
        },
      );
      return users[0];
    }

    // Create the SCW deployment transaction
    const deploymentTransaction = await createSCW({
      rpc: rpcUrl,
      address: '', // TODO: remove this not required here
      safe: userSafe,
    });

    // Get the SCW address
    const safeAddress = await getSCW({
      rpc: rpcUrl,
      address: '', // TODO: remove this not required here
      safe: userSafe,
    });
    console.log('safeAddress:', safeAddress);
    // Create a mint transaction for the user's SCW
    const mintTx = mint({
      contractAddress: USDT_SEPOLIA,
      provider: new JsonRpcProvider(rpcUrl),
      amount: parseUnits('500', 18), // Mint 500 tokens
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
      signer: this.config.privateKey,
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

    console.log('safeTransaction:', safeTransaction);
    console.log('signedSafeTransaction:', signedSafeTransaction);

    // Execute the relay transaction
    executeRelayTransaction({
      signedSafeTransaction,
      gelatoRelayPack,
    });

    // Create a new user record if they do not exist
    const user = await this.userModel.create({
      id: signerAddress,
      wallet: safeAddress,
      network: 'eth-sepolia',
      deployed: true,
      providers: [provider],
    });
    return user;
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
