import { ApiProperty } from '@nestjs/swagger';

export class Transaction {
  @ApiProperty({
    description: 'Wallet address of the user',
    example: '0x0617b72940f105811F251967EE4fdD5E38f159d5',
  })
  to: string;
  @ApiProperty({
    description: 'Transaction data',
    example: '0x...',
  })
  data: string;
  @ApiProperty({
    description: 'Transaction value',
    example: '0x...',
  })
  value: string;
}
