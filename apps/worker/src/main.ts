import { loadConfig } from "@restaurantos/config";
import { OutboxRelay } from "./outbox-relay.js";

/**
 * Worker process (spec §4.1): same codebase and release as the API,
 * separate process. Owns the outbox relay, integration commands and
 * reporting rebuilds. Redis/BullMQ jobs are rebuilt from PostgreSQL
 * state if Redis is lost (spec §8.5).
 */
async function main(): Promise<void> {
  const config = loadConfig();

  const relay = new OutboxRelay(config, {
    pollIntervalMs: 500,
    batchSize: 100,
    consumers: [
      // Registered consumers get at-least-once delivery and must dedupe
      // via consumer_inbox (consumer_name, event_id) — spec §6.3.
      {
        name: "audit-log",
        handle: async (event) => {
          // Foundation phase: record only. Real projections (KDS dispatch,
          // reporting, notifications) register here in later slices.
          console.log(
            `[audit-log] ${event.eventType} tenant=${event.tenantId} aggregate=${event.aggregateId} v=${event.aggregateVersion}`,
          );
        },
      },
    ],
  });

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n${signal} received — draining worker`);
    await relay.stop();
    process.exit(0);
  };
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));

  await relay.start();
}

void main();
