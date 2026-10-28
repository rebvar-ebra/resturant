import { Module } from "@nestjs/common";
import { MeController } from "./me.controller.js";
import { SessionGuard } from "./session.guard.js";
import { TenantContextGuard } from "./tenant-context.guard.js";

@Module({
  controllers: [MeController],
  providers: [SessionGuard, TenantContextGuard],
  exports: [SessionGuard, TenantContextGuard],
})
export class IdentityModule {}
