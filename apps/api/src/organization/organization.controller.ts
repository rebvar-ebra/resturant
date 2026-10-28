import { Body, Controller, Get, Inject, Post, UseGuards } from "@nestjs/common";
import {
  CreateLocation,
  CreateTenant,
  ListLocations,
  PrismaLocationRepository,
  PrismaOwnerMembershipWriter,
  PrismaTenantRepository,
  Tenant,
} from "@restaurantos/organization";
import { requirePermission } from "@restaurantos/identity";
import type { AuthorizedTenantContext, Uuid } from "@restaurantos/shared-kernel";
import { z } from "zod";
import { PrismaService } from "../prisma/prisma.service.js";
import { CurrentTenantContext, CurrentUser } from "../identity/decorators.js";
import { SessionGuard } from "../identity/session.guard.js";
import { TenantContextGuard } from "../identity/tenant-context.guard.js";

const createTenantSchema = z.object({
  name: z.string().min(2).max(120),
});

const createLocationSchema = z.object({
  name: z.string().min(2).max(120),
  timezone: z.string().optional(),
  currency: z.string().length(3).optional(),
  businessDayCutoff: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
});

@Controller("tenants")
export class OrganizationController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  /** Bootstrap: create tenant + owner membership in one transaction. */
  @Post()
  @UseGuards(SessionGuard)
  async createTenant(
    @CurrentUser() userId: Uuid,
    @Body() body: unknown,
  ) {
    const input = createTenantSchema.parse(body);
    const useCase = new CreateTenant(
      new PrismaTenantRepository(),
      new PrismaOwnerMembershipWriter(),
    );
    // Bootstrap runs inside the NEW tenant's RLS context: tenants policy
    // requires id = app.tenant_id and the owner membership requires the
    // tenant clause (ADR-0001).
    const tenant = Tenant.create(input.name);
    return this.prisma.withTenantTransaction({ tenantId: tenant.id }, (tx) =>
      useCase.execute(tx, { tenant, ownerUserId: userId }),
    );
  }

  @Post(":tenantId/locations")
  @UseGuards(SessionGuard, TenantContextGuard)
  async createLocation(
    @CurrentTenantContext() ctx: AuthorizedTenantContext,
    @Body() body: unknown,
  ) {
    requirePermission(ctx, "tenant.settings");
    const input = createLocationSchema.parse(body);
    return this.prisma.withTenantTransaction(ctx, async (tx) => {
      return new CreateLocation(new PrismaLocationRepository()).execute(
        tx,
        ctx,
        input,
      );
    });
  }

  @Get(":tenantId/locations")
  @UseGuards(SessionGuard, TenantContextGuard)
  async listLocations(@CurrentTenantContext() ctx: AuthorizedTenantContext) {
    const locations = await this.prisma.withTenantTransaction(ctx, (tx) =>
      new ListLocations(new PrismaLocationRepository()).execute(tx, ctx),
    );
    return {
      locations: locations.map((l) => ({
        id: l.id,
        name: l.name,
        timezone: l.timezone,
        currency: l.currency,
        businessDayCutoff: l.businessDayCutoff,
      })),
    };
  }
}
