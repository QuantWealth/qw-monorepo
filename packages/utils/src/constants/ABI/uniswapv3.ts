export const UNISWAPV3_QUOTER_ABI = [
    // Read-Only Functions
    "function WETH9() view returns (address)",
    "function factory() view returns (address)",
    "function uniswapV3SwapCallback(int256 amount0Delta, int256 amount1Delta, bytes path) view",
  
    // Authenticated Functions
    "function quoteExactInput(bytes path, uint256 amountIn) nonpayable returns (uint256 amountOut)",
    "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) nonpayable returns (uint256 amountOut)",
    "function quoteExactOutput(bytes path, uint256 amountOut) nonpayable returns (uint256 amountIn)",
    "function quoteExactOutputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountOut, uint160 sqrtPriceLimitX96) nonpayable returns (uint256 amountIn)"
  ];