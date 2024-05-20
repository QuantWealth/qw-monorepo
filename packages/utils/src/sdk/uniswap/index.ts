import { UNISWAPV3_QUOTER_ABI, UNISWAPV3_QUOTER } from '../../constants';
import { JsonRpcProvider, getContract } from '../../mockable';
import { UniswapV3QuoteArgs } from '../../types/uniswap';

export const getQuoteFromUniswap = async (args: UniswapV3QuoteArgs) => {
    const { rpc, tokenIn, tokenOut, amountIn, fee, sqrtPriceLimitX96 } = args;

    const rpcProvider = new JsonRpcProvider(rpc);
    const quoteContract = getContract(UNISWAPV3_QUOTER, UNISWAPV3_QUOTER_ABI, rpcProvider);
    
    const res = await quoteContract.quoteExactInputSingle.staticCall(
      tokenIn,
      tokenOut,
      fee,
      amountIn,
      sqrtPriceLimitX96 ?? 0
    );

    return res.toString();
}
