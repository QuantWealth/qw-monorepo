import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderSchema, UserSchema } from '@qw/orderbook-db';

// TODO: Move to config.
const ORDERBOOK_HOST = 'mongodb://localhost/orderbook';

@Module({
  imports: [
    MongooseModule.forRoot(ORDERBOOK_HOST),
    MongooseModule.forFeature([{ name: 'Order', schema: OrderSchema }, { name: 'User', schema: UserSchema }])
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class AppModule {}
