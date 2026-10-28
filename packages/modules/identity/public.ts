/**
 * Public contract of the identity module (spec §4.2: explicit exports only).
 * Nothing outside this file may be imported by other modules.
 */
export { Membership, requirePermission, PermissionDeniedDomainError } from "./domain/membership.js";
export { ResolveTenantContext, assertLocationAccess } from "./application/resolve-tenant-context.js";
export type { MembershipRepository, UserRepository } from "./application/ports.js";
export { PrismaMembershipRepository } from "./infrastructure/prisma-membership-repository.js";
