import type { Uuid } from "./id.js";

/**
 * TenantContext — built only after session validation + membership check
 * (spec §13.2). The tenant id from a URL is just a *selector*; it becomes
 * part of the context only after the membership is verified.
 */
export interface TenantContext {
  readonly tenantId: Uuid;
}

export interface AuthorizedTenantContext extends TenantContext {
  readonly userId: Uuid;
  readonly membershipId: Uuid;
  readonly role: Role;
  /** Locations the membership is scoped to; empty = all tenant locations. */
  readonly locationIds: readonly Uuid[];
  readonly permissions: readonly string[];
}

/**
 * Guest context for QR ordering (spec §13.2): not a tenant member; access is
 * limited to the published menu and the orders of this session.
 */
export interface GuestContext {
  readonly tenantId: Uuid;
  readonly locationId: Uuid;
  readonly guestSessionId: Uuid;
}

/** Roles from spec §13.3. */
export const ROLES = [
  "owner",
  "manager",
  "cashier",
  "waiter",
  "kitchen",
  "inventory_manager",
  "accountant",
  "support",
] as const;

export type Role = (typeof ROLES)[number];

/**
 * Coarse permission map — the source of truth lives in the database-backed
 * policy of the identity module; this baseline exists so domain code can
 * express requirements like permissions.require(ctx, "order.accept").
 */
export const ROLE_PERMISSIONS: Record<Role, readonly string[]> = {
  owner: [
    "tenant.settings",
    "billing.manage",
    "export.create",
    "member.invite",
    "menu.publish",
    "order.accept",
    "order.cancel",
    "payment.refund",
    "inventory.adjust",
    "report.view",
  ],
  manager: [
    "menu.publish",
    "order.accept",
    "order.cancel",
    "payment.refund",
    "inventory.adjust",
    "report.view",
  ],
  cashier: ["order.create", "payment.capture"],
  waiter: ["order.create", "order.view"],
  kitchen: ["kitchen.ticket.transition"],
  inventory_manager: ["inventory.adjust", "purchasing.receive"],
  accountant: ["report.view", "export.create"],
  support: ["support.impersonate"],
};
