import { Inject, Injectable } from '@nestjs/common';
import { SavingType, TSaving } from 'src/common/types';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ethers } from 'ethers';
import { SavingApyQueryDto } from './dto/saving-apy-query.dto';
import { OrderModel } from '@qw/orderbook-db';

const getRandomApy = (min: number, max: number): number => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
};

@Injectable()
export class SavingService {
  constructor(
    @Inject('ORDER_MODEL')
    private orderModel: typeof OrderModel,
  ) {}

  // Function to fetch from the order book and calculate the sum of amounts
  async fetchInvestedAmountsFromOrderbook(
    scw: string,
  ): Promise<{ flexiAmount: number; fixedAmount: number }> {
    try {
      // Find all orders associated with the given SCW address
      const orders = await this.orderModel.find({ wallet: scw });

      // Initialize the amounts object
      const amounts = {
        flexiAmount: 0,
        fixedAmount: 0,
      };

      // Calculate the sums of flexi and fixed amounts
      orders.forEach((order) => {
        if (order.status === 'E') {
          // Only consider orders with status "E"
          const orderAmount = order.amounts.reduce(
            (sum, amount) => sum + parseFloat(amount),
            0,
          );
          if (order.strategyType === 'FLEXI') {
            amounts.flexiAmount += orderAmount;
          } else if (order.strategyType === 'FIXED') {
            amounts.fixedAmount += orderAmount;
          }
        }
      });

      return amounts;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  /**
   * This service is called by /savings/all endpoint
   * It retrieves all of the different type of Savings
   * @returns savings array
   */
  async getAllSavings(query: SavingApyQueryDto): Promise<Array<TSaving>> {
    const amountInvested = await this.fetchInvestedAmountsFromOrderbook(
      query.scwAddress,
    ); // fetch from orderbook
    const SAVINGS: Array<TSaving> = [
      {
        investedAmount: amountInvested.flexiAmount,
        apy: getRandomApy(18, 20),
        currentAmount: 0,
        type: SavingType.FLEXI,
        strategy: 1,
        description: 'Flexible startegy for safe investment',
        graph: [],
        identifier: '0x1',
      },
      {
        investedAmount: amountInvested.fixedAmount,
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
