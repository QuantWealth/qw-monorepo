import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export enum Sort {
  ASCENDING = 'asc',
  DESCENDING = 'desc',
}

export class UserBalanceQuery {
  @IsString()
  @IsNotEmpty()
  @Length(42, 42)
  walletAddress: string;

  @IsString()
  @IsEnum(Sort)
  @IsOptional()
  sort: Sort = Sort.ASCENDING;

  @IsNumber()
  @IsOptional()
  limit: number;

  @IsNumber()
  @IsOptional()
  next: number;
}
