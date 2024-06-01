import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NovaResponse } from 'src/common/interfaces/nova-response.interface';

export class DefiApyResponse implements NovaResponse {
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
