import { Module } from '@nestjs/common';
import { OrderbookService } from './orderbook.service';
import { OrderbookController } from './orderbook.controller';
import { orderProviders } from '../orderbook/orderbook.providers';
import { DatabaseModule } from 'src/core/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [OrderbookController],
  providers: [OrderbookService, ...orderProviders],
})
export class OrderbookModule {}
