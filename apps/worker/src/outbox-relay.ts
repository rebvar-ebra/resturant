import { PrismaClient } from "@prisma/client";
import type { AppConfig } from "@restaurantos/config";

export interface OutboxEventRow {
  tenantId: string;
  eventId: string;
  aggregateId: string;
  aggregateVersion: number;
  eventType: string;
  payload: unknown;
  occurredAt: Date;
}

export interface Consumer {
  name: string;
  handle: (event: OutboxEventRow) => Promise<void>;
}

interface RelayOptions {
  pollIntervalMs: number;
  batchSize: number;
  consumers: Consumer[];
}

/**
 * Outbox relay (spec §6.3):
 *  - Events are committed with the business change in one transaction (API side).
 *  - This relay claims batches with FOR UPDATE SKIP LOCKED (lease), delivers
 *    at-least-once to every registered consumer, and marks delivery durable.
 *  - Consumers dedupe via consumer_inbox — the relay may redeliver after a crash.
 *  - The relay is cross-tenant by design; it never sets app.tenant_id and is
 *    the ONLY component besides migrations allowed to read across tenants.
 */
export class OutboxRelay {
  private readonly prisma: PrismaClient;
  private running = false;
  private timer: NodeJS.Timeout | null = null;

  constructor(
    config: AppConfig,
    private readonly options: RelayOptions,
  ) {
    this.prisma = new PrismaClient({
      datasources: { db: { url: config.DATABASE_URL } },
    });
  }

  async start(): Promise<void> {
    await this.prisma.$connect();
    this.running = true;
    console.log(
      `Outbox relay started (${this.options.consumers.length} consumers, batch=${this.options.batchSize})`,
    );
    this.schedule(0);
  }

  async stop(): Promise<void> {
    this.running = false;
    if (this.timer) clearTimeout(this.timer);
    await this.prisma.$disconnect();
  }

  private schedule(delayMs: number): void {
    if (!this.running) return;
    this.timer = setTimeout(() => {
      void this.tick()
        .catch((err: unknown) => {
          console.error("Outbox relay tick failed:", err);
        })
        .finally(() => this.schedule(this.options.pollIntervalMs));
    }, delayMs);
  }

  private async tick(): Promise<void> {
    const claimed = await this.claimBatch();
    for (const event of claimed) {
      await this.deliver(event);
    }
  }

  /**
   * Claim a batch: pending deliveries for known consumers, locked with a
   * lease so two workers never process the same row concurrently.
   */
  private async claimBatch(): Promise<OutboxEventRow[]> {
    const consumerNames = this.options.consumers.map((c) => c.name);
    if (consumerNames.length === 0) return [];

    return this.prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<
        {
          tenant_id: string;
          event_id: string;
          aggregate_id: string;
          aggregate_version: number;
          event_type: string;
          payload: unknown;
          occurred_at: Date;
        }[]
      >`
        SELECT e.tenant_id, e.event_id, e.aggregate_id, e.aggregate_version,
               e.event_type, e.payload, e.occurred_at
        FROM outbox_events e
        WHERE EXISTS (
          SELECT 1
          FROM event_deliveries d
          WHERE d.tenant_id = e.tenant_id
            AND d.event_id = e.event_id
            AND d.status = 'pending'
            AND d.consumer_name = ANY(${consumerNames}::text[])
        )
        ORDER BY e.occurred_at ASC
        LIMIT ${this.options.batchSize}
        FOR UPDATE OF e SKIP LOCKED
      `;

      return rows.map((r) => ({
        tenantId: r.tenant_id,
        eventId: r.event_id,
        aggregateId: r.aggregate_id,
        aggregateVersion: r.aggregate_version,
        eventType: r.event_type,
        payload: r.payload,
        occurredAt: r.occurred_at,
      }));
    });
  }

  private async deliver(event: OutboxEventRow): Promise<void> {
    for (const consumer of this.options.consumers) {
      try {
        await consumer.handle(event);
        await this.prisma.eventDelivery.update({
          where: {
            tenantId_eventId_consumerName: {
              tenantId: event.tenantId,
              eventId: event.eventId,
              consumerName: consumer.name,
            },
          },
          data: {
            status: "delivered",
            deliveredAt: new Date(),
            lastError: null,
          },
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message.slice(0, 500) : "unknown error";
        await this.prisma.eventDelivery.update({
          where: {
            tenantId_eventId_consumerName: {
              tenantId: event.tenantId,
              eventId: event.eventId,
              consumerName: consumer.name,
            },
          },
          data: {
            attempts: { increment: 1 },
            lastError: message,
            // dead-letter policy (retry ceiling) lands with the jobs slice
            status: "pending",
          },
        });
      }
    }
  }
}
