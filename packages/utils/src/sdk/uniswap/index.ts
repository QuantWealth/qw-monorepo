import { UNISWAPV3_QUOTER_ABI, UNISWAPV3_QUOTER_SEPOLIA } from 'src/constants';
import { JsonRpcProvider, getContract } from 'src/mockable';

export type UniswapV3QuoteArgs = {
    rpc: string;
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    fee: string;
    sqrtPriceLimitX96?: string;
}

export const getQuoteFromUniswap = async (args: UniswapV3QuoteArgs) => {
    const { rpc, tokenIn, tokenOut, amountIn, fee, sqrtPriceLimitX96 } = args;

    const rpcProvider = new JsonRpcProvider(rpc);
    const quoteContract = getContract(UNISWAPV3_QUOTER_SEPOLIA, UNISWAPV3_QUOTER_ABI, rpcProvider);
    
    const res = await quoteContract.quoteExactInputSingle.staticCall({
      tokenIn,
      tokenOut,
      amountIn,
      fee,
      sqrtPriceLimitX96: sqrtPriceLimitX96 ?? 0,
    });

    return res[0].toString();
}
