export type UniswapV3QuoteArgs = {
  rpc: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  fee: string;
  sqrtPriceLimitX96?: string;
};
