
import { connectOrderbookDB } from '@qw/orderbook-db';
import * as mongoose from 'mongoose';
import { ConfigService } from 'src/config/config.service';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    inject: [ConfigService],
    useFactory: async (configService: ConfigService): Promise<typeof mongoose> =>
      {
        const config = configService.get();
        return connectOrderbookDB(config.mongoUrl);
      },
  },
];
