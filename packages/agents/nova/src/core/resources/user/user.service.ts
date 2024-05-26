import { Injectable } from '@nestjs/common';
import Safe, { PredictedSafeProps } from '@safe-global/protocol-kit';
import { BalancesResponse, CovalentClient } from '@covalenthq/client-sdk';
import { Transaction } from 'src/common/dto/transaction';
import { UserBalanceQueryDto } from './dto/user-balance-query.dto';
import { UserInitBodyDto } from './dto/user-init-body.dto';

@Injectable()
export class UserService {
  /**
   * This service is called by /user/balance endpoint
   * It retrieves the token balance of the user
   * @returns token balance array
   */
  async getUserBalance(query: UserBalanceQueryDto): Promise<BalancesResponse> {
    const client = new CovalentClient('ckey_ff063ff59c7242dca5076e02ffc');
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
  async userInit({ walletAddress }: UserInitBodyDto): Promise<Transaction> {
    const safeVersionDeployed = '1.4.1';
    const predictedSafe: PredictedSafeProps = {
      safeAccountConfig: {
        owners: [walletAddress],
        threshold: 1,
      },
      safeDeploymentConfig: {
        safeVersion: safeVersionDeployed,
      },
    };

    const jsonRpcProvider = 'https://1rpc.io/sepolia';
    // const contractNetworks = await getContractNetworks(chainId);

    const safeSdk = await Safe.init({
      provider: jsonRpcProvider,
      predictedSafe,
    });

    const deploymentTransaction =
      await safeSdk.createSafeDeploymentTransaction();
    console.log('deploymentTransaction', deploymentTransaction);

    return deploymentTransaction;
    // const safeFactoryAddress = await (await getFactory()).contract.getAddress()

    // return {
    //   accounts,
    //   contractNetworks,
    //   predictedSafe,
    //   chainId,
    //   provider
    // }
  }
}
