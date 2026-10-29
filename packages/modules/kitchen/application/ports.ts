import type { Uuid } from "@restaurantos/shared-kernel";

export interface KdsTicketItem {
  id: Uuid;
  orderItemId: Uuid;
  name: string;
  quantity: string;
  modifiers: { name: string }[];
  status: string;
  startedAt: string | null;
  readyAt: string | null;
}

export interface KdsTicket {
  id: Uuid;
  orderId: Uuid;
  status: string;
  revision: number;
  createdAt: string;
  waitingSeconds: number;
  items: KdsTicketItem[];
}

export interface KitchenRepository {
  createForOrder(
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
  ): Promise<void>;

  snapshotByLocation(
    tx: unknown,
    tenantId: Uuid,
    locationId: Uuid,
  ): Promise<KdsTicket[]>;

  lockTicket(
    tx: unknown,
    tenantId: Uuid,
    ticketId: Uuid,
  ): Promise<{ id: Uuid; orderId: Uuid; locationId: Uuid; status: string } | null>;

  markStarted(tx: unknown, tenantId: Uuid, ticketId: Uuid): Promise<void>;
  markReady(tx: unknown, tenantId: Uuid, ticketId: Uuid): Promise<void>;
}
