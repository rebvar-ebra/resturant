import type { PrismaClient } from "@prisma/client";
import { newId, type EventType, type Uuid } from "@restaurantos/shared-kernel";

/**
 * Outbox writer (spec §4.2.4, §6.3): the state change and its events are
 * appended inside the SAME transaction. The worker relay delivers them
 * at-least-once; consumers dedupe via consumer_inbox.
 *
 * Lives outside the business modules so each module can publish events
 * without importing another module's internals (spec §4.2).
 */

export interface OutboxEventInput {
  tenantId: Uuid;
  locationId?: Uuid | undefined;
  aggregateId: Uuid;
  aggregateVersion: number;
  eventType: EventType;
  correlationId?: string | undefined;
  /** Minimal, no PII/secrets (spec §6.2). */
  payload: Record<string, unknown>;
}

export interface OutboxWriter {
  append(tx: unknown, event: OutboxEventInput): Promise<void>;
}

type Tx = Pick<PrismaClient, "outboxEvent" | "eventDelivery">;

export class PrismaOutboxWriter implements OutboxWriter {
  constructor(private readonly consumerNames: readonly string[]) {}

  async append(tx: unknown, event: OutboxEventInput): Promise<void> {
    const client = tx as Tx;
    const eventId = newId();
    await client.outboxEvent.create({
      data: {
        tenantId: event.tenantId,
        eventId,
        aggregateId: event.aggregateId,
        aggregateVersion: event.aggregateVersion,
        eventType: event.eventType,
        payload: {
          ...(typeof event.payload === "object" ? event.payload : {}),
          ...(event.locationId !== undefined
            ? { locationId: event.locationId }
            : {}),
          ...(event.correlationId !== undefined
            ? { correlationId: event.correlationId }
            : {}),
        },
      },
    });
    if (this.consumerNames.length > 0) {
      await client.eventDelivery.createMany({
        data: this.consumerNames.map((consumerName) => ({
          tenantId: event.tenantId,
          eventId,
          consumerName,
          status: "pending",
        })),
      });
    }
  }
}
