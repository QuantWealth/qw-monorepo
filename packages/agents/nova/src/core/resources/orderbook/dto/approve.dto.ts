import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString, Length } from 'class-validator';
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types';
import { NovaResponse } from 'src/common/interfaces/nova-response.interface';

export class OrderbookGetApproveTxQueryDto {
  @IsString()
  @IsNotEmpty()
  @Length(42, 42)
  @ApiProperty({
    description: 'The asset address',
    example: '0x0617b72940f105811F251967EE4fdD5E38f159d5',
  })
  assetAddress: string;

  @IsString()
  @IsNotEmpty()
  @Length(42, 42)
  @ApiProperty({
    description: 'The amount of token to be approved',
    example: '10000000',
  })
  amount: string;
}

export class OrderbookSendApproveTxQueryDto {
  @IsString()
  @IsNotEmpty()
  @Length(42, 42)
  @ApiProperty({
    description: 'The user wallet address',
    example: '0x0617b72940f105811F251967EE4fdD5E38f159d5',
  })
  userWalletAddress: string;

  @IsString()
  @IsNotEmpty()
  @Length(42, 42)
  @ApiProperty({
    description: 'The user scw address',
    example: '0x0617b72940f105811F251967EE4fdD5E38f159d5',
  })
  userScwAddress: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'The signed tx',
  })
  userSignedTransaction: MetaTransactionData;

  @IsIn(['FLEXI', 'FIXED'])
  @IsNotEmpty()
  @ApiProperty({
    description: 'The strategy type',
    example: 'FLEXI',
  })
  strategyType: 'FLEXI' | 'FIXED'; // Use union type to specify allowed values

  @IsString()
  @IsNotEmpty()
  @Length(42, 42)
  @ApiProperty({
    description: 'The amount of token to be approved',
    example: '10000000',
  })
  amount: string;
}

export class OrderbookGetApproveTxResponseDto implements NovaResponse {
  @ApiProperty({
    description: 'Response message',
    example: 'Apy data fetched successfully.',
  })
  message: string;
  @ApiProperty({
    description: 'Response status code',
    example: 201,
  })
  statusCode: number;
  @ApiProperty({
    description: 'Response data',
  })
  data: ApyResponse;
}

export class ApyResponse {
  @IsString()
  @IsNotEmpty()
  apy: string;
}

export class OrderbookSendResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Apy data fetched successfully.',
  })
  message: string;
  @ApiProperty({
    description: 'Response status code',
    example: 201,
  })
  statusCode: number;
}
