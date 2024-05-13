import { AaveTokenArgs } from '../../../src/types';
import { USDT_SEPOLIA } from '../../../src/constants';
import { getAaveTokenData, getReserveConfigurationAave } from '../../../src/sdk/aave'

const mockAaveTokenArgs: AaveTokenArgs = {
  rpc: 'https://1rpc.io/sepolia',
  tokenAddress: USDT_SEPOLIA
};

describe('Aave utils', () => {
    it('should fetch token apy', async () => {
        const res = await getAaveTokenData(mockAaveTokenArgs);

        expect(res).not.toBe(undefined)
        expect(res.currentSupplyApy).toBeGreaterThan(0)
        expect(res.currentVariableBorrowApy).toBeGreaterThan(0)
        expect(res.currentStableBorrowApy).toBeGreaterThan(0)
        expect(res.totalTreasuryBalance).toBeGreaterThan(0)
    });

    it('should return reserve configuration', async () => {
      const res = await getReserveConfigurationAave(mockAaveTokenArgs);

      expect(res).not.toBe(undefined);
    });
});