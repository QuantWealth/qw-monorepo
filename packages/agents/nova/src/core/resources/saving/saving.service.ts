import { Injectable } from '@nestjs/common';
import { SavingType, TSaving } from 'src/common/types';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ethers } from 'ethers';
import { SavingApyQueryDto } from './dto/saving-apy-query.dto';

const getRandomApy = (min: number, max: number): number => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
};

const fetchFromOrderbook = (scw: string): number => {
  return 100;
};

@Injectable()
export class SavingService {
  /**
   * This service is called by /savings/all endpoint
   * It retrieves all of the different type of Savings
   * @returns savings array
   */
  getAllSavings(query: SavingApyQueryDto): Array<TSaving> {
    const amountInvested: number = fetchFromOrderbook(query.scwAddress); // fetch from orderbook
    const SAVINGS: Array<TSaving> = [
      {
        investedAmount: amountInvested,
        apy: getRandomApy(16, 20),
        currentAmount: 0,
        type: SavingType.FLEXI,
        strategy: 1,
        description: 'Flexible startegy for safe investment',
        graph: [],
        identifier: '0x1',
      },
      {
        investedAmount: amountInvested,
        apy: 22,
        currentAmount: 0,
        type: SavingType.FIX,
        strategy: 2,
        description: 'High Risk, High Reward saving strategy',
        graph: [],
        identifier: '0x2',
      },
    ];
    return SAVINGS;
  }

  /**
   * Creates the encoded transaction for depositing the amount into one of the savings
   * @param {CreateTransactionDto} createTransactionDto - Fields required to create the transaction
   * @returns the encoded function data
   */
  createTransaction(createTransactionDto: CreateTransactionDto) {
    const contractABI = [
      'function deposit(string savingsType, uint256 amount)',
    ];

    const contract = new ethers.Interface(contractABI);

    const txData = contract.encodeFunctionData('deposit', [
      createTransactionDto.savingType,
      createTransactionDto.amount,
    ]);

    return txData;
  }
}
