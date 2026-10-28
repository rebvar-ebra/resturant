import type { PrismaClient } from "@prisma/client";
import type { Uuid } from "@restaurantos/shared-kernel";
import { newId } from "@restaurantos/shared-kernel";
import { Location } from "../domain/location.js";
import { Tenant } from "../domain/tenant.js";
import type { OwnerMembershipWriter } from "../application/use-cases.js";
import type {
  LocationRepository,
  TenantRepository,
} from "../application/ports.js";

type Tx = Pick<
  PrismaClient,
  "tenant" | "location" | "membership" | "membershipLocation"
>;

export class PrismaTenantRepository implements TenantRepository {
  async insert(tx: unknown, tenant: Tenant): Promise<void> {
    const client = tx as Tx;
    await client.tenant.create({
      data: { id: tenant.id, name: tenant.name },
    });
  }

  async findById(tx: unknown, tenantId: Uuid): Promise<Tenant | null> {
    const client = tx as Tx;
    const row = await client.tenant.findUnique({ where: { id: tenantId } });
    if (!row) return null;
    return Tenant.create(row.name) && (rehydrate(row.id, row.name) as Tenant);
  }
}

function rehydrate(id: Uuid, name: string): Tenant {
  // Bypass factory validation for persistence round-trip.
  const t = Object.create(Tenant.prototype) as Tenant;
  Object.assign(t, { id, name });
  return t;
}

export class PrismaLocationRepository implements LocationRepository {
  async insert(tx: unknown, location: Location): Promise<void> {
    const client = tx as Tx;
    await client.location.create({
      data: {
        tenantId: location.tenantId,
        id: location.id,
        name: location.name,
        timezone: location.timezone,
        currency: location.currency,
        businessDayCutoff: location.businessDayCutoff,
      },
    });
  }

  async listByTenant(tx: unknown, tenantId: Uuid): Promise<Location[]> {
    const client = tx as Tx;
    const rows = await client.location.findMany({
      where: { tenantId },
      orderBy: { name: "asc" },
    });
    return rows.map((row) =>
      rehydrateLocation(
        row.tenantId,
        row.id,
        row.name,
        row.timezone,
        row.currency,
        row.businessDayCutoff,
      ),
    );
  }

  async findById(
    tx: unknown,
    tenantId: Uuid,
    locationId: Uuid,
  ): Promise<Location | null> {
    const client = tx as Tx;
    const row = await client.location.findUnique({
      where: { tenantId_id: { tenantId, id: locationId } },
    });
    if (!row) return null;
    return rehydrateLocation(
      row.tenantId,
      row.id,
      row.name,
      row.timezone,
      row.currency,
      row.businessDayCutoff,
    );
  }
}

function rehydrateLocation(
  tenantId: Uuid,
  id: Uuid,
  name: string,
  timezone: string,
  currency: string,
  businessDayCutoff: string,
): Location {
  const l = Object.create(Location.prototype) as Location;
  Object.assign(l, { tenantId, id, name, timezone, currency, businessDayCutoff });
  return l;
}

/** Writes the owner membership through identity's table, called inside the same tx. */
export class PrismaOwnerMembershipWriter implements OwnerMembershipWriter {
  async createOwnerMembership(
    tx: unknown,
    tenantId: Uuid,
    userId: Uuid,
  ): Promise<void> {
    const client = tx as Tx;
    await client.membership.create({
      data: {
        tenantId,
        id: newId(),
        userId,
        role: "owner",
        acceptedAt: new Date(),
      },
    });
  }
}
