import * as mongoose from 'mongoose';
import { connectOrderbookDB } from '@qw/orderbook-db';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: async (): Promise<typeof mongoose> =>
      connectOrderbookDB(
        'mongodb://localhost:27017',
      ),
  },
];
