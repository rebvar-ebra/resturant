import { describe, expect, it } from "vitest";
import { formatPriceMinor, parsePublicMenu } from "./menu";

describe("public menu", () => {
  it("formats integer minor units without converting money through floating point", () => {
    expect(formatPriceMinor("950", "EUR", "de-DE")).toBe("9,50\u00a0€");
  });

  it("rejects a menu item with a malformed minor-unit price", () => {
    expect(() =>
      parsePublicMenu({
        locationId: "location-1",
        locationName: "Mitte",
        currency: "EUR",
        timezone: "Europe/Berlin",
        menuVersion: 1,
        categories: [
          {
            name: "Pizza",
            items: [
              {
                productId: "pizza-1",
                name: "Margherita",
                description: null,
                categoryName: "Pizza",
                priceMinor: "9.50",
                taxRateBps: 700,
                allergens: ["gluten"],
              },
            ],
          },
        ],
      }),
    ).toThrow("priceMinor must be an integer string");
  });
});
