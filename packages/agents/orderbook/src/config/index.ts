import * as fs from 'fs';
import * as path from 'path';
import * as Ajv from 'ajv';

const ajv = new Ajv();
const schema = require('./schema.json');

const validate = ajv.compile(schema);

interface Config {
  handleExecutions: boolean;
}

let config: Config;

export function loadConfig(): Config {
  if (!config) {
    const configPath = path.resolve(__dirname, 'config.json');
    const configData = fs.readFileSync(configPath, 'utf-8');
    const parsedConfig = JSON.parse(configData);

    const valid = validate(parsedConfig);
    if (!valid) {
      console.error('Invalid configuration:', validate.errors);
      process.exit(1);
    }

    config = parsedConfig as Config;
  }
  return config;
}
