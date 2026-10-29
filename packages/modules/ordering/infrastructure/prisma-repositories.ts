import type { Prisma, PrismaClient } from "@prisma/client";
import { newId, type Uuid } from "@restaurantos/shared-kernel";
import { Order, type OrderStatus } from "../domain/order.js";
import type { PricedLine } from "../domain/pricing.js";
import type {
  IdempotencyStore,
  MenuItemForPricing,
  MenuReader,
  ModifierOptionForPricing,
  OrderRepository,
  StoredOrder,
} from "../application/ports.js";

type Tx = Pick<
  PrismaClient,
  | "order"
  | "orderItem"
  | "orderStatusHistory"
  | "menuVersion"
  | "menuItem"
  | "modifierOption"
  | "idempotencyKey"
  | "$queryRaw"
>;

export class PrismaMenuReader implements MenuReader {
  async publishedMenu(
    tx: unknown,
    tenantId: Uuid,
  ): Promise<{ version: number; items: Map<Uuid, MenuItemForPricing> } | null> {
    const client = tx as Tx;
    const version = await client.menuVersion.findFirst({
      where: { tenantId, status: "published" },
      orderBy: { version: "desc" },
    });
    if (!version) return null;
    const items = await client.menuItem.findMany({
      where: { tenantId, menuVersionId: version.id },
    });
    return {
      version: version.version,
      items: new Map(
        items.map((i) => [
          i.productId,
          {
            productId: i.productId,
            name: i.nameSnapshot,
            priceMinor: i.priceMinor,
            taxRateBps: i.taxRateBps,
          },
        ]),
      ),
    };
  }

  async modifierOptions(
    tx: unknown,
    tenantId: Uuid,
    optionIds: Uuid[],
  ): Promise<Map<Uuid, ModifierOptionForPricing>> {
    if (optionIds.length === 0) return new Map();
    const client = tx as Tx;
    const rows = await client.modifierOption.findMany({
      where: { tenantId, id: { in: optionIds } },
    });
    return new Map(
      rows.map((r) => [
        r.id,
        { id: r.id, name: r.name, priceDeltaMinor: r.priceDeltaMinor },
      ]),
    );
  }
}

export class PrismaOrderRepository implements OrderRepository {
  async insert(
    tx: unknown,
    input: {
      order: Order;
      locationId: Uuid;
      source: string;
      serviceType: string;
      paymentPolicy: string;
      guestToken: string;
      currency: string;
      grossMinor: bigint;
      taxMinor: bigint;
      businessDate: string;
      menuVersion: number;
      lines: PricedLine[];
    },
  ): Promise<void> {
    const client = tx as Tx;
    const { order } = input;
    await client.order.create({
      data: {
        tenantId: order.tenantId,
        id: order.id,
        locationId: input.locationId,
        status: order.status,
        source: input.source as "qr",
        serviceType: input.serviceType,
        paymentPolicy: input.paymentPolicy,
        guestToken: input.guestToken,
        currency: input.currency,
        grossMinor: input.grossMinor,
        taxMinor: input.taxMinor,
        version: order.version,
        businessDate: new Date(`${input.businessDate}T00:00:00Z`),
        menuVersion: input.menuVersion,
      },
    });
    await client.orderItem.createMany({
      data: input.lines.map((line) => ({
        tenantId: order.tenantId,
        id: newId(),
        orderId: order.id,
        productId: line.productId,
        nameSnapshot: line.nameSnapshot,
        quantity: line.quantity,
        unitGrossMinor: line.unitGrossMinor,
        lineGrossMinor: line.lineGrossMinor,
        taxRateBps: line.taxRateBps,
        lineTaxMinor: line.lineTaxMinor,
        modifiersSnapshot: line.modifiersSnapshot as unknown as Prisma.JsonArray,
      })),
    });
    await client.orderStatusHistory.create({
      data: {
        tenantId: order.tenantId,
        id: newId(),
        orderId: order.id,
        fromStatus: null,
        toStatus: order.status,
        actorId: null,
        reason: "placed",
      },
    });
  }

  async lockById(
    tx: unknown,
    tenantId: Uuid,
    orderId: Uuid,
  ): Promise<StoredOrder | null> {
    const client = tx as Tx;
    // Row lock first (spec §8.3), then read the rest within the same tx.
    await client.$queryRaw`
      SELECT id FROM orders WHERE tenant_id = ${tenantId}::uuid AND id = ${orderId}::uuid
      FOR UPDATE
    `;
    const row = await client.order.findUnique({
      where: { tenantId_id: { tenantId, id: orderId } },
      include: { items: true },
    });
    if (!row) return null;
    return mapStored(row);
  }

  async findPublicByToken(
    tx: unknown,
    orderId: Uuid,
    guestToken: string,
  ): Promise<StoredOrder | null> {
    const client = tx as Tx;
    const row = await client.order.findFirst({
      where: { id: orderId, guestToken },
      include: { items: true },
    });
    if (!row) return null;
    return mapStored(row);
  }

  async listByLocation(
    tx: unknown,
    tenantId: Uuid,
    locationId: Uuid,
    filter: { statuses?: OrderStatus[] | undefined; limit: number },
  ): Promise<StoredOrder[]> {
    const client = tx as Tx;
    const rows = await client.order.findMany({
      where: {
        tenantId,
        locationId,
        ...(filter.statuses && filter.statuses.length > 0
          ? { status: { in: filter.statuses } }
          : {}),
      },
      include: { items: true },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: filter.limit,
    });
    return rows.map(mapStored);
  }

  async applyTransition(
    tx: unknown,
    input: {
      order: Order;
      from: OrderStatus;
      to: OrderStatus;
      actorId: Uuid | null;
      reason: string | null;
    },
  ): Promise<void> {
    const client = tx as Tx;
    // Optimistic version check complements the row lock (spec §8.3).
    const updated = await client.order.updateMany({
      where: {
        tenantId: input.order.tenantId,
        id: input.order.id,
        version: input.order.version - 1,
      },
      data: { status: input.to, version: input.order.version },
    });
    if (updated.count !== 1) {
      throw new Error(`ORDER_VERSION_CONFLICT:${input.order.id}`);
    }
    await client.orderStatusHistory.create({
      data: {
        tenantId: input.order.tenantId,
        id: newId(),
        orderId: input.order.id,
        fromStatus: input.from,
        toStatus: input.to,
        actorId: input.actorId,
        reason: input.reason,
      },
    });
  }
}

function mapStored(row: {
  tenantId: string;
  id: string;
  locationId: string;
  status: string;
  source: string;
  serviceType: string;
  paymentPolicy: string;
  currency: string;
  grossMinor: bigint;
  taxMinor: bigint;
  version: number;
  businessDate: Date;
  menuVersion: number | null;
  createdAt: Date;
  items: {
    productId: string | null;
    nameSnapshot: string;
    quantity: { toString(): string };
    unitGrossMinor: bigint;
    lineGrossMinor: bigint;
    taxRateBps: number;
    lineTaxMinor: bigint;
    modifiersSnapshot: unknown;
  }[];
}): StoredOrder {
  return {
    order: new Order(
      row.tenantId,
      row.id,
      row.locationId,
      row.status as OrderStatus,
      row.version,
    ),
    source: row.source,
    serviceType: row.serviceType,
    paymentPolicy: row.paymentPolicy,
    currency: row.currency,
    grossMinor: row.grossMinor,
    taxMinor: row.taxMinor,
    businessDate: row.businessDate.toISOString().slice(0, 10),
    menuVersion: row.menuVersion,
    createdAt: row.createdAt,
    lines: row.items.map((i) => ({
      productId: i.productId ?? "",
      nameSnapshot: i.nameSnapshot,
      quantity: i.quantity.toString(),
      unitGrossMinor: i.unitGrossMinor,
      lineGrossMinor: i.lineGrossMinor,
      taxRateBps: i.taxRateBps,
      lineTaxMinor: i.lineTaxMinor,
      modifiersSnapshot: Array.isArray(i.modifiersSnapshot)
        ? (i.modifiersSnapshot as PricedLine["modifiersSnapshot"])
        : [],
    })),
  };
}

export class PrismaIdempotencyStore implements IdempotencyStore {
  async checkAndBegin(
    tx: unknown,
    input: {
      tenantId: Uuid;
      actorScope: string;
      route: string;
      key: string;
      requestHash: string;
    },
  ): Promise<
    { kind: "fresh" } | { kind: "replay"; response: unknown } | { kind: "conflict" }
  > {
    const client = tx as Tx;
    try {
      await client.idempotencyKey.create({
        data: {
          tenantId: input.tenantId,
          actorScope: input.actorScope,
          route: input.route,
          key: input.key,
          requestHash: input.requestHash,
        },
      });
      return { kind: "fresh" };
    } catch {
      const existing = await client.idempotencyKey.findUnique({
        where: {
          tenantId_actorScope_route_key: {
            tenantId: input.tenantId,
            actorScope: input.actorScope,
            route: input.route,
            key: input.key,
          },
        },
      });
      if (!existing) throw new Error("idempotency check failed");
      if (existing.requestHash !== input.requestHash) {
        return { kind: "conflict" }; // same key, different body → 409 (spec §8.2.5)
      }
      if (existing.responseBody) {
        return { kind: "replay", response: existing.responseBody };
      }
      // Concurrent in-flight request with the same key.
      return { kind: "conflict" };
    }
  }

  async complete(
    tx: unknown,
    input: {
      tenantId: Uuid;
      actorScope: string;
      route: string;
      key: string;
      response: unknown;
    },
  ): Promise<void> {
    const client = tx as Tx;
    await client.idempotencyKey.update({
      where: {
        tenantId_actorScope_route_key: {
          tenantId: input.tenantId,
          actorScope: input.actorScope,
          route: input.route,
          key: input.key,
        },
      },
      data: { responseBody: input.response as Prisma.JsonObject },
    });
  }
}
