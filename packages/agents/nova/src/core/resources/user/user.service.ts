import { Injectable } from '@nestjs/common';
import { TOKEN_BALANCE } from 'src/common/constants';

@Injectable()
export class UserService {
  getUserBalance() {
    return TOKEN_BALANCE;
  }
}
