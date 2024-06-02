import { OrderModel } from '@qw/orderbook-db';

export const orderProviders = [
  {
    provide: 'ORDER_MODEL',
    useFactory: () => OrderModel,
    inject: ['DATABASE_CONNECTION'],
  },
];
