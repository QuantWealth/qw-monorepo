import { BalancesResponse, CovalentClient } from '@covalenthq/client-sdk';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IUser, UserModel } from 'qw-orderbook-db/dist/schema';
import { createSCW, getSCW, isSCWDeployed } from 'qw-utils';
import { Transaction } from 'src/common/dto/transaction';
import { UserBalanceQueryDto } from './dto/user-balance-query.dto';
import { UserDataQueryDto } from './dto/user-data-query.dto';
import { UserInitBodyDto } from './dto/user-init-body.dto';

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

    const hasSCW = await isSCWDeployed({ rpc: rpcUrl, address: walletAddress });

    if (hasSCW) {
      throw new HttpException('SCW already deployed', HttpStatus.BAD_REQUEST);
    }

    const deploymentTransaction = await createSCW({
      rpc: rpcUrl,
      address: walletAddress,
    });

    const safeAddress = await getSCW({ rpc: rpcUrl, address: walletAddress });

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
    return await this.userModel.findOne({ id: walletAddress });
  }
}
