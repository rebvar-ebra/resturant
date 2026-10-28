import { DynamicModule, Module } from "@nestjs/common";
import type { AppConfig } from "@restaurantos/config";
import { ConfigModule } from "./config.module.js";
import { HealthController } from "./health.controller.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { IdentityModule } from "./identity/identity.module.js";
import { OrganizationModule } from "./organization/organization.module.js";

@Module({})
export class AppModule {
  static forRoot(config: AppConfig): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot(config),
        PrismaModule,
        IdentityModule,
        OrganizationModule,
      ],
      controllers: [HealthController],
    };
  }
}
