import { z } from "zod";

/**
 * Event envelope — spec §6.2. Events are facts in past tense; payload is
 * minimal (no PII, no card data, no sensitive free text).
 */
export const eventEnvelopeSchema = z.object({
  eventId: z.string().uuid(),
  eventType: z
    .string()
    .regex(/^[a-z_]+\.[a-z_]+\.v[0-9]+$/, "eventType must look like order.accepted.v1"),
  tenantId: z.string().uuid(),
  locationId: z.string().uuid().optional(),
  aggregateId: z.string().uuid(),
  aggregateVersion: z.number().int().positive(),
  occurredAt: z.string().datetime({ offset: true }),
  correlationId: z.string().min(1),
  payload: z.record(z.unknown()),
});

export type EventEnvelope = z.infer<typeof eventEnvelopeSchema>;

/** Known event types (spec §6.2). Consumers must tolerate unknown future versions. */
export const EVENT_TYPES = [
  "menu.published.v1",
  "order.placed.v1",
  "order.accepted.v1",
  "order.item_preparation_started.v1",
  "order.ready.v1",
  "order.cancelled.v1",
  "payment.succeeded.v1",
  "refund.succeeded.v1",
  "fiscal.receipt_issued.v1",
  "inventory.adjusted.v1",
  "subscription.entitlement_changed.v1",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];
