import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
} from 'class-validator';

export enum Sort {
  ASCENDING = 'ascending',
  DESCENDING = 'descending',
}

export class UserBalanceQuery {
  @IsString()
  @IsNotEmpty()
  @Length(42, 42)
  walletAddress: string;

  @IsString()
  @IsEnum(Sort)
  @IsNotEmpty()
  sort: Sort;

  @IsNumber()
  @IsNotEmpty()
  limit: number;

  @IsNumber()
  @IsNotEmpty()
  next: number;
}
