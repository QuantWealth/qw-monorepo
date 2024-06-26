export enum SavingType {
  FLEXI = 'flexi',
  FIX = 'fix',
}

export type TSaving = {
  investedAmount: number;
  apy: number;
  currentAmount: number;
  type: SavingType;
  strategy: number;
  description: string;
  graph: Array<number>;
  identifier: string;
};
