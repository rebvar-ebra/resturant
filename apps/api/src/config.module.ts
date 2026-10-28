import { DynamicModule, Global, Module } from "@nestjs/common";
import type { AppConfig } from "@restaurantos/config";
import { CONFIG } from "./config.token.js";

@Global()
@Module({})
export class ConfigModule {
  static forRoot(config: AppConfig): DynamicModule {
    return {
      module: ConfigModule,
      providers: [{ provide: CONFIG, useValue: config }],
      exports: [CONFIG],
    };
  }
}
