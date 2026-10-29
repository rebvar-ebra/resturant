import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { requirePermission } from "@restaurantos/identity";
import { PrismaKitchenRepository } from "@restaurantos/kitchen";
import {
  AcceptOrder,
  CancelOrder,
  GetPublicOrder,
  ListOrders,
  ORDER_STATUSES,
  PlacePublicOrder,
  PrismaIdempotencyStore,
  PrismaMenuReader,
  PrismaOrderRepository,
  type OrderStatus,
} from "@restaurantos/ordering";
import { PrismaOutboxWriter } from "@restaurantos/outbox";
import type { AuthorizedTenantContext } from "@restaurantos/shared-kernel";
import { z } from "zod";
import { resolvePublicSlug } from "../catalog/public-slug.js";
import { CurrentTenantContext } from "../identity/decorators.js";
import { SessionGuard } from "../identity/session.guard.js";
import { TenantContextGuard } from "../identity/tenant-context.guard.js";
import { PrismaService } from "../prisma/prisma.service.js";

const placeOrderSchema = z.object({
  serviceType: z.enum(["dine_in", "pickup"]),
  paymentPolicy: z.enum(["prepaid", "pay_later"]).default("pay_later"),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.string().regex(/^\d+(\.\d{1,3})?$/),
        modifierOptionIds: z.array(z.string().uuid()).max(20).default([]),
      }),
    )
    .min(1)
    .max(50),
});

const cancelSchema = z.object({
  reason: z.string().min(2).max(500),
});

@Controller()
export class OrderingController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------- public

  /** Guest QR order (spec §16.2): Idempotency-Key required, server-side pricing. */
  @Post("public/restaurants/:slug/orders")
  async placePublicOrder(
    @Param("slug") slug: string,
    @Headers("idempotency-key") idempotencyKey: string | undefined,
    @Body() body: unknown,
  ) {
    if (!idempotencyKey) {
      throw new BadRequestException({
        error: {
          code: "VALIDATION_ERROR",
          message: "Idempotency-Key header is required",
        },
      });
    }
    const input = placeOrderSchema.parse(body);
    const route = await resolvePublicSlug(this.prisma, slug);
    const location = await this.prisma.withTenantTransaction(
      { tenantId: route.tenantId },
      async (tx) => {
        const loc = await tx.location.findUniqueOrThrow({
          where: {
            tenantId_id: { tenantId: route.tenantId, id: route.locationId },
          },
        });
        return {
          tenantId: route.tenantId,
          locationId: route.locationId,
          currency: loc.currency,
          timezone: loc.timezone,
          businessDayCutoff: loc.businessDayCutoff,
        };
      },
    );

    const result = await this.prisma.withTenantTransaction(
      { tenantId: route.tenantId },
      (tx) =>
        new PlacePublicOrder(
          new PrismaOrderRepository(),
          new PrismaMenuReader(),
          new PrismaIdempotencyStore(),
          new PrismaOutboxWriter(["audit-log"]),
        ).execute(tx, location, { ...input, idempotencyKey }),
    );

    return {
      ...result.view,
      guestToken: result.guestToken,
      statusUrl: `/v1/public/restaurants/${slug}/orders/${result.view.id}?token=${result.guestToken}`,
    };
  }

  /**
   * Public order status — only with the order's own unguessable token
   * (spec §16.2). Slug-scoped so the read runs in the tenant's RLS context.
   */
  @Get("public/restaurants/:slug/orders/:orderId")
  async getPublicOrder(
    @Param("slug") slug: string,
    @Param("orderId") orderId: string,
    @Query("token") token: string | undefined,
  ) {
    const route = await resolvePublicSlug(this.prisma, slug);
    return this.prisma.withTenantTransaction({ tenantId: route.tenantId }, (tx) =>
      new GetPublicOrder(new PrismaOrderRepository()).execute(
        tx,
        orderId,
        token ?? "",
      ),
    );
  }

  // ----------------------------------------------------------------- staff

  @Get("tenants/:tenantId/locations/:locationId/orders")
  @UseGuards(SessionGuard, TenantContextGuard)
  async listOrders(
    @CurrentTenantContext() ctx: AuthorizedTenantContext,
    @Param("locationId") locationId: string,
    @Query("status") status?: string,
  ) {
    const statuses = status
      ?.split(",")
      .filter((s): s is OrderStatus =>
        (ORDER_STATUSES as readonly string[]).includes(s),
      );
    const orders = await this.prisma.withTenantTransaction(ctx, (tx) =>
      new ListOrders(new PrismaOrderRepository()).execute(
        tx,
        ctx,
        locationId,
        statuses,
      ),
    );
    return { orders };
  }

  @Post("tenants/:tenantId/orders/:orderId/accept")
  @UseGuards(SessionGuard, TenantContextGuard)
  async acceptOrder(
    @CurrentTenantContext() ctx: AuthorizedTenantContext,
    @Param("orderId") orderId: string,
  ) {
    requirePermission(ctx, "order.accept");
    return this.prisma.withTenantTransaction(ctx, (tx) =>
      new AcceptOrder(
        new PrismaOrderRepository(),
        new PrismaKitchenRepository(),
        new PrismaOutboxWriter(["audit-log"]),
      ).execute(tx, ctx, orderId),
    );
  }

  @Post("tenants/:tenantId/orders/:orderId/cancel")
  @UseGuards(SessionGuard, TenantContextGuard)
  async cancelOrder(
    @CurrentTenantContext() ctx: AuthorizedTenantContext,
    @Param("orderId") orderId: string,
    @Body() body: unknown,
  ) {
    requirePermission(ctx, "order.cancel");
    const { reason } = cancelSchema.parse(body);
    return this.prisma.withTenantTransaction(ctx, (tx) =>
      new CancelOrder(
        new PrismaOrderRepository(),
        new PrismaOutboxWriter(["audit-log"]),
      ).execute(tx, ctx, orderId, reason),
    );
  }
}
