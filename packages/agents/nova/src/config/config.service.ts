import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigModuleOptions } from '@nestjs/config';
import Ajv from 'ajv';
import { config as dotEnvConfig } from 'dotenv';
import * as fs from 'fs';
import { MODULE_OPTIONS_TOKEN } from './config.module-definition';
import { NovaConfig, NovaConfigSchema } from './schema';

@Injectable()
export class ConfigService {
  private readonly novaConfig: NovaConfig | undefined;
  private readonly logger = new Logger(ConfigService.name);

  /**
   * Gets and validates the nova config from the environment.
   * @returns The nova config with sensible defaults
   */
  constructor(@Inject(MODULE_OPTIONS_TOKEN) private options: ConfigModuleOptions) {
    // Load environment variables
    dotEnvConfig();

    if (!this.novaConfig) {
      this.novaConfig = this.getEnvConfig();
    }
  };

  get(): NovaConfig {
    return this.novaConfig;
  }

  getEnvConfig(): NovaConfig {
    let configJson: Record<string, any> = {};
    let configFile: any = {};

    try {
      configJson = JSON.parse(process.env.NOVA_CONFIG || '');
    } catch (e: unknown) {
      this.logger.log(
        'No NOVA_CONFIG exists; using config file and individual env vars.',
      );
    }

    try {
      const configPath = process.env.NOVA_CONFIG_FILE ?? `${__dirname}/config.json`;

      if (fs.existsSync(configPath)) {
        const json = fs.readFileSync(configPath, { encoding: 'utf-8' });
        configFile = JSON.parse(json);
      }
    } catch (e: unknown) {
      this.logger.error('Error reading config file!');
      process.exit(1);
    }

    const novaConfig: NovaConfig = {
      mongoUrl: process.env.MONGO_URL
        ? JSON.parse(process.env.MONGO_URL)
        : configJson.mongoUrl || configFile.mongoUrl,
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

}