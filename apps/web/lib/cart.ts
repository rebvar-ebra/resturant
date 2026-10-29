export interface CartItem {
  productId: string;
  name: string;
  priceMinor: string;
  quantity: number;
}

export type Cart = Record<string, CartItem>;

export const addItem = (
  cart: Cart,
  item: Omit<CartItem, "quantity">,
): Cart => {
  const current = cart[item.productId];
  return {
    ...cart,
    [item.productId]: {
      ...item,
      quantity: (current?.quantity ?? 0) + 1,
    },
  };
};

export const removeItem = (cart: Cart, productId: string): Cart => {
  const current = cart[productId];
  if (!current) return cart;

  if (current.quantity > 1) {
    return {
      ...cart,
      [productId]: { ...current, quantity: current.quantity - 1 },
    };
  }

  const remaining = { ...cart };
  delete remaining[productId];
  return remaining;
};

export const cartSubtotalMinor = (cart: Cart): bigint =>
  Object.values(cart).reduce(
    (total, item) => total + BigInt(item.priceMinor) * BigInt(item.quantity),
    0n,
  );
