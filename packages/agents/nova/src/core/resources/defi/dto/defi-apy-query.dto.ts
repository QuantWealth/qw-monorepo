import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export enum Sort {
  ASCENDING = 'asc',
  DESCENDING = 'desc',
}

export class DefiApyQueryDto {
  @IsString()
  @IsNotEmpty()
  @Length(42, 42)
  @ApiProperty({
    description: 'The asset address',
    example: '0x0617b72940f105811F251967EE4fdD5E38f159d5',
  })
  assetAddress: string;
}
