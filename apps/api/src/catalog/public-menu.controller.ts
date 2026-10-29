import { Controller, Get, Inject, Param } from "@nestjs/common";
import { GetPublicMenu, PrismaCatalogRepository } from "@restaurantos/catalog";
import { PrismaService } from "../prisma/prisma.service.js";
import { resolvePublicSlug } from "./public-slug.js";

/**
 * Public QR menu (spec §16.2): no session. The slug is resolved via the
 * public_slugs routing table; the menu itself is read inside the resolved
 * tenant's RLS context. Rate limiting per spec §14.2 lands with the edge.
 */
@Controller("public/restaurants")
export class PublicMenuController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get(":slug/menu")
  async getMenu(@Param("slug") slug: string) {
    const route = await resolvePublicSlug(this.prisma, slug);
    const menu = await this.prisma.withTenantTransaction(
      { tenantId: route.tenantId },
      (tx) => new GetPublicMenu(new PrismaCatalogRepository()).execute(tx, slug),
    );
    return {
      ...menu,
      categories: menu.categories.map((c) => ({
        ...c,
        items: c.items.map((i) => ({ ...i, priceMinor: i.priceMinor.toString() })),
      })),
    };
  }

}
