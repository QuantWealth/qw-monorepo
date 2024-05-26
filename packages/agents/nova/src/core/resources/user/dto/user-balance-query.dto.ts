import { ApiProperty } from '@nestjs/swagger';
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

export class UserBalanceQueryDto {
  @IsString()
  @IsNotEmpty()
  @Length(42, 42)
  @ApiProperty({
    description: 'The wallet address of the user',
    example: '0x0617b72940f105811F251967EE4fdD5E38f159d5',
  })
  walletAddress: string;

  @IsString()
  @IsEnum(Sort)
  @IsOptional()
  @ApiProperty({
    enum: Sort,
    enumName: 'Sort',
    required: false,
    example: Sort.ASCENDING,
  })
  sort: Sort = Sort.ASCENDING;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  limit: number = 10;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  next: number;
}
