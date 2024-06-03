import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './core/database/database.module';
import { OrderbookModule } from './core/resources/orderbook/orderbook.module';
import { SavingModule } from './core/resources/saving/saving.module';
import { UserModule } from './core/resources/user/user.module';
import { ConfigModule } from './config/config.module';



@Module({
  imports: [
    ConfigModule.register({
      isGlobal: true,
    }),
    UserModule, OrderbookModule, SavingModule, DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
