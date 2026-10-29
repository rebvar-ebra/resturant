import type { Uuid } from "@restaurantos/shared-kernel";
import type { MenuVersion } from "../domain/menu-version.js";

export interface ProductRecord {
  id: Uuid;
  categoryId: Uuid | null;
  categoryName: string | null;
  name: string;
  basePriceMinor: bigint;
  taxRateBps: number;
  isActive: boolean;
  allergens: string[];
}

export interface PublicMenuItem {
  productId: Uuid;
  name: string;
  description: string | null;
  categoryName: string;
  priceMinor: bigint;
  taxRateBps: number;
  allergens: string[];
}

export interface PublicMenu {
  locationId: Uuid;
  locationName: string;
  currency: string;
  timezone: string;
  menuVersion: number;
  categories: { name: string; items: PublicMenuItem[] }[];
}

export interface CatalogRepository {
  createProduct(
    tx: unknown,
    input: {
      tenantId: Uuid;
      name: string;
      categoryName: string;
      basePriceMinor: bigint;
      taxRateBps: number;
      allergens: string[];
    },
  ): Promise<{ productId: Uuid }>;

  listProducts(tx: unknown, tenantId: Uuid): Promise<ProductRecord[]>;

  nextMenuVersionNumber(tx: unknown, tenantId: Uuid): Promise<number>;

  /** Creates a new published version with item snapshots; archives the previous one. */
  publishSnapshot(
    tx: unknown,
    input: {
      tenantId: Uuid;
      menuVersionId: Uuid;
      version: number;
    },
  ): Promise<void>;

  publishedVersion(tx: unknown, tenantId: Uuid): Promise<MenuVersion | null>;

  publicMenuBySlug(tx: unknown, slug: string): Promise<PublicMenu | null>;
}
