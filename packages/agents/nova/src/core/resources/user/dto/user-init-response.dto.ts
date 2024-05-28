import { ApiProperty } from '@nestjs/swagger';
import { NovaResponse } from 'src/common/interfaces/nova-response.interface';
import { Transaction } from 'src/common/dto/transaction';

export class UserInitResponseDto implements NovaResponse {
  @ApiProperty({
    description: 'Response message',
    example: 'User created successfully.',
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
  data: Transaction;
}
