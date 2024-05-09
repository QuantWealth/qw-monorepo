import { Injectable } from '@nestjs/common';
import { SAVINGS } from 'src/common/constants';
import { TSaving } from 'src/common/types';

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
}
