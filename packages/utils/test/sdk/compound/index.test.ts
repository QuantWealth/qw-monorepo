import { getCompoundTokenSupplyApr, getCompoundTokenTotalBorrow, getCompoundTokenTotalSupply } from '../../../src/sdk';
import { COMPOUND_CUSDC_SEPOLIA } from '../../../src/constants';
import { CompoundContractArgs } from '../../../src/types';

const mockCompoundContractArgs: CompoundContractArgs = {
  rpc: 'https://1rpc.io/sepolia',
  contractAddress: COMPOUND_CUSDC_SEPOLIA
};

describe('Compound utils', () => {
    it("should fetch underlying token apr", async () => {
        const res = await getCompoundTokenSupplyApr(mockCompoundContractArgs);

        expect(res).not.toBe(undefined)
        expect(res).toBeGreaterThan(0)
    });

    it('should fetch cToken total supply', async () => {
        const res = await getCompoundTokenTotalSupply(mockCompoundContractArgs);

        expect(res).not.toBe(undefined)
        expect(res).toBeGreaterThan(0)
    });

    it('should fetch cToken total borrow', async () => {
        const res = await getCompoundTokenTotalBorrow(mockCompoundContractArgs);

        expect(res).not.toBe(undefined)
        expect(res).toBeGreaterThan(0)
    });
});
