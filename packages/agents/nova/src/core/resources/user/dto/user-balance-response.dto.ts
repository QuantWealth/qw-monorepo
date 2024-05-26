import { BalancesResponse } from '@covalenthq/client-sdk';
import { ApiProperty } from '@nestjs/swagger';
import { NovaResponse } from 'src/common/interfaces/nova-response.interface';

export class UserBalanceResponseDto implements NovaResponse {
  @ApiProperty({
    description: 'Response message',
    example: 'Balance fetched successfully.',
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
  data: BalancesResponse;
}
