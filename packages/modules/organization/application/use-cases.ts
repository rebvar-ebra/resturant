import type { AuthorizedTenantContext, Uuid } from "@restaurantos/shared-kernel";
import { Location } from "../domain/location.js";
import { Tenant } from "../domain/tenant.js";
import type { LocationRepository, TenantRepository } from "./ports.js";

/**
 * Bootstrap: an authenticated user creates a tenant and becomes its owner.
 * The owner membership is written by the identity module's port so that
 * organization never writes into identity's tables (spec §4.2.1).
 */
export interface OwnerMembershipWriter {
  createOwnerMembership(
    tx: unknown,
    tenantId: Uuid,
    userId: Uuid,
  ): Promise<void>;
}

export class CreateTenant {
  constructor(
    private readonly tenants: TenantRepository,
    private readonly ownerMemberships: OwnerMembershipWriter,
  ) {}

  /**
   * The tenant aggregate is built by the caller so the bootstrap
   * transaction can run inside the *new* tenant's RLS context
   * (tenants policy requires id = app.tenant_id).
   */
  async execute(
    tx: unknown,
    input: { tenant: Tenant; ownerUserId: Uuid },
  ): Promise<{ tenantId: Uuid }> {
    await this.tenants.insert(tx, input.tenant);
    await this.ownerMemberships.createOwnerMembership(
      tx,
      input.tenant.id,
      input.ownerUserId,
    );
    return { tenantId: input.tenant.id };
  }
}

export class CreateLocation {
  constructor(private readonly locations: LocationRepository) {}

  async execute(
    tx: unknown,
    ctx: AuthorizedTenantContext,
    input: {
      name: string;
      slug?: string | undefined;
      timezone?: string | undefined;
      currency?: string | undefined;
      businessDayCutoff?: string | undefined;
    },
  ): Promise<{ locationId: Uuid }> {
    const location = Location.create({ tenantId: ctx.tenantId, ...input });
    await this.locations.insert(tx, location);
    return { locationId: location.id };
  }
}

export class ListLocations {
  constructor(private readonly locations: LocationRepository) {}

  async execute(
    tx: unknown,
    ctx: AuthorizedTenantContext,
  ): Promise<Location[]> {
    const all = await this.locations.listByTenant(tx, ctx.tenantId);
    if (ctx.locationIds.length === 0) return all;
    return all.filter((l) => ctx.locationIds.includes(l.id));
  }
}
