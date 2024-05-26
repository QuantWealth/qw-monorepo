import { Type, Static } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

/**
 * Configuration schema for TransactionService.
 * Defines the structure and validation rules for the configuration object.
 */
export const ConfigSchema = Type.Record(
  Type.Number(), // Chain ID number as indexing key.
  Type.Object({
    providers: Type.Array(Type.String()),                 // List of RPC provider URLs.
    confirmationsRequired: Type.Number(),                 // Number of confirmations needed for a transaction to be considered confirmed.
    timeout: Type.Number(),                               // Timeout for transaction confirmation in milliseconds.
    targetProvidersPerCall: Type.Number(),                // Number of providers to contact per transaction dispatch.
    gasPriceMax: Type.String(),                           // Maximum gas price.
    gasPriceMin: Type.String(),                           // Minimum gas price.
    gasPriceBump: Type.String(),                          // Gas price bump percentage for retries.
    quorum: Type.Number(),                                // Minimum number of successful RPC responses needed.
    maxRetries: Type.Optional(Type.Number()),             // Maximum number of retries for a transaction.
    pendingTimeoutBlocks: Type.Optional(Type.Number())    // Timeout for considering a transaction as pending in blocks.
  })
);

/**
 * TypeScript type for the TransactionService configuration schema.
 */
export type TransactionServiceConfig = Static<typeof ConfigSchema>;

/**
 * Validates a given configuration object against the ConfigSchema.
 * @param config - The configuration object to validate.
 * @returns True if the configuration is valid, otherwise throws an error.
 */
export function validateConfig(config: any): boolean {
  const result = Value.Check(ConfigSchema, config);
  if (!result) {
    throw new Error('Invalid TransactionService configuration.');
  }
  return true;
}
