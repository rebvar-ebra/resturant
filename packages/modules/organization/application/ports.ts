import type { Uuid } from "@restaurantos/shared-kernel";
import type { Location } from "../domain/location.js";
import type { Tenant } from "../domain/tenant.js";

export interface TenantRepository {
  insert(tx: unknown, tenant: Tenant): Promise<void>;
  findById(tx: unknown, tenantId: Uuid): Promise<Tenant | null>;
}

export interface LocationRepository {
  insert(tx: unknown, location: Location): Promise<void>;
  listByTenant(tx: unknown, tenantId: Uuid): Promise<Location[]>;
  findById(tx: unknown, tenantId: Uuid, locationId: Uuid): Promise<Location | null>;
}
