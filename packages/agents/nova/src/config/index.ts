import * as fs from 'fs';
import Ajv from 'ajv';
import { config as dotEnvConfig } from 'dotenv';
import { NovaConfig, NovaConfigSchema } from './schema';

// Load environment variables
dotEnvConfig();

export const getEnvConfig = (): NovaConfig => {
  let configJson: Record<string, any> = {};
  let configFile: any = {};

  try {
    configJson = JSON.parse(process.env.NOVA_CONFIG || '');
  } catch (e: unknown) {
    console.info(
      'No NOVA_CONFIG exists; using config file and individual env vars.',
    );
  }

  try {
    const path = process.env.NOVA_CONFIG_FILE ?? 'config.json';
    if (fs.existsSync(path)) {
      const json = fs.readFileSync(path, { encoding: 'utf-8' });
      configFile = JSON.parse(json);
    }
  } catch (e: unknown) {
    console.error('Error reading config file!');
    process.exit(1);
  }

  const novaConfig: NovaConfig = {
    chains: process.env.NOVA_CHAIN_CONFIG
      ? JSON.parse(process.env.NOVA_CHAIN_CONFIG)
      : configJson.chains || configFile.chains,
    logLevel:
      process.env.NOVA_LOG_LEVEL ||
      configJson.logLevel ||
      configFile.logLevel ||
      'info',
    environment:
      process.env.NOVA_ENVIRONMENT ||
      configJson.environment ||
      configFile.environment ||
      'staging',
    gelatoApiKey:
      process.env.GELATO_API_KEY ||
      configJson.gelatoApiKey ||
      configFile.gelatoApiKey,
    privateKey:
      process.env.PRIVATE_KEY || configJson.privateKey || configFile.privateKey,
  };

  const ajv = new Ajv();
  const validate = ajv.compile(NovaConfigSchema);
  const valid = validate(novaConfig);
  if (!valid) {
    throw new Error(
      validate.errors
        ?.map((err: any) => JSON.stringify(err, null, 2))
        .join(','),
    );
  }

  return novaConfig;
};

export let novaConfig: NovaConfig | undefined;

/**
 * Gets and validates the nova config from the environment.
 * @returns The nova config with sensible defaults
 */
export const getConfig = async (): Promise<NovaConfig> => {
  if (!novaConfig) {
    novaConfig = getEnvConfig();
  }
  return novaConfig;
};
