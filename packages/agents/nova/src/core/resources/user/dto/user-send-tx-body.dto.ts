import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserSendTxBodyDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '0x...',
  })
  signedTx: string;
}
