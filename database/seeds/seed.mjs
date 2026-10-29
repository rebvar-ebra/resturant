/**
 * Development seed — synthetic fixtures only (spec §17: no real tenant data).
 * Runs through the RUNTIME role and sets app.tenant_id per transaction, so a
 * successful seed also proves the RLS path works end-to-end.
 */
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";

const prisma = new PrismaClient();

const USER_ID = randomUUID();
const TENANT_ID = randomUUID();
const LOCATION_ID = randomUUID();
const MEMBERSHIP_ID = randomUUID();

async function withTenant(tenantId, fn) {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}::text, true)`;
    return fn(tx);
  });
}

async function main() {
  // 1. Global user (not tenant-owned).
  await prisma.user.upsert({
    where: { email: "owner@demo.restaurantos.local" },
    update: {},
    create: {
      id: USER_ID,
      email: "owner@demo.restaurantos.local",
      displayName: "Demo Owner",
    },
  });

  // 2. Tenant + location + owner membership inside the tenant context.
  await withTenant(TENANT_ID, async (tx) => {
    await tx.tenant.create({ data: { id: TENANT_ID, name: "Demo Restaurant GmbH" } });
    await tx.location.create({
      data: {
        tenantId: TENANT_ID,
        id: LOCATION_ID,
        name: "Mitte",
        slug: "demo-mitte",
        timezone: "Europe/Berlin",
        currency: "EUR",
      },
    });
    await tx.membership.create({
      data: {
        tenantId: TENANT_ID,
        id: MEMBERSHIP_ID,
        userId: USER_ID,
        role: "owner",
        acceptedAt: new Date(),
      },
    });
  });

  // 3. Minimal catalog so a first order flow can be exercised.
  await withTenant(TENANT_ID, async (tx) => {
    const categoryId = randomUUID();
    await tx.category.create({
      data: { tenantId: TENANT_ID, id: categoryId, name: "Pizza", sortOrder: 1 },
    });
    const margheritaId = randomUUID();
    await tx.product.create({
      data: {
        tenantId: TENANT_ID,
        id: margheritaId,
        categoryId,
        name: "Margherita",
        basePriceMinor: 950n,
        taxRateBps: 700, // 7% food takeaway rate placeholder — tax mapping is confirmed per tenant
      },
    });
    await tx.productAllergen.createMany({
      data: [
        { tenantId: TENANT_ID, productId: margheritaId, allergen: "gluten" },
        { tenantId: TENANT_ID, productId: margheritaId, allergen: "milk" },
      ],
    });
  });

  console.log("Seed complete:");
  console.log(`  x-user-id (dev auth): ${USER_ID}`);
  console.log(`  tenantId:             ${TENANT_ID}`);
  console.log(`  locationId:           ${LOCATION_ID}`);
  console.log(`  public menu slug:     demo-mitte`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
