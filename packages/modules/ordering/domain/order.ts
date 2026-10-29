import {
  InvalidStateTransitionError,
  type Uuid,
} from "@restaurantos/shared-kernel";

/**
 * Order aggregate (spec §8.1): the fulfillment state machine is independent
 * from payment and fiscal state — an order can be ready but unpaid, or paid
 * but not yet accepted.
 */
export const ORDER_STATUSES = [
  "placed",
  "accepted",
  "preparing",
  "ready",
  "completed",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

const TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  placed: ["accepted", "cancelled"],
  accepted: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export class Order {
  constructor(
    readonly tenantId: Uuid,
    readonly id: Uuid,
    readonly locationId: Uuid,
    private currentStatus: OrderStatus,
    private currentVersion: number,
  ) {}

  get status(): OrderStatus {
    return this.currentStatus;
  }

  get version(): number {
    return this.currentVersion;
  }

  /** Idempotent: re-requesting the current state is a no-op (spec §8.4). */
  transition(to: OrderStatus): void {
    if (to === this.currentStatus) return;
    const allowed = TRANSITIONS[this.currentStatus];
    if (!allowed.includes(to)) {
      throw new InvalidStateTransitionError(this.currentStatus, to, {
        orderId: this.id,
      });
    }
    this.currentStatus = to;
    this.currentVersion += 1;
  }

  assertAcceptable(): void {
    if (this.currentStatus !== "placed") {
      throw new InvalidStateTransitionError(this.currentStatus, "accepted", {
        orderId: this.id,
      });
    }
  }
}

/** Derived financial summary (spec §8.1) — never stored on the order row. */
export type FinancialStatus =
  | "unpaid"
  | "partially_paid"
  | "paid"
  | "partially_refunded"
  | "refunded"
  | "overpaid";

export function deriveFinancialStatus(
  grossMinor: bigint,
  paidMinor: bigint,
  refundedMinor: bigint,
): FinancialStatus {
  if (refundedMinor > 0n) {
    return refundedMinor >= paidMinor ? "refunded" : "partially_refunded";
  }
  if (paidMinor <= 0n) return "unpaid";
  if (paidMinor < grossMinor) return "partially_paid";
  if (paidMinor > grossMinor) return "overpaid";
  return "paid";
}
