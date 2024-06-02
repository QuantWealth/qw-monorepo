import { Module } from '@nestjs/common';
import { SavingService } from './saving.service';
import { SavingController } from './saving.controller';
import { orderProviders } from '../orderbook/orderbook.providers';
import { DatabaseModule } from 'src/core/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [SavingController],
  providers: [SavingService, ...orderProviders],
})
export class SavingModule {}
