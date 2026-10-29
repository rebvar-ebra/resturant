import { createHash, randomBytes } from "node:crypto";
import {
  ConcurrencyConflictError,
  InvariantViolationError,
  NotFoundError,
  newId,
  type AuthorizedTenantContext,
  type Uuid,
} from "@restaurantos/shared-kernel";
import type { OutboxWriter } from "@restaurantos/outbox";
import { Order, deriveFinancialStatus, type OrderStatus } from "../domain/order.js";
import { priceOrder, type PricedItemInput } from "../domain/pricing.js";
import { businessDateFor } from "../domain/business-date.js";
import type {
  IdempotencyStore,
  MenuReader,
  OrderLocationContext,
  OrderRepository,
  StoredOrder,
} from "./ports.js";

export interface OrderView {
  id: Uuid;
  orderStatus: OrderStatus;
  financialStatus: string;
  version: number;
  total: { amountMinor: string; currency: string };
  tax: { amountMinor: string; currency: string };
  businessDate: string;
  serviceType: string;
  paymentPolicy: string;
  createdAt: string;
  items: {
    productId: string;
    name: string;
    quantity: string;
    unitGrossMinor: string;
    lineGrossMinor: string;
    modifiers: { name: string; priceDeltaMinor: string }[];
  }[];
}

export function toOrderView(stored: StoredOrder): OrderView {
  return {
    id: stored.order.id,
    orderStatus: stored.order.status,
    // Payments land in the payment slice; nothing has been captured yet.
    financialStatus: deriveFinancialStatus(stored.grossMinor, 0n, 0n),
    version: stored.order.version,
    total: {
      amountMinor: stored.grossMinor.toString(),
      currency: stored.currency,
    },
    tax: {
      amountMinor: stored.taxMinor.toString(),
      currency: stored.currency,
    },
    businessDate: stored.businessDate,
    serviceType: stored.serviceType,
    paymentPolicy: stored.paymentPolicy,
    createdAt: stored.createdAt.toISOString(),
    items: stored.lines.map((l) => ({
      productId: l.productId,
      name: l.nameSnapshot,
      quantity: l.quantity,
      unitGrossMinor: l.unitGrossMinor.toString(),
      lineGrossMinor: l.lineGrossMinor.toString(),
      modifiers: l.modifiersSnapshot.map((m) => ({
        name: m.name,
        priceDeltaMinor: m.priceDeltaMinor,
      })),
    })),
  };
}

export interface PlaceOrderInput {
  serviceType: "dine_in" | "pickup";
  paymentPolicy: "prepaid" | "pay_later";
  items: { productId: Uuid; quantity: string; modifierOptionIds: Uuid[] }[];
  idempotencyKey: string;
}

/**
 * PlacePublicOrder (spec §8.2): server-side pricing from the published menu,
 * snapshot, history and outbox in ONE transaction. Idempotent via
 * Idempotency-Key + request hash (same key + different body → 409).
 */
export class PlacePublicOrder {
  constructor(
    private readonly orders: OrderRepository,
    private readonly menu: MenuReader,
    private readonly idempotency: IdempotencyStore,
    private readonly outbox: OutboxWriter,
  ) {}

  async execute(
    tx: unknown,
    location: OrderLocationContext,
    input: PlaceOrderInput,
  ): Promise<{ view: OrderView; guestToken: string; replayed: boolean }> {
    const route = "POST /v1/public/restaurants/:slug/orders";
    const actorScope = `guest:${location.locationId}`;
    const requestHash = createHash("sha256")
      .update(JSON.stringify({ items: input.items, serviceType: input.serviceType }))
      .digest("hex");

    const gate = await this.idempotency.checkAndBegin(tx, {
      tenantId: location.tenantId,
      actorScope,
      route,
      key: input.idempotencyKey,
      requestHash,
    });
    if (gate.kind === "replay") {
      return { ...(gate.response as { view: OrderView; guestToken: string }), replayed: true };
    }
    if (gate.kind === "conflict") {
      throw new ConcurrencyConflictError(0, 0);
    }

    const menu = await this.menu.publishedMenu(tx, location.tenantId);
    if (!menu) {
      throw new NotFoundError("published menu", location.locationId);
    }

    const optionIds = input.items.flatMap((i) => i.modifierOptionIds);
    const options = await this.menu.modifierOptions(tx, location.tenantId, optionIds);

    const priced: PricedItemInput[] = input.items.map((item) => {
      const menuItem = menu.items.get(item.productId);
      if (!menuItem) {
        throw new InvariantViolationError("Item is not on the published menu", {
          productId: item.productId,
        });
      }
      return {
        menuItemId: item.productId,
        productId: item.productId,
        name: menuItem.name,
        quantity: item.quantity,
        unitPriceMinor: menuItem.priceMinor,
        taxRateBps: menuItem.taxRateBps,
        modifiers: item.modifierOptionIds.map((optionId) => {
          const option = options.get(optionId);
          if (!option) {
            throw new InvariantViolationError("Unknown modifier option", { optionId });
          }
          return {
            optionId: option.id,
            name: option.name,
            priceDeltaMinor: option.priceDeltaMinor,
          };
        }),
      };
    });

    const totals = priceOrder(priced, location.currency);
    if (totals.lines.length === 0) {
      throw new InvariantViolationError("Order must contain at least one item");
    }

    const guestToken = randomBytes(24).toString("base64url");
    const order = new Order(
      location.tenantId,
      newId(),
      location.locationId,
      "placed",
      1,
    );
    const businessDate = businessDateFor(
      location.timezone,
      location.businessDayCutoff,
      new Date(),
    );

    await this.orders.insert(tx, {
      order,
      locationId: location.locationId,
      source: "qr",
      serviceType: input.serviceType,
      paymentPolicy: input.paymentPolicy,
      guestToken,
      currency: location.currency,
      grossMinor: totals.grossMinor,
      taxMinor: totals.taxMinor,
      businessDate,
      menuVersion: menu.version,
      lines: totals.lines,
    });

    await this.outbox.append(tx, {
      tenantId: location.tenantId,
      locationId: location.locationId,
      aggregateId: order.id,
      aggregateVersion: order.version,
      eventType: "order.placed.v1",
      payload: { orderId: order.id },
    });

    const stored = (await this.orders.lockById(tx, location.tenantId, order.id))!;
    const result = { view: toOrderView(stored), guestToken };

    await this.idempotency.complete(tx, {
      tenantId: location.tenantId,
      actorScope,
      route,
      key: input.idempotencyKey,
      response: result,
    });

    return { ...result, replayed: false };
  }
}

/**
 * AcceptOrder (spec §8.4): lock, permission checked by caller, idempotent,
 * transition + history + kitchen ticket + outbox in one transaction.
 */
export class AcceptOrder {
  constructor(
    private readonly orders: OrderRepository,
    private readonly tickets: KitchenTicketWriter,
    private readonly outbox: OutboxWriter,
  ) {}

  async execute(
    tx: unknown,
    ctx: AuthorizedTenantContext,
    orderId: Uuid,
  ): Promise<OrderView> {
    const stored = await this.orders.lockById(tx, ctx.tenantId, orderId);
    if (!stored) throw new NotFoundError("order", orderId);

    const { order } = stored;
    if (order.status === "accepted") return toOrderView(stored); // idempotent

    order.assertAcceptable();
    // Pay-later: staff accept is the policy gate. Prepaid requires a
    // successful payment — enforced in the payment slice.
    const from = order.status;
    order.transition("accepted");

    await this.orders.applyTransition(tx, {
      order,
      from,
      to: "accepted",
      actorId: ctx.userId,
      reason: null,
    });
    await this.tickets.createForOrder(tx, {
      tenantId: ctx.tenantId,
      locationId: order.locationId,
      orderId: order.id,
      lines: stored.lines,
    });
    await this.outbox.append(tx, {
      tenantId: ctx.tenantId,
      locationId: order.locationId,
      aggregateId: order.id,
      aggregateVersion: order.version,
      eventType: "order.accepted.v1",
      payload: { orderId: order.id },
    });

    const fresh = (await this.orders.lockById(tx, ctx.tenantId, orderId))!;
    return toOrderView(fresh);
  }
}

export class CancelOrder {
  constructor(
    private readonly orders: OrderRepository,
    private readonly outbox: OutboxWriter,
  ) {}

  async execute(
    tx: unknown,
    ctx: AuthorizedTenantContext,
    orderId: Uuid,
    reason: string,
  ): Promise<OrderView> {
    const stored = await this.orders.lockById(tx, ctx.tenantId, orderId);
    if (!stored) throw new NotFoundError("order", orderId);

    const { order } = stored;
    if (order.status === "cancelled") return toOrderView(stored);

    const from = order.status;
    order.transition("cancelled");
    await this.orders.applyTransition(tx, {
      order,
      from,
      to: "cancelled",
      actorId: ctx.userId,
      reason,
    });
    await this.outbox.append(tx, {
      tenantId: ctx.tenantId,
      locationId: order.locationId,
      aggregateId: order.id,
      aggregateVersion: order.version,
      eventType: "order.cancelled.v1",
      payload: { orderId: order.id, reason },
    });

    const fresh = (await this.orders.lockById(tx, ctx.tenantId, orderId))!;
    return toOrderView(fresh);
  }
}

export class ListOrders {
  constructor(private readonly orders: OrderRepository) {}

  async execute(
    tx: unknown,
    ctx: AuthorizedTenantContext,
    locationId: Uuid,
    statuses?: OrderStatus[],
  ): Promise<OrderView[]> {
    const stored = await this.orders.listByLocation(tx, ctx.tenantId, locationId, {
      statuses,
      limit: 50,
    });
    return stored.map(toOrderView);
  }
}

export class GetPublicOrder {
  constructor(private readonly orders: OrderRepository) {}

  async execute(
    tx: unknown,
    orderId: Uuid,
    guestToken: string,
  ): Promise<OrderView> {
    const stored = await this.orders.findPublicByToken(tx, orderId, guestToken);
    if (!stored) throw new NotFoundError("order", orderId); // no existence leak
    return toOrderView(stored);
  }
}

/** Write port of the kitchen context — ordering stays the caller (spec §8.2.10). */
export interface KitchenTicketWriter {
  createForOrder(
    tx: unknown,
    input: {
      tenantId: Uuid;
      locationId: Uuid;
      orderId: Uuid;
      lines: StoredOrder["lines"];
    },
  ): Promise<void>;
}
