/**
 * Tenancy isolation gate (spec §19, Foundation phase exit criteria):
 * positive AND negative isolation tests against the REAL database.
 *
 *  - Without app.tenant_id, tenant-owned tables return zero rows.
 *  - Tenant A cannot read tenant B's data, even knowing the IDs.
 *  - WITH CHECK blocks writing rows of another tenant.
 */
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const prisma = new PrismaClient();

const tenantA = randomUUID();
const tenantB = randomUUID();

async function withTenant<T>(tenantId: string, fn: (tx: any) => Promise<T>): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}::text, true)`;
    return fn(tx);
  });
}

beforeAll(async () => {
  // Bootstrap both tenants inside their own context (the only way RLS allows).
  for (const [id, name] of [
    [tenantA, "Tenant A"],
    [tenantB, "Tenant B"],
  ] as const) {
    await withTenant(id, async (tx) => {
      await tx.tenant.create({ data: { id, name } });
      await tx.product.create({
        data: {
          tenantId: id,
          id: randomUUID(),
          name: `Product of ${name}`,
          basePriceMinor: 100n,
          taxRateBps: 700,
        },
      });
    });
  }
});

afterAll(async () => {
  for (const id of [tenantA, tenantB]) {
    await withTenant(id, async (tx) => {
      await tx.product.deleteMany({ where: { tenantId: id } });
      await tx.tenant.delete({ where: { id } });
    });
  }
  await prisma.$disconnect();
});

describe("RLS tenant isolation", () => {
  it("returns zero rows without a tenant context", async () => {
    // Raw connection, no set_config — the failure mode that must be safe.
    const rows: { count: bigint }[] =
      await prisma.$queryRaw`SELECT count(*)::bigint AS count FROM products`;
    expect(Number(rows[0]?.count ?? -1)).toBe(0);
  });

  it("tenant A sees only its own products", async () => {
    const products = await withTenant(tenantA, (tx) => tx.product.findMany());
    expect(products).toHaveLength(1);
    expect(products[0].name).toBe("Product of Tenant A");
  });

  it("tenant B cannot read tenant A's products by ID", async () => {
    const aProductIds = await withTenant(tenantA, (tx) =>
      tx.product.findMany({ select: { id: true } }),
    );
    const leaked = await withTenant(tenantB, (tx) =>
      tx.product.findMany({ where: { id: { in: aProductIds.map((p) => p.id) } } }),
    );
    expect(leaked).toHaveLength(0);
  });

  it("WITH CHECK blocks inserting a row for another tenant", async () => {
    await expect(
      withTenant(tenantA, (tx) =>
        tx.product.create({
          data: {
            tenantId: tenantB, // smuggling B's id into A's context
            id: randomUUID(),
            name: "smuggled",
            basePriceMinor: 1n,
            taxRateBps: 0,
          },
        }),
      ),
    ).rejects.toThrow();
  });
});
