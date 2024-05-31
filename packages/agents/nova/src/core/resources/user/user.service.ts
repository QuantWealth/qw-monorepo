import { BalancesResponse, CovalentClient } from '@covalenthq/client-sdk';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IUser, UserModel } from 'qw-orderbook-db/dist/schema';
import { initSCW, createSCW, getSCW, isSCWDeployed } from 'qw-utils';
import { Transaction } from 'src/common/dto/transaction';
import { UserBalanceQueryDto } from './dto/user-balance-query.dto';
import { UserDataQueryDto } from './dto/user-data-query.dto';
import { UserInitBodyDto } from './dto/user-init-body.dto';
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
  async userInit({
    walletAddress,
    provider,
  }: UserInitBodyDto): Promise<Transaction> {
    // TODO: move to env
    const rpcUrl = 'https://1rpc.io/sepolia';

    const safe = await initSCW({ rpc: rpcUrl, address: walletAddress });

    const hasSCW = await isSCWDeployed({ safe });

    if (hasSCW) {
      throw new HttpException('SCW already deployed', HttpStatus.BAD_REQUEST);
    }

    const deploymentTransaction = await createSCW({ safe });

    const safeAddress = await getSCW({ safe });

    if ((await this.userModel.find({ id: walletAddress })).length > 0) {
      await this.userModel.updateOne(
        {
          id: walletAddress,
        },
        {
          $addToSet: { providers: provider },
        },
      );
    } else {
      await this.userModel.create({
        id: walletAddress,
        wallet: safeAddress,
        network: 'eth-sepolia',
        deployed: false,
        providers: [provider],
      });
    }
    return deploymentTransaction;
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
