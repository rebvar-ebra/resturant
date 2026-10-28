import type { Uuid } from "@restaurantos/shared-kernel";
import type { Membership } from "../domain/membership.js";

/**
 * Ports of the identity module. Other modules consume identity only through
 * these application services — never through its repositories (spec §4.2.2).
 */
export interface MembershipRepository {
  findActiveByUserAndTenant(
    tx: unknown,
    userId: Uuid,
    tenantId: Uuid,
  ): Promise<Membership | null>;

  listByUser(tx: unknown, userId: Uuid): Promise<Membership[]>;
}

export interface UserRepository {
  findById(
    tx: unknown,
    userId: Uuid,
  ): Promise<{ id: Uuid; email: string; displayName: string; disabledAt: Date | null } | null>;
}
