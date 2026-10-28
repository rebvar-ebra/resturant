import type { PrismaClient } from "@prisma/client";
import type { Role, Uuid } from "@restaurantos/shared-kernel";
import { Membership } from "../domain/membership.js";
import type { MembershipRepository } from "../application/ports.js";

type Tx = Pick<PrismaClient, "membership" | "membershipLocation">;

export class PrismaMembershipRepository implements MembershipRepository {
  async findActiveByUserAndTenant(
    tx: unknown,
    userId: Uuid,
    tenantId: Uuid,
  ): Promise<Membership | null> {
    const client = tx as Tx;
    const row = await client.membership.findUnique({
      where: { tenantId_userId: { tenantId, userId } },
      include: { locations: true },
    });
    if (!row) return null;
    return new Membership(
      row.tenantId,
      row.id,
      row.userId,
      row.role as Role,
      row.locations.map((l) => l.locationId),
      row.disabledAt,
    );
  }

  async listByUser(tx: unknown, userId: Uuid): Promise<Membership[]> {
    const client = tx as Tx;
    const rows = await client.membership.findMany({
      where: { userId, disabledAt: null },
      include: { locations: true },
    });
    return rows.map(
      (row) =>
        new Membership(
          row.tenantId,
          row.id,
          row.userId,
          row.role as Role,
          row.locations.map((l) => l.locationId),
          row.disabledAt,
        ),
    );
  }
}
