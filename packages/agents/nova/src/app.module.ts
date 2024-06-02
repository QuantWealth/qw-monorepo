import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SavingModule } from './core/resources/saving/saving.module';
import { UserModule } from './core/resources/user/user.module';
import { DatabaseModule } from './core/database/database.module';
import { OrderbookModule } from './core/resources/orderbook/orderbook.module';

@Module({
  imports: [UserModule, OrderbookModule, SavingModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
