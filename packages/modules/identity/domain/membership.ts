import {
  ROLE_PERMISSIONS,
  type AuthorizedTenantContext,
  type Role,
  type Uuid,
} from "@restaurantos/shared-kernel";

/**
 * Membership aggregate (spec §13.1): access to a tenant is granted through a
 * membership, optionally scoped to specific locations.
 */
export class Membership {
  constructor(
    readonly tenantId: Uuid,
    readonly id: Uuid,
    readonly userId: Uuid,
    readonly role: Role,
    readonly locationIds: readonly Uuid[],
    readonly disabledAt: Date | null,
  ) {}

  get isActive(): boolean {
    return this.disabledAt === null;
  }

  canAccessLocation(locationId: Uuid): boolean {
    if (this.locationIds.length === 0) return true; // unscoped = all locations
    return this.locationIds.includes(locationId);
  }

  permissions(): readonly string[] {
    return ROLE_PERMISSIONS[this.role];
  }

  toContext(): AuthorizedTenantContext {
    if (!this.isActive) {
      throw new Error("Membership is disabled");
    }
    return {
      tenantId: this.tenantId,
      userId: this.userId,
      membershipId: this.id,
      role: this.role,
      locationIds: this.locationIds,
      permissions: this.permissions(),
    };
  }
}

/** permissions.require(ctx, "order.accept") style check (spec §8.4). */
export function requirePermission(
  ctx: AuthorizedTenantContext,
  permission: string,
  locationId?: Uuid,
): void {
  if (!ctx.permissions.includes(permission)) {
    throw new PermissionDeniedDomainError(permission);
  }
  if (
    locationId !== undefined &&
    ctx.locationIds.length > 0 &&
    !ctx.locationIds.includes(locationId)
  ) {
    throw new PermissionDeniedDomainError(permission, { locationId });
  }
}

export class PermissionDeniedDomainError extends Error {
  readonly code = "PERMISSION_DENIED";
  constructor(
    permission: string,
    readonly details?: Record<string, unknown>,
  ) {
    super(`Missing permission: ${permission}`);
  }
}
