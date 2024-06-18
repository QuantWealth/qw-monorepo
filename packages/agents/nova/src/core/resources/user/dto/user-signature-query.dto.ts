import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserSignatureQueryDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The private key of the user',
  })
  privateKey: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Typed data',
  })
  typedData: string;
}
