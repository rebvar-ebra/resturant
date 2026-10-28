import { randomUUID } from "node:crypto";

/**
 * IDs are generated in the application layer (spec §7.4), not by the database.
 * UUID v4 keeps cross-tenant guessing impractical; uniqueness is still
 * enforced by composite keys, never by the UUID alone.
 */
export type Uuid = string;

export function newId(): Uuid {
  return randomUUID();
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function assertUuid(value: string, field = "id"): Uuid {
  if (!UUID_RE.test(value)) {
    throw new Error(`Invalid UUID for ${field}`);
  }
  return value;
}
