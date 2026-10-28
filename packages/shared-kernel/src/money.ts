/**
 * Money in minor units (bigint) with an ISO-4217 currency — spec §16.1.
 * Never float. API representation: { "amountMinor": "1250", "currency": "EUR" }.
 */

export type CurrencyCode = string; // validated to 3 uppercase letters at boundaries

const CURRENCY_RE = /^[A-Z]{3}$/;

export class Money {
  private constructor(
    readonly amountMinor: bigint,
    readonly currency: CurrencyCode,
  ) {}

  static of(amountMinor: bigint | number | string, currency: CurrencyCode): Money {
    if (!CURRENCY_RE.test(currency)) {
      throw new Error(`Invalid currency code: ${currency}`);
    }
    const amount = BigInt(amountMinor);
    return new Money(amount, currency);
  }

  static zero(currency: CurrencyCode): Money {
    return Money.of(0n, currency);
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amountMinor + other.amountMinor, this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amountMinor - other.amountMinor, this.currency);
  }

  /** Multiply by an integer factor (e.g. quantity). */
  times(factor: bigint | number): Money {
    return new Money(this.amountMinor * BigInt(factor), this.currency);
  }

  isNegative(): boolean {
    return this.amountMinor < 0n;
  }

  isZero(): boolean {
    return this.amountMinor === 0n;
  }

  equals(other: Money): boolean {
    return this.amountMinor === other.amountMinor && this.currency === other.currency;
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(
        `Currency mismatch: ${this.currency} vs ${other.currency}`,
      );
    }
  }

  toJSON(): { amountMinor: string; currency: string } {
    return { amountMinor: this.amountMinor.toString(), currency: this.currency };
  }
}

/**
 * Tax helpers — spec §8.3. Rates are basis points (1900 = 19.00%).
 * Gross-inclusive: net = round(gross / (1 + rate)); tax = gross - net.
 * The rounding mode must match the accounting/POS path; half-up is the default.
 */
export function splitGrossInclusive(
  gross: Money,
  taxRateBps: number,
): { net: Money; tax: Money } {
  if (taxRateBps < 0 || taxRateBps > 10000) {
    throw new Error(`taxRateBps out of range: ${taxRateBps}`);
  }
  const rateDenom = 10000n + BigInt(taxRateBps);
  const grossMinor = gross.amountMinor;
  // round-half-up: (gross * 10000 + denom/2) / denom
  const numerator = grossMinor * 10000n;
  const netMinor = (numerator + rateDenom / 2n) / rateDenom;
  const net = Money.of(netMinor, gross.currency);
  const tax = gross.subtract(net);
  return { net, tax };
}
