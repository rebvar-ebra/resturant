import type { Uuid } from "@restaurantos/shared-kernel";
import type { Order, OrderStatus } from "../domain/order.js";
import type { PricedLine } from "../domain/pricing.js";

export interface MenuItemForPricing {
  productId: Uuid;
  name: string;
  priceMinor: bigint;
  taxRateBps: number;
}

export interface ModifierOptionForPricing {
  id: Uuid;
  name: string;
  priceDeltaMinor: bigint;
}

/** Read port towards the catalog context (spec §4.2: no cross-module repo imports). */
export interface MenuReader {
  publishedMenu(
    tx: unknown,
    tenantId: Uuid,
  ): Promise<{ version: number; items: Map<Uuid, MenuItemForPricing> } | null>;

  modifierOptions(
    tx: unknown,
    tenantId: Uuid,
    optionIds: Uuid[],
  ): Promise<Map<Uuid, ModifierOptionForPricing>>;
}

export interface OrderLocationContext {
  tenantId: Uuid;
  locationId: Uuid;
  currency: string;
  timezone: string;
  businessDayCutoff: string;
}

export interface StoredOrder {
  order: Order;
  source: string;
  serviceType: string;
  paymentPolicy: string;
  currency: string;
  grossMinor: bigint;
  taxMinor: bigint;
  businessDate: string;
  menuVersion: number | null;
  createdAt: Date;
  lines: PricedLine[];
}

export interface OrderRepository {
  insert(
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
  ): Promise<void>;

  /** SELECT ... FOR UPDATE — pessimistic lock for state transitions (spec §8.3). */
  lockById(tx: unknown, tenantId: Uuid, orderId: Uuid): Promise<StoredOrder | null>;

  findPublicByToken(
    tx: unknown,
    orderId: Uuid,
    guestToken: string,
  ): Promise<StoredOrder | null>;

  listByLocation(
    tx: unknown,
    tenantId: Uuid,
    locationId: Uuid,
    filter: { statuses?: OrderStatus[] | undefined; limit: number },
  ): Promise<StoredOrder[]>;

  applyTransition(
    tx: unknown,
    input: {
      order: Order;
      from: OrderStatus;
      to: OrderStatus;
      actorId: Uuid | null;
      reason: string | null;
    },
  ): Promise<void>;
}

export interface IdempotencyStore {
  /**
   * Returns "replay" with the stored response when the same key+hash was seen,
   * "conflict" when the key was reused with a different payload, "fresh" otherwise.
   */
  checkAndBegin(
    tx: unknown,
    input: {
      tenantId: Uuid;
      actorScope: string;
      route: string;
      key: string;
      requestHash: string;
    },
  ): Promise<{ kind: "fresh" } | { kind: "replay"; response: unknown } | { kind: "conflict" }>;

  complete(
    tx: unknown,
    input: {
      tenantId: Uuid;
      actorScope: string;
      route: string;
      key: string;
      response: unknown;
    },
  ): Promise<void>;
}
