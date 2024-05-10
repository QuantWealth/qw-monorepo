import { Injectable } from '@nestjs/common';
import { TOKEN_BALANCE } from 'src/common/constants';
import { TTokenBalance } from 'src/common/types/balance';

@Injectable()
export class UserService {
  /**
   * This service is called by /user/balance endpoint
   * It retrieves the token balance of the user
   * @returns token balance array
   */
  getUserBalance(): Array<TTokenBalance> {
    return TOKEN_BALANCE;
  }
}
