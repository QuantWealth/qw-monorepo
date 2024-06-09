import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString, Length } from 'class-validator';
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types';
import { NovaResponse } from 'src/common/interfaces/nova-response.interface';
import { TransactionRequest, TypedDataEncoder } from 'ethers';

export class OrderbookGetApproveTxQueryDto {
  @IsString()
  @IsNotEmpty()
  @Length(42, 42)
  @ApiProperty({
    description: 'Asset address',
    example: '0x83A9aE82b26249EC6e01498F5aDf0Ec20fF3Da9C',
  })
  assetAddress: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The amount of token to be approved',
    example: '1000000',
  })
  amount: string;
}

export class OrderbookSendApproveTxQueryDto {
  @IsString()
  @IsNotEmpty()
  @Length(42, 42)
  @ApiProperty({
    description: 'User\'s EOA Address',
    example: '0x0617b72940f105811F251967EE4fdD5E38f159d5',
  })
  signerAddress: string;

  @IsString()
  @IsNotEmpty()
  @Length(42, 42)
  @ApiProperty({
    description: 'User\'s Safe Wallet Address',
    example: '0x0617b72940f105811F251967EE4fdD5E38f159d5',
  })
  walletAddress: string;

  @ApiProperty({
    description: 'Meta transation data received from get approve tx',
  })
  metaTransaction: MetaTransactionData;

  @IsNotEmpty()
  @ApiProperty({
    description: 'The signed tx',
  })
  signature: string;

  @IsIn(['FLEXI', 'FIXED'])
  @IsNotEmpty()
  @ApiProperty({
    description: 'The strategy type',
    example: 'FLEXI',
  })
  strategyType: 'FLEXI' | 'FIXED'; // Use union type to specify allowed values

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The amount of token to be approved',
    example: '1000000',
  })
  amount: string;
}

export class OrderbookGetApproveTxDataDto {
  @ApiProperty({
    description: 'Raw Transaction Metadata',
  })
  txData: MetaTransactionData;
  @ApiProperty({
    description: 'Json Typed Data to be signed',
    example: '{...}',
  })
  typedData: string;
}

export class OrderbookGetApproveTxResponseDto implements NovaResponse {
  @ApiProperty({
    description: 'Response message',
    example: 'Approve transaction created successfully.',
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
  data: OrderbookGetApproveTxDataDto;
}

export class OrderbookSendResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Transaction submitted successfully.',
  })
  message: string;
  @ApiProperty({
    description: 'Response status code',
    example: 201,
  })
  statusCode: number;
  @ApiProperty({
    description: 'Gelato relayer task data',
  })
  data: { taskId: string };
}
