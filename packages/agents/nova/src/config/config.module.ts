import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ASYNC_OPTIONS_TYPE, ConfigurableModuleClass, OPTIONS_TYPE } from './config.module-definition';

@Module({
    providers: [ConfigService],
    exports: [ConfigService],
})
export class ConfigModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE): DynamicModule {
        return {
          ...super.register(options),
        };
      }
    
      static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
        return {
          ...super.registerAsync(options),
        };
      }
}
