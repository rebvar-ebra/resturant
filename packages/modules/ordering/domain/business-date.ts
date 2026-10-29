/**
 * Business date from the location timezone + business_day_cutoff
 * (spec §7.3, §11.2): orders after midnight but before the cutoff belong to
 * the previous business day.
 */
export function businessDateFor(
  timezone: string,
  cutoff: string, // "HH:mm"
  now: Date,
): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const get = (type: string): string =>
    parts.find((p) => p.type === type)?.value ?? "00";

  const localDate = `${get("year")}-${get("month")}-${get("day")}`;
  const localTime = `${get("hour")}:${get("minute")}`;

  if (localTime >= cutoff) return localDate;

  const previous = new Date(`${localDate}T00:00:00Z`);
  previous.setUTCDate(previous.getUTCDate() - 1);
  return previous.toISOString().slice(0, 10);
}
