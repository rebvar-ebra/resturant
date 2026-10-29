import { describe, expect, it } from "vitest";
import { addItem, cartSubtotalMinor, removeItem, type Cart } from "./cart";

const emptyCart: Cart = {};

describe("cart", () => {
  it("increments an existing menu item instead of creating a duplicate", () => {
    const once = addItem(emptyCart, { productId: "pizza-1", name: "Margherita", priceMinor: "950" });
    const twice = addItem(once, { productId: "pizza-1", name: "Margherita", priceMinor: "950" });

    expect(twice).toEqual({
      "pizza-1": { productId: "pizza-1", name: "Margherita", priceMinor: "950", quantity: 2 },
    });
  });

  it("removes an item when its quantity reaches zero", () => {
    const once = addItem(emptyCart, { productId: "pizza-1", name: "Margherita", priceMinor: "950" });

    expect(removeItem(once, "pizza-1")).toEqual({});
  });

  it("calculates the subtotal in integer minor units", () => {
    const cart: Cart = {
      "pizza-1": { productId: "pizza-1", name: "Margherita", priceMinor: "950", quantity: 2 },
      "drink-1": { productId: "drink-1", name: "Limonade", priceMinor: "325", quantity: 1 },
    };

    expect(cartSubtotalMinor(cart)).toBe(2225n);
  });
});
