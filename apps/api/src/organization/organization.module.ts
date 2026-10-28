import { Module } from "@nestjs/common";
import { IdentityModule } from "../identity/identity.module.js";
import { OrganizationController } from "./organization.controller.js";

@Module({
  imports: [IdentityModule],
  controllers: [OrganizationController],
})
export class OrganizationModule {}
