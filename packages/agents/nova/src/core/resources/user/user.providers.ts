import { UserModel } from '@qw/orderbook-db/dist/schema';

export const userProviders = [
  {
    provide: 'USER_MODEL',
    useFactory: () => UserModel,
    inject: ['DATABASE_CONNECTION'],
  },
];
