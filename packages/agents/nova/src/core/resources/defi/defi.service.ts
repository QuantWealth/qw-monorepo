import { Injectable } from '@nestjs/common';
import { DefiApyQueryDto } from './dto/defi-apy-query.dto';
import { DefiApyResponse } from './dto/defi-apy-response.dto';
import { ethers } from 'ethers';

@Injectable()
export class DefiService {
  /**
   * This service is called by /defi/apy endpoint
   * It retrieves the apy of the asset address provided
   * This only fetches apy from aave
   * @returns apy string
   */
  async getDefiApy(query: DefiApyQueryDto): Promise<DefiApyResponse> {
    // TODO: move to env
    const rpcUrl = 'https://1rpc.io/sepolia';
    const aavePoolContractAddress =
      '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951';

    const provider = new ethers.JsonRpcProvider(rpcUrl);

    const contractABI = [
      'function getReserveData(address asset) external view returns (tuple((uint256) configuration, uint128 liquidityIndex, uint128 variableBorrowIndex, uint128 currentLiquidityRate, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint8 id))',
    ];

    const contract = new ethers.Contract(
      aavePoolContractAddress,
      contractABI,
      provider,
    );

    try {
      const reserveData = await contract.getReserveData(query.assetAddress);

      const liquidityRate = BigInt(reserveData.currentLiquidityRate.toString());
      const RAY = BigInt('10') ** BigInt('27');
      const SECONDS_PER_YEAR = BigInt(31536000);

      const depositAPR = liquidityRate / RAY;
      const depositAPY =
        (1 + Number(depositAPR) / Number(SECONDS_PER_YEAR)) **
          Number(SECONDS_PER_YEAR) -
        1;

      const response: DefiApyResponse = {
        message: 'APY data fetched successfully.',
        statusCode: 201,
        data: {
          apy: depositAPY.toString(),
        },
      };

      return response;
    } catch (error) {
      console.error('Error calling getReserveData:', error);
      throw new Error('Unable to retrieve data');
    }
  }
}
