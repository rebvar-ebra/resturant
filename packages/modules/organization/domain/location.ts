import { newId, type Uuid } from "@restaurantos/shared-kernel";

const CURRENCY_RE = /^[A-Z]{3}$/;
const CUTOFF_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Location (spec §13.1): a branch with its own timezone, menu, devices,
 * fiscal settings and integrations.
 */
export class Location {
  private constructor(
    readonly tenantId: Uuid,
    readonly id: Uuid,
    readonly name: string,
    readonly timezone: string,
    readonly currency: string,
    readonly businessDayCutoff: string,
  ) {}

  static create(input: {
    tenantId: Uuid;
    name: string;
    timezone?: string | undefined;
    currency?: string | undefined;
    businessDayCutoff?: string | undefined;
  }): Location {
    const name = input.name.trim();
    if (name.length < 2) throw new Error("Location name too short");

    const timezone = input.timezone ?? "Europe/Berlin";
    assertValidTimezone(timezone);

    const currency = input.currency ?? "EUR";
    if (!CURRENCY_RE.test(currency)) {
      throw new Error(`Invalid currency: ${currency}`);
    }

    const cutoff = input.businessDayCutoff ?? "04:00";
    if (!CUTOFF_RE.test(cutoff)) {
      throw new Error(`Invalid business day cutoff: ${cutoff}`);
    }

    return new Location(input.tenantId, newId(), name, timezone, currency, cutoff);
  }
}

function assertValidTimezone(tz: string): void {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
  } catch {
    throw new Error(`Invalid IANA timezone: ${tz}`);
  }
}
