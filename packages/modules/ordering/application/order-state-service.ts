import { NotFoundError, type Uuid } from "@restaurantos/shared-kernel";
import type { OrderRepository } from "./ports.js";

/**
 * Narrow public port for the kitchen context: the kitchen drives the order
 * to "preparing"/"ready" but never owns the order state machine (spec §4.2.1).
 * Emitted events are published by the caller with the returned version.
 */
export class OrderStateService {
  constructor(private readonly orders: OrderRepository) {}

  async lockAndTransition(
    tx: unknown,
    tenantId: Uuid,
    orderId: Uuid,
    to: "preparing" | "ready",
    actorId: Uuid | null,
  ): Promise<{ aggregateVersion: number }> {
    const stored = await this.orders.lockById(tx, tenantId, orderId);
    if (!stored) throw new NotFoundError("order", orderId);

    const { order } = stored;
    if (order.status === to) return { aggregateVersion: order.version }; // idempotent

    const from = order.status;
    order.transition(to);
    await this.orders.applyTransition(tx, {
      order,
      from,
      to,
      actorId,
      reason: null,
    });
    return { aggregateVersion: order.version };
  }
}
