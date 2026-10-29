import type { PrismaClient } from "@prisma/client";
import { newId, type Uuid } from "@restaurantos/shared-kernel";
import { MenuVersion } from "../domain/menu-version.js";
import type {
  CatalogRepository,
  ProductRecord,
  PublicMenu,
} from "../application/ports.js";

type Tx = Pick<
  PrismaClient,
  | "product"
  | "category"
  | "productAllergen"
  | "menuVersion"
  | "menuItem"
  | "location"
  | "locationProductOverride"
>;

export class PrismaCatalogRepository implements CatalogRepository {
  async createProduct(
    tx: unknown,
    input: {
      tenantId: Uuid;
      name: string;
      categoryName: string;
      basePriceMinor: bigint;
      taxRateBps: number;
      allergens: string[];
    },
  ): Promise<{ productId: Uuid }> {
    const client = tx as Tx;

    const categoryName = input.categoryName.trim();
    let category = await client.category.findFirst({
      where: { tenantId: input.tenantId, name: categoryName },
    });
    if (!category) {
      category = await client.category.create({
        data: { tenantId: input.tenantId, id: newId(), name: categoryName },
      });
    }

    const productId = newId();
    await client.product.create({
      data: {
        tenantId: input.tenantId,
        id: productId,
        categoryId: category.id,
        name: input.name.trim(),
        basePriceMinor: input.basePriceMinor,
        taxRateBps: input.taxRateBps,
      },
    });
    if (input.allergens.length > 0) {
      await client.productAllergen.createMany({
        data: input.allergens.map((allergen) => ({
          tenantId: input.tenantId,
          productId,
          allergen: allergen.trim().toLowerCase(),
        })),
      });
    }
    return { productId };
  }

  async listProducts(tx: unknown, tenantId: Uuid): Promise<ProductRecord[]> {
    const client = tx as Tx;
    const rows = await client.product.findMany({
      where: { tenantId },
      include: { category: true, allergens: true },
      orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
    });
    return rows.map((row) => ({
      id: row.id,
      categoryId: row.categoryId,
      categoryName: row.category?.name ?? null,
      name: row.name,
      basePriceMinor: row.basePriceMinor,
      taxRateBps: row.taxRateBps,
      isActive: row.isActive,
      allergens: row.allergens.map((a) => a.allergen),
    }));
  }

  async nextMenuVersionNumber(tx: unknown, tenantId: Uuid): Promise<number> {
    const client = tx as Tx;
    const latest = await client.menuVersion.findFirst({
      where: { tenantId },
      orderBy: { version: "desc" },
      select: { version: true },
    });
    return (latest?.version ?? 0) + 1;
  }

  async publishSnapshot(
    tx: unknown,
    input: { tenantId: Uuid; menuVersionId: Uuid; version: number },
  ): Promise<void> {
    const client = tx as Tx;

    // Archive the currently published version (if any).
    await client.menuVersion.updateMany({
      where: { tenantId: input.tenantId, status: "published" },
      data: { status: "archived" },
    });

    await client.menuVersion.create({
      data: {
        tenantId: input.tenantId,
        id: input.menuVersionId,
        version: input.version,
        status: "published",
        publishedAt: new Date(),
      },
    });

    const products = await client.product.findMany({
      where: { tenantId: input.tenantId, isActive: true },
      orderBy: { name: "asc" },
    });
    if (products.length === 0) {
      throw new Error("Cannot publish an empty menu");
    }

    await client.menuItem.createMany({
      data: products.map((p, index) => ({
        tenantId: input.tenantId,
        id: newId(),
        menuVersionId: input.menuVersionId,
        productId: p.id,
        nameSnapshot: p.name,
        priceMinor: p.basePriceMinor,
        taxRateBps: p.taxRateBps,
        sortOrder: index,
      })),
    });
  }

  async publishedVersion(tx: unknown, tenantId: Uuid): Promise<MenuVersion | null> {
    const client = tx as Tx;
    const row = await client.menuVersion.findFirst({
      where: { tenantId, status: "published" },
      orderBy: { version: "desc" },
    });
    if (!row) return null;
    return new MenuVersion(row.tenantId, row.id, row.version, "published");
  }

  /**
   * Public read: resolves the location by slug and returns ONLY the published
   * menu. Runs in the tenant's RLS context established by the caller.
   */
  async publicMenuBySlug(tx: unknown, slug: string): Promise<PublicMenu | null> {
    const client = tx as Tx;
    const location = await client.location.findFirst({
      where: { slug },
    });
    if (!location) return null;

    const version = await client.menuVersion.findFirst({
      where: { tenantId: location.tenantId, status: "published" },
      orderBy: { version: "desc" },
    });
    if (!version) return null;

    const items = await client.menuItem.findMany({
      where: { tenantId: location.tenantId, menuVersionId: version.id },
      orderBy: { sortOrder: "asc" },
    });

    const products = await client.product.findMany({
      where: {
        tenantId: location.tenantId,
        id: { in: items.map((i) => i.productId) },
      },
      include: { category: true, allergens: true },
    });
    const productById = new Map(products.map((p) => [p.id, p]));

    const categories = new Map<string, PublicMenu["categories"][number]>();
    for (const item of items) {
      const product = productById.get(item.productId);
      const categoryName = product?.category?.name ?? "Menu";
      let bucket = categories.get(categoryName);
      if (!bucket) {
        bucket = { name: categoryName, items: [] };
        categories.set(categoryName, bucket);
      }
      bucket.items.push({
        productId: item.productId,
        name: item.nameSnapshot,
        description: null,
        categoryName,
        priceMinor: item.priceMinor,
        taxRateBps: item.taxRateBps,
        allergens: product?.allergens.map((a) => a.allergen) ?? [],
      });
    }

    return {
      locationId: location.id,
      locationName: location.name,
      currency: location.currency,
      timezone: location.timezone,
      menuVersion: version.version,
      categories: [...categories.values()],
    };
  }
}
