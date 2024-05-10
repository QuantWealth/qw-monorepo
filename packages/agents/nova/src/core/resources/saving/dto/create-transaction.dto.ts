import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { SavingType } from 'src/common/types';

export class CreateTransactionDto {
  @IsString()
  @IsEnum(SavingType)
  @IsNotEmpty()
  savingType: SavingType;

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
