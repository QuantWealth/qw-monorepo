import { Type, Static } from '@sinclair/typebox';
import { TAddress, TLogLevel } from '@qw/utils';

// Define the TChainConfig schema
export const TChainConfig = Type.Object({
  providers: Type.Array(Type.String()),
  contractAddresses: Type.Object({
    QWManager: Type.Object({
      contractName: Type.String(),
      address: TAddress,
    }),
    QWRegistry: Type.Object({
      contractName: Type.String(),
      address: TAddress,
    }),
    QWAaveV3: Type.Object({
      contractName: Type.String(),
      address: TAddress,
    }),
  }),
});

// Define the TRPCConfig schema
export const TRPCConfig = Type.Object({
  url: Type.String(),
});

// Define the NovaConfigSchema
export const NovaConfigSchema = Type.Object({
  chains: Type.Record(Type.String(), TChainConfig),
  logLevel: TLogLevel,
  gelatoApiKey: Type.String(),
  privateKey: Type.String(),
  environment: Type.Union([
    Type.Literal('staging'),
    Type.Literal('production'),
  ]),
});

export type NovaConfig = Static<typeof NovaConfigSchema>;
