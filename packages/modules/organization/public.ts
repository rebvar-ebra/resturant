export { Tenant } from "./domain/tenant.js";
export { Location } from "./domain/location.js";
export {
  CreateTenant,
  CreateLocation,
  ListLocations,
  type OwnerMembershipWriter,
} from "./application/use-cases.js";
export type { TenantRepository, LocationRepository } from "./application/ports.js";
export {
  PrismaTenantRepository,
  PrismaLocationRepository,
  PrismaOwnerMembershipWriter,
} from "./infrastructure/prisma-repositories.js";
