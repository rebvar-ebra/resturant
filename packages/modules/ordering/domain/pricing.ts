import { Money, splitGrossInclusive } from "@restaurantos/shared-kernel";

/**
 * Server-side pricing (spec §8.2.1): the client never sets prices. All item
 * prices, tax and totals come from the published menu snapshot.
 */
export interface PricedItemInput {
  menuItemId: string;
  productId: string;
  name: string;
  quantity: string; // decimal string per API contract
  unitPriceMinor: bigint;
  taxRateBps: number;
  modifiers: { optionId: string; name: string; priceDeltaMinor: bigint }[];
}

export interface PricedLine {
  productId: string;
  nameSnapshot: string;
  quantity: string;
  unitGrossMinor: bigint;
  lineGrossMinor: bigint;
  taxRateBps: number;
  lineTaxMinor: bigint;
  modifiersSnapshot: { optionId: string; name: string; priceDeltaMinor: string }[];
}

export interface PricedOrder {
  lines: PricedLine[];
  grossMinor: bigint;
  taxMinor: bigint;
}

export function priceOrder(items: PricedItemInput[], currency: string): PricedOrder {
  let gross = Money.zero(currency);
  let tax = Money.zero(currency);

  const lines = items.map((item) => {
    const qty = parseQuantity(item.quantity);
    const modifierDelta = item.modifiers.reduce(
      (sum, m) => sum + m.priceDeltaMinor,
      0n,
    );
    const unitGross = Money.of(item.unitPriceMinor + modifierDelta, currency);
    // qty has ≤3 decimals; milliUnits = qty × 1000 exactly, so the division is exact.
    const lineGrossExact = Money.of(
      (unitGross.amountMinor * qty.milliUnits) / 1000n,
      currency,
    );

    const { tax: lineTax } = splitGrossInclusive(lineGrossExact, item.taxRateBps);

    gross = gross.add(lineGrossExact);
    tax = tax.add(lineTax);

    return {
      productId: item.productId,
      nameSnapshot: item.name,
      quantity: qty.normalized,
      unitGrossMinor: unitGross.amountMinor,
      lineGrossMinor: lineGrossExact.amountMinor,
      taxRateBps: item.taxRateBps,
      lineTaxMinor: lineTax.amountMinor,
      modifiersSnapshot: item.modifiers.map((m) => ({
        optionId: m.optionId,
        name: m.name,
        priceDeltaMinor: m.priceDeltaMinor.toString(),
      })),
    } satisfies PricedLine;
  });

  return { lines, grossMinor: gross.amountMinor, taxMinor: tax.amountMinor };
}

function parseQuantity(raw: string): { milliUnits: bigint; normalized: string } {
  if (!/^\d+(\.\d{1,3})?$/.test(raw)) {
    throw new Error(`Invalid quantity: ${raw}`);
  }
  const [whole = "0", frac = ""] = raw.split(".");
  const milli = BigInt(whole) * 1000n + BigInt((frac + "000").slice(0, 3) || "0");
  if (milli <= 0n) throw new Error("Quantity must be positive");
  return { milliUnits: milli, normalized: raw };
}
