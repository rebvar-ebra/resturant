import {
  InvariantViolationError,
  NotFoundError,
  newId,
  type AuthorizedTenantContext,
  type Uuid,
} from "@restaurantos/shared-kernel";
import type { OutboxWriter } from "@restaurantos/outbox";
import type { CatalogRepository, ProductRecord, PublicMenu } from "./ports.js";

export class CreateProduct {
  constructor(private readonly catalog: CatalogRepository) {}

  async execute(
    tx: unknown,
    ctx: AuthorizedTenantContext,
    input: {
      name: string;
      categoryName: string;
      basePriceMinor: bigint;
      taxRateBps: number;
      allergens: string[];
    },
  ): Promise<{ productId: Uuid }> {
    if (input.basePriceMinor < 0n) {
      throw new InvariantViolationError("Price must not be negative");
    }
    if (input.taxRateBps < 0 || input.taxRateBps > 10000) {
      throw new InvariantViolationError("taxRateBps out of range");
    }
    return this.catalog.createProduct(tx, { tenantId: ctx.tenantId, ...input });
  }
}

export class GetManagementMenu {
  constructor(private readonly catalog: CatalogRepository) {}

  execute(tx: unknown, ctx: AuthorizedTenantContext): Promise<ProductRecord[]> {
    return this.catalog.listProducts(tx, ctx.tenantId);
  }
}

/**
 * PublishMenu (spec §3.1 manager journey): a new version is snapshotted from
 * the current active products and published atomically; the previous version
 * is archived. `menu.published.v1` is appended to the outbox in the same
 * transaction. Old versions stay readable — existing orders keep their
 * snapshots.
 */
export class PublishMenu {
  constructor(
    private readonly catalog: CatalogRepository,
    private readonly outbox: OutboxWriter,
  ) {}

  async execute(
    tx: unknown,
    ctx: AuthorizedTenantContext,
  ): Promise<{ menuVersionId: Uuid; version: number }> {
    const version = await this.catalog.nextMenuVersionNumber(tx, ctx.tenantId);
    const menuVersionId = newId();
    await this.catalog.publishSnapshot(tx, {
      tenantId: ctx.tenantId,
      menuVersionId,
      version,
    });
    await this.outbox.append(tx, {
      tenantId: ctx.tenantId,
      aggregateId: menuVersionId,
      aggregateVersion: version,
      eventType: "menu.published.v1",
      payload: { menuVersionId, version },
    });
    return { menuVersionId, version };
  }
}

export class GetPublicMenu {
  constructor(private readonly catalog: CatalogRepository) {}

  async execute(tx: unknown, slug: string): Promise<PublicMenu> {
    const menu = await this.catalog.publicMenuBySlug(tx, slug);
    if (!menu) throw new NotFoundError("restaurant", slug);
    return menu;
  }
}
