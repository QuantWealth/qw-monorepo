import { SavingType, TSaving } from '../types';

export const SAVINGS: Array<TSaving> = [
  {
    investedAmount: 579.5,
    apy: 11.76,
    currentAmount: 615.8,
    type: SavingType.FLEXI,
    strategy: 1,
    description: 'Flexible startegy for safe investment',
    graph: [],
    identifier: '0x1',
  },
  {
    investedAmount: 876.2,
    apy: 14.41,
    currentAmount: 1081.1,
    type: SavingType.FIX,
    strategy: 2,
    description: 'High Risk, High Reward saving strategy',
    graph: [],
    identifier: '0x2',
  },
];
