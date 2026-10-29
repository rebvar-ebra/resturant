import {
  InvariantViolationError,
  NotFoundError,
  type AuthorizedTenantContext,
  type Uuid,
} from "@restaurantos/shared-kernel";
import type { OutboxWriter } from "@restaurantos/outbox";
import type { KitchenRepository, KdsTicket } from "./ports.js";

export class GetKdsSnapshot {
  constructor(private readonly kitchen: KitchenRepository) {}

  execute(
    tx: unknown,
    ctx: AuthorizedTenantContext,
    locationId: Uuid,
  ): Promise<KdsTicket[]> {
    return this.kitchen.snapshotByLocation(tx, ctx.tenantId, locationId);
  }
}

/**
 * KDS transitions (spec §3.1 kitchen journey):
 *  start → ticket in_progress, items preparing, order moves to "preparing"
 *  ready → items ready, ticket done, order moves to "ready"
 * The order state machine itself stays owned by the ordering module — this
 * use case calls its public port.
 */
export interface OrderStatePort {
  lockAndTransition(
    tx: unknown,
    tenantId: Uuid,
    orderId: Uuid,
    to: "preparing" | "ready",
    actorId: Uuid | null,
  ): Promise<{ aggregateVersion: number }>;
}

export class TransitionTicket {
  constructor(
    private readonly kitchen: KitchenRepository,
    private readonly orders: OrderStatePort,
    private readonly outbox: OutboxWriter,
  ) {}

  async execute(
    tx: unknown,
    ctx: AuthorizedTenantContext,
    ticketId: Uuid,
    action: "start" | "ready",
  ): Promise<void> {
    const ticket = await this.kitchen.lockTicket(tx, ctx.tenantId, ticketId);
    if (!ticket) throw new NotFoundError("kitchen ticket", ticketId);

    if (action === "start") {
      if (ticket.status !== "open") {
        if (ticket.status === "in_progress") return; // idempotent
        throw new InvariantViolationError(
          `Cannot start ticket in status ${ticket.status}`,
        );
      }
      await this.kitchen.markStarted(tx, ctx.tenantId, ticketId);
      const { aggregateVersion } = await this.orders.lockAndTransition(
        tx,
        ctx.tenantId,
        ticket.orderId,
        "preparing",
        ctx.userId,
      );
      await this.outbox.append(tx, {
        tenantId: ctx.tenantId,
        locationId: ticket.locationId,
        aggregateId: ticket.orderId,
        aggregateVersion,
        eventType: "order.item_preparation_started.v1",
        payload: { orderId: ticket.orderId, ticketId },
      });
      return;
    }

    // ready
    if (ticket.status !== "in_progress") {
      if (ticket.status === "done") return; // idempotent
      throw new InvariantViolationError(
        `Cannot finish ticket in status ${ticket.status}`,
      );
    }
    await this.kitchen.markReady(tx, ctx.tenantId, ticketId);
    const { aggregateVersion } = await this.orders.lockAndTransition(
      tx,
      ctx.tenantId,
      ticket.orderId,
      "ready",
      ctx.userId,
    );
    await this.outbox.append(tx, {
      tenantId: ctx.tenantId,
      locationId: ticket.locationId,
      aggregateId: ticket.orderId,
      aggregateVersion,
      eventType: "order.ready.v1",
      payload: { orderId: ticket.orderId, ticketId },
    });
  }
}
