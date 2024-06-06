import { ApiProperty } from '@nestjs/swagger';
import { IUser } from '@qw/orderbook-db';
import { NovaResponse } from 'src/common/interfaces/nova-response.interface';


export class UserResponseDto implements IUser {
  @ApiProperty({
    description: 'User EOA address',
    example: '0x0617b72940f105811F251967EE4fdD5E38f159d5',
  })
  id: string;
  @ApiProperty({
    description: 'User Safe address',
    example: '0x0617b72940f105811F251967EE4fdD5E38f159d5',
  })
  wallet: string;
  @ApiProperty({
    description: 'Network Id',
    example: 'eth-sepolia',
  })
  network: string;
  @ApiProperty({
    description: 'Safe is deployed or not',
    example: true,
  })
  deployed: boolean;
  @ApiProperty({
    description: 'Wallet providers',
    isArray: true,
    example: ['metamask', 'web3auth', 'walletconnect'],
  })
  providers: string[];
}

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
  data: UserResponseDto;
}