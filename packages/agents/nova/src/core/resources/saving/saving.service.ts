import { Injectable } from '@nestjs/common';
import { SAVINGS } from 'src/common/constants';
import { TSaving } from 'src/common/types';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ethers } from 'ethers';

@Injectable()
export class SavingService {
  /**
   * This service is called by /savings/all endpoint
   * It retrieves all of the different type of Savings
   * @returns savings array
   */
  getAllSavings(): Array<TSaving> {
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
