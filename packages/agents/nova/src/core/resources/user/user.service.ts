import { Injectable } from '@nestjs/common';
import { TOKEN_BALANCE } from 'src/common/constants';
import { TTokenBalance } from 'src/common/types/balance';

@Injectable()
export class UserService {
  getUserBalance(): Array<TTokenBalance> {
    return TOKEN_BALANCE;
  }
}
