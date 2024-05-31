import * as mongoose from 'mongoose';
import { connectOrderbookDB } from 'qw-orderbook-db';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: async (): Promise<typeof mongoose> =>
      connectOrderbookDB(
        'mongodb+srv://quantwealthdev:ihTiVPNY1qsJ9erA@qw.u2dsioh.mongodb.net/?retryWrites=true&w=majority&appName=qw',
      ),
  },
];
