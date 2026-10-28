import type { AuthorizedTenantContext, Uuid } from "@restaurantos/shared-kernel";
import { NotFoundError, PermissionDeniedError } from "@restaurantos/shared-kernel";
import type { MembershipRepository } from "./ports.js";

/**
 * Builds the AuthorizedTenantContext (spec §13.2):
 * session already validated upstream → tenant id from URL is only a selector
 * → active membership verified here → role and location scope attached.
 */
export class ResolveTenantContext {
  constructor(private readonly memberships: MembershipRepository) {}

  async execute(
    tx: unknown,
    userId: Uuid,
    tenantId: Uuid,
  ): Promise<AuthorizedTenantContext> {
    const membership = await this.memberships.findActiveByUserAndTenant(
      tx,
      userId,
      tenantId,
    );

    // Spec §16.1: an id the user may not see returns 404, not 403-with-leak.
    if (!membership || !membership.isActive) {
      throw new NotFoundError("tenant", tenantId);
    }

    return membership.toContext();
  }
}

export function assertLocationAccess(
  ctx: AuthorizedTenantContext,
  locationId: Uuid,
): void {
  if (ctx.locationIds.length > 0 && !ctx.locationIds.includes(locationId)) {
    throw new PermissionDeniedError("Location is outside membership scope");
  }
}
