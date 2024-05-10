import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './core/resources/user/user.module';
import { SavingModule } from './core/resources/saving/saving.module';

@Module({
  imports: [UserModule, SavingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
