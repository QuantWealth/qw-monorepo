import { Injectable } from '@nestjs/common';
import { SAVINGS } from 'src/common/constants';
import { TSaving } from 'src/common/types';

@Injectable()
export class SavingService {
  getAllSavings(): Array<TSaving> {
    return SAVINGS;
  }
}
