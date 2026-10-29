"use client";

import { useMemo, useState } from "react";
import { addItem, cartSubtotalMinor, removeItem, type Cart } from "../lib/cart";
import { localeTag, menuMessages, type Locale } from "../lib/i18n";
import { formatPriceMinor, type PublicMenu, type PublicMenuItem } from "../lib/menu";

interface MenuExperienceProps {
  menu: PublicMenu;
  locale: Locale;
}

const ProductCard = ({
  item,
  currency,
  locale,
  quantity,
  onAdd,
  onRemove,
}: {
  item: PublicMenuItem;
  currency: string;
  locale: Locale;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}) => {
  const messages = menuMessages[locale];
  const allergenNames: Record<string, string> = { ...messages.allergensMap };

  return (
    <article className="group grid min-h-56 grid-cols-[1fr_auto] gap-5 border-t border-[var(--line)] py-7 first:border-t-0 md:min-h-64 md:py-9">
    <div className="flex flex-col items-start">
      <h3 className="display-latin text-3xl font-semibold leading-tight tracking-[-0.03em] md:text-4xl" dir="ltr">
        {item.name}
      </h3>
      <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--ink-soft)] md:text-base">
        {item.description ?? messages.fallbackDescription}
      </p>
      {item.allergens.length > 0 ? (
        <p className="mt-4 text-xs text-[var(--ink-soft)]">
          {messages.allergens}: {item.allergens.map((allergen) => allergenNames[allergen] ?? allergen).join(locale === "fa" ? "، " : ", ")}
        </p>
      ) : null}
      <p className="display-latin mt-auto pt-7 text-2xl font-semibold" dir="ltr">
        {formatPriceMinor(item.priceMinor, currency, "de-DE")}
      </p>
    </div>

    <div className="flex flex-col items-end justify-end">
      <div className="mb-auto grid size-20 place-items-center rounded-full bg-[var(--saffron)] text-3xl transition duration-300 group-hover:rotate-6 group-hover:scale-105 md:size-24">
        {item.categoryName.toLowerCase().includes("drink") ? "◉" : "✦"}
      </div>
      {quantity === 0 ? (
        <button
          type="button"
          onClick={onAdd}
          className="mt-5 min-h-12 rounded-full bg-[var(--ink)] px-6 text-sm font-bold text-[var(--paper-light)] transition hover:-translate-y-0.5 hover:bg-[var(--tomato)]"
          aria-label={`${messages.addToCart}: ${item.name}`}
        >
          {messages.add} <span aria-hidden="true" className="ms-2 text-lg">＋</span>
        </button>
      ) : (
        <div className="mt-5 flex min-h-12 items-center gap-1 rounded-full bg-[var(--ink)] p-1 text-[var(--paper-light)]" aria-label={`${messages.quantity}: ${item.name}`}>
          <button type="button" onClick={onAdd} className="grid size-10 place-items-center rounded-full hover:bg-white/15" aria-label={`${messages.increase}: ${item.name}`}>＋</button>
          <span className="min-w-7 text-center font-bold" aria-live="polite">{quantity.toLocaleString(localeTag(locale))}</span>
          <button type="button" onClick={onRemove} className="grid size-10 place-items-center rounded-full hover:bg-white/15" aria-label={`${messages.decrease}: ${item.name}`}>−</button>
        </div>
      )}
    </div>
  </article>
  );
};

export const MenuExperience = ({ menu, locale }: MenuExperienceProps) => {
  const messages = menuMessages[locale];
  const numberLocale = localeTag(locale);
  const [cart, setCart] = useState<Cart>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const cartItems = useMemo(() => Object.values(cart), [cart]);
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cartSubtotalMinor(cart);

  const handleAdd = (item: PublicMenuItem) => {
    setCart((current) => addItem(current, item));
    setStatusMessage(`${item.name} ${messages.added}`);
  };

  const handleRemove = (item: PublicMenuItem) => {
    setCart((current) => removeItem(current, item.productId));
    setStatusMessage(`${item.name} ${messages.decreased}`);
  };

  return (
    <>
      <div className="sticky top-0 z-30 border-y border-[var(--line)] bg-[rgba(243,234,216,0.94)] backdrop-blur-sm">
        <nav className="shell flex min-h-16 items-center gap-2 overflow-x-auto" aria-label={messages.categories}>
          {menu.categories.map((category) => (
            <a key={category.name} href={`#category-${encodeURIComponent(category.name)}`} className="shrink-0 rounded-full px-5 py-2 text-sm font-bold transition hover:bg-[var(--ink)] hover:text-[var(--paper-light)]">
              {category.name}
            </a>
          ))}
        </nav>
      </div>

      <div className="shell pb-40">
        {menu.categories.map((category, index) => (
          <section key={category.name} id={`category-${encodeURIComponent(category.name)}`} className="scroll-mt-24 pt-16 md:grid md:grid-cols-[15rem_1fr] md:gap-12 md:pt-24">
            <div>
              <p className="text-xs font-bold text-[var(--saffron-dark)]">{(index + 1).toLocaleString(numberLocale, { minimumIntegerDigits: 2, useGrouping: false })}</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] md:sticky md:top-28 md:text-4xl">{category.name}</h2>
            </div>
            <div className="mt-7 md:mt-0">
              {category.items.map((item) => (
                <ProductCard
                  key={item.productId}
                  item={item}
                  currency={menu.currency}
                  locale={locale}
                  quantity={cart[item.productId]?.quantity ?? 0}
                  onAdd={() => handleAdd(item)}
                  onRemove={() => handleRemove(item)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">{statusMessage}</p>

      {itemCount > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-40 p-3 sm:p-5">
          <div className="mx-auto max-w-2xl rounded-[1.7rem] bg-[var(--ink)] p-2 text-[var(--paper-light)] shadow-[0_24px_80px_rgba(23,33,27,0.35)]">
            <button
              type="button"
              onClick={() => setIsCartOpen((current) => !current)}
              className="flex min-h-16 w-full items-center justify-between rounded-[1.25rem] px-5 text-start transition hover:bg-white/5"
              aria-expanded={isCartOpen}
            >
              <span><strong className="me-2 inline-grid size-8 place-items-center rounded-full bg-[var(--saffron)] text-[var(--ink)]">{itemCount.toLocaleString(numberLocale)}</strong> {messages.cart}</span>
              <span className="display-latin text-xl font-semibold" dir="ltr">{formatPriceMinor(subtotal.toString(), menu.currency, "de-DE")}</span>
            </button>

            {isCartOpen ? (
              <div className="border-t border-white/15 px-5 pb-5 pt-4">
                <ul className="grid gap-3">
                  {cartItems.map((item) => (
                    <li key={item.productId} className="flex items-center justify-between text-sm">
                      <span>{item.quantity.toLocaleString(numberLocale)} × {item.name}</span>
                      <span className="display-latin" dir="ltr">{formatPriceMinor((BigInt(item.priceMinor) * BigInt(item.quantity)).toString(), menu.currency, "de-DE")}</span>
                    </li>
                  ))}
                </ul>
                <button type="button" disabled className="mt-5 min-h-12 w-full cursor-not-allowed rounded-full bg-white/10 px-5 text-sm font-bold text-white/50">
                  {messages.checkoutSoon}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
};
