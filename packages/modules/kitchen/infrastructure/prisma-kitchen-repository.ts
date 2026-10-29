import type { PrismaClient } from "@prisma/client";
import { newId, type Uuid } from "@restaurantos/shared-kernel";
import type { KitchenRepository, KdsTicket } from "../application/ports.js";

type Tx = Pick<
  PrismaClient,
  "kitchenTicket" | "kitchenTicketItem" | "$queryRaw"
>;

export class PrismaKitchenRepository implements KitchenRepository {
  /** Unique per order (tenant_id, order_id) — re-accept never duplicates. */
  async createForOrder(
    tx: unknown,
    input: {
      tenantId: Uuid;
      locationId: Uuid;
      orderId: Uuid;
      lines: {
        productId: string;
        nameSnapshot: string;
        quantity: string;
        modifiersSnapshot: { name: string }[];
      }[];
    },
  ): Promise<void> {
    const client = tx as Tx;
    const existing = await client.kitchenTicket.findUnique({
      where: { tenantId_orderId: { tenantId: input.tenantId, orderId: input.orderId } },
    });
    if (existing) return;

    const ticketId = newId();
    await client.kitchenTicket.create({
      data: {
        tenantId: input.tenantId,
        id: ticketId,
        locationId: input.locationId,
        orderId: input.orderId,
        status: "open",
      },
    });

    const orderItems = await client.$queryRaw<{ id: string; name_snapshot: string; quantity: string; modifiers_snapshot: unknown }[]>`
      SELECT id, name_snapshot, quantity::text, modifiers_snapshot
      FROM order_items
      WHERE tenant_id = ${input.tenantId}::uuid AND order_id = ${input.orderId}::uuid
      ORDER BY name_snapshot
    `;
    await client.kitchenTicketItem.createMany({
      data: orderItems.map((item) => ({
        tenantId: input.tenantId,
        id: newId(),
        ticketId,
        orderItemId: item.id,
        status: "queued",
      })),
    });
  }

  async snapshotByLocation(
    tx: unknown,
    tenantId: Uuid,
    locationId: Uuid,
  ): Promise<KdsTicket[]> {
    const client = tx as Tx;
    const tickets = await client.kitchenTicket.findMany({
      where: {
        tenantId,
        locationId,
        status: { in: ["open", "in_progress"] },
      },
      include: {
        items: true,
        order: { include: { items: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    const now = Date.now();
    return tickets.map((t) => ({
      id: t.id,
      orderId: t.orderId,
      status: t.status,
      revision: t.revision,
      createdAt: t.createdAt.toISOString(),
      waitingSeconds: Math.max(0, Math.floor((now - t.createdAt.getTime()) / 1000)),
      items: t.items.map((item) => {
        const orderItem = t.order.items.find((oi) => oi.id === item.orderItemId);
        return {
          id: item.id,
          orderItemId: item.orderItemId,
          name: orderItem?.nameSnapshot ?? "item",
          quantity: orderItem?.quantity.toString() ?? "1",
          modifiers: Array.isArray(orderItem?.modifiersSnapshot)
            ? (orderItem?.modifiersSnapshot as { name: string }[]).map((m) => ({
                name: m.name,
              }))
            : [],
          status: item.status,
          startedAt: item.startedAt?.toISOString() ?? null,
          readyAt: item.readyAt?.toISOString() ?? null,
        };
      }),
    }));
  }

  async lockTicket(
    tx: unknown,
    tenantId: Uuid,
    ticketId: Uuid,
  ): Promise<{ id: Uuid; orderId: Uuid; locationId: Uuid; status: string } | null> {
    const client = tx as Tx;
    const rows = await client.$queryRaw<
      { id: string; order_id: string; location_id: string; status: string }[]
    >`
      SELECT id, order_id, location_id, status FROM kitchen_tickets
      WHERE tenant_id = ${tenantId}::uuid AND id = ${ticketId}::uuid
      FOR UPDATE
    `;
    const row = rows[0];
    if (!row) return null;
    return {
      id: row.id,
      orderId: row.order_id,
      locationId: row.location_id,
      status: row.status,
    };
  }

  async markStarted(tx: unknown, tenantId: Uuid, ticketId: Uuid): Promise<void> {
    const client = tx as Tx;
    await client.kitchenTicket.update({
      where: { tenantId_id: { tenantId, id: ticketId } },
      data: { status: "in_progress" },
    });
    await client.kitchenTicketItem.updateMany({
      where: { tenantId, ticketId, status: "queued" },
      data: { status: "preparing", startedAt: new Date() },
    });
  }

  async markReady(tx: unknown, tenantId: Uuid, ticketId: Uuid): Promise<void> {
    const client = tx as Tx;
    await client.kitchenTicket.update({
      where: { tenantId_id: { tenantId, id: ticketId } },
      data: { status: "done" },
    });
    await client.kitchenTicketItem.updateMany({
      where: { tenantId, ticketId, status: { in: ["queued", "preparing"] } },
      data: { status: "ready", readyAt: new Date() },
    });
  }
}
