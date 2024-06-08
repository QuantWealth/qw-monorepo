import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class UserInitBodyDto {
  @IsString()
  @IsNotEmpty()
  @Length(42, 42)
  @ApiProperty({
    example: '0x0617b72940f105811F251967EE4fdD5E38f159d5',
  })
  signerAddress: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Length(1, 42)
  @ApiProperty({
    example: 'metamask',
    required: false,
  })
  provider: string;
}
