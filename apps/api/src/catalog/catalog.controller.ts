import { Body, Controller, Get, Inject, Param, Post, UseGuards } from "@nestjs/common";
import {
  CreateProduct,
  GetManagementMenu,
  GetPublicMenu,
  PrismaCatalogRepository,
  PublishMenu,
} from "@restaurantos/catalog";
import { requirePermission } from "@restaurantos/identity";
import { PrismaOutboxWriter } from "@restaurantos/outbox";
import type { AuthorizedTenantContext } from "@restaurantos/shared-kernel";
import { z } from "zod";
import { PrismaService } from "../prisma/prisma.service.js";
import { CurrentTenantContext } from "../identity/decorators.js";
import { SessionGuard } from "../identity/session.guard.js";
import { TenantContextGuard } from "../identity/tenant-context.guard.js";

const createProductSchema = z.object({
  name: z.string().min(1).max(120),
  categoryName: z.string().min(1).max(80),
  basePriceMinor: z.coerce.bigint().nonnegative(),
  taxRateBps: z.number().int().min(0).max(10000),
  allergens: z.array(z.string().min(1).max(40)).max(30).default([]),
});

@Controller("tenants/:tenantId")
@UseGuards(SessionGuard, TenantContextGuard)
export class CatalogController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  /** Management view: current (draft) catalog products. */
  @Get("menu")
  async getMenu(@CurrentTenantContext() ctx: AuthorizedTenantContext) {
    const products = await this.prisma.withTenantTransaction(ctx, (tx) =>
      new GetManagementMenu(new PrismaCatalogRepository()).execute(tx, ctx),
    );
    return {
      products: products.map((p) => ({
        ...p,
        basePriceMinor: p.basePriceMinor.toString(),
      })),
    };
  }

  @Post("products")
  async createProduct(
    @CurrentTenantContext() ctx: AuthorizedTenantContext,
    @Body() body: unknown,
  ) {
    requirePermission(ctx, "menu.publish");
    const input = createProductSchema.parse(body);
    return this.prisma.withTenantTransaction(ctx, (tx) =>
      new CreateProduct(new PrismaCatalogRepository()).execute(tx, ctx, input),
    );
  }

  /**
   * Publish the current catalog as a new menu version (spec §16.2).
   * Draft→snapshot→publish is atomic; orders keep their own snapshots.
   */
  @Post("menu-versions/publish")
  async publishMenu(@CurrentTenantContext() ctx: AuthorizedTenantContext) {
    requirePermission(ctx, "menu.publish");
    return this.prisma.withTenantTransaction(ctx, (tx) =>
      new PublishMenu(
        new PrismaCatalogRepository(),
        new PrismaOutboxWriter(["audit-log"]),
      ).execute(tx, ctx),
    );
  }
}
