import { fromReadableAmount } from '../../../src/mockable';
import { getQuoteFromUniswap } from '../../../src/sdk';
import { UniswapV3QuoteArgs } from '../../../src/types';

export const mockUniswapV3QuoteArgs: UniswapV3QuoteArgs = {
  rpc: "https://eth-mainnet.public.blastapi.io",
  tokenIn: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  tokenOut: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  fee: "3000",
  amountIn: fromReadableAmount(1, 18).toString(),
};

describe('Uniswap utils', () => {
    it('should get the quote', async () => {
        const res = await getQuoteFromUniswap(mockUniswapV3QuoteArgs);

        expect(res).not.toBe(undefined)
        expect(BigInt(res)).toBeGreaterThan(BigInt(0))
    });
});