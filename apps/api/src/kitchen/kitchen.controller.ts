import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { requirePermission } from "@restaurantos/identity";
import {
  GetKdsSnapshot,
  PrismaKitchenRepository,
  TransitionTicket,
} from "@restaurantos/kitchen";
import {
  OrderStateService,
  PrismaOrderRepository,
} from "@restaurantos/ordering";
import { PrismaOutboxWriter } from "@restaurantos/outbox";
import type { AuthorizedTenantContext } from "@restaurantos/shared-kernel";
import { z } from "zod";
import { CurrentTenantContext } from "../identity/decorators.js";
import { SessionGuard } from "../identity/session.guard.js";
import { TenantContextGuard } from "../identity/tenant-context.guard.js";
import { PrismaService } from "../prisma/prisma.service.js";

const transitionSchema = z.object({
  action: z.enum(["start", "ready"]),
});

@Controller("tenants/:tenantId")
@UseGuards(SessionGuard, TenantContextGuard)
export class KitchenController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  /** KDS snapshot (spec §16.2); SSE streaming lands in the kitchen slice hardening. */
  @Get("locations/:locationId/kitchen/tickets")
  async getTickets(
    @CurrentTenantContext() ctx: AuthorizedTenantContext,
    @Param("locationId") locationId: string,
  ) {
    requirePermission(ctx, "kitchen.ticket.transition");
    const tickets = await this.prisma.withTenantTransaction(ctx, (tx) =>
      new GetKdsSnapshot(new PrismaKitchenRepository()).execute(tx, ctx, locationId),
    );
    return { tickets, serverTime: new Date().toISOString() };
  }

  @Post("kitchen/tickets/:ticketId/transitions")
  async transition(
    @CurrentTenantContext() ctx: AuthorizedTenantContext,
    @Param("ticketId") ticketId: string,
    @Body() body: unknown,
  ) {
    requirePermission(ctx, "kitchen.ticket.transition");
    const { action } = transitionSchema.parse(body);
    await this.prisma.withTenantTransaction(ctx, (tx) =>
      new TransitionTicket(
        new PrismaKitchenRepository(),
        new OrderStateService(new PrismaOrderRepository()),
        new PrismaOutboxWriter(["audit-log"]),
      ).execute(tx, ctx, ticketId, action),
    );
    return { ok: true };
  }
}

/** Kitchen staff role check helper — waiter/cashier can also view in MVP via permission map. */
