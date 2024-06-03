import { ConfigurableModuleBuilder } from "@nestjs/common";
import { ConfigModuleOptions } from "@nestjs/config";

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE, ASYNC_OPTIONS_TYPE } = new ConfigurableModuleBuilder<ConfigModuleOptions>()
  .setExtras(
    {
      isGlobal: true,
    },
    (definition, extras) => ({
      ...definition,
      global: extras.isGlobal,
    }),
  )
  .build();