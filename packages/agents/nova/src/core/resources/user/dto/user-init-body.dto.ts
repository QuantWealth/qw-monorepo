import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class UserInitBodyDto {
  @IsString()
  @IsNotEmpty()
  @Length(42, 42)
  @ApiProperty({
    example: '0x0617b72940f105811F251967EE4fdD5E38f159d5',
  })
  walletAddress: string;
}
