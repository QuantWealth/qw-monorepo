import * as mongoose from 'mongoose';
import { connectOrderbookDB } from '@qw/orderbook-db';
import { getConfig } from 'src/config';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: async (): Promise<typeof mongoose> =>
      {
        const config = await getConfig();
        return connectOrderbookDB(config.mongoUrl);
      },
  },
];
