import { TTokenBalance } from '../types/balance';

export const TOKEN_BALANCE: Array<TTokenBalance> = [
  {
    name: 'Tether USD',
    symbol: 'USDT',
    address: '0xA219439258ca9da29E9Cc4cE5596924745e12B93',
    quantity: 200,
    fiatPrice: 1,
    network: 'Linea',
    totalCount: 18,
    percentageChange: 4.1,
    totalBalance: 68,
  },
  {
    name: 'USDC.e',
    symbol: 'USDC',
    address: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
    quantity: 145,
    fiatPrice: 0.99,
    network: 'Linea',
    totalCount: 12,
    percentageChange: 1.5,
    totalBalance: 45,
  },
];
