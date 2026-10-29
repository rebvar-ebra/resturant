export interface PublicMenuItem {
  productId: string;
  name: string;
  description: string | null;
  categoryName: string;
  priceMinor: string;
  taxRateBps: number;
  allergens: string[];
}

export interface PublicMenu {
  locationId: string;
  locationName: string;
  currency: string;
  timezone: string;
  menuVersion: number;
  categories: Array<{ name: string; items: PublicMenuItem[] }>;
}

export const formatPriceMinor = (
  priceMinor: string,
  currency: string,
  locale: string,
): string => {
  assertIntegerString(priceMinor, "priceMinor");
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    useGrouping: true,
  });
  const fractionDigits = formatter.resolvedOptions().maximumFractionDigits ?? 2;
  const minorScale = 10n ** BigInt(fractionDigits);
  const minorAmount = BigInt(priceMinor);
  const wholeAmount = minorAmount / minorScale;
  const fraction = (minorAmount % minorScale).toString().padStart(fractionDigits, "0");

  return formatter
    .formatToParts(wholeAmount)
    .map((part) => (part.type === "fraction" ? fraction : part.value))
    .join("");
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readString = (value: unknown, field: string): string => {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${field} must be a non-empty string`);
  }
  return value;
};

function assertIntegerString(value: unknown, field: string): asserts value is string {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    throw new Error(`${field} must be an integer string`);
  }
}

const parseMenuItem = (value: unknown): PublicMenuItem => {
  if (!isRecord(value)) throw new Error("menu item must be an object");
  assertIntegerString(value.priceMinor, "priceMinor");
  if (!Array.isArray(value.allergens) || !value.allergens.every((item) => typeof item === "string")) {
    throw new Error("allergens must be an array of strings");
  }
  if (typeof value.taxRateBps !== "number" || !Number.isInteger(value.taxRateBps)) {
    throw new Error("taxRateBps must be an integer");
  }
  if (value.description !== null && typeof value.description !== "string") {
    throw new Error("description must be a string or null");
  }

  return {
    productId: readString(value.productId, "productId"),
    name: readString(value.name, "name"),
    description: value.description,
    categoryName: readString(value.categoryName, "categoryName"),
    priceMinor: value.priceMinor,
    taxRateBps: value.taxRateBps,
    allergens: value.allergens,
  };
};

export const parsePublicMenu = (value: unknown): PublicMenu => {
  if (!isRecord(value)) throw new Error("public menu must be an object");
  if (!Array.isArray(value.categories)) throw new Error("categories must be an array");
  if (typeof value.menuVersion !== "number" || !Number.isInteger(value.menuVersion)) {
    throw new Error("menuVersion must be an integer");
  }

  const categories = value.categories.map((category) => {
    if (!isRecord(category) || !Array.isArray(category.items)) {
      throw new Error("category must contain an items array");
    }
    return {
      name: readString(category.name, "category name"),
      items: category.items.map(parseMenuItem),
    };
  });

  return {
    locationId: readString(value.locationId, "locationId"),
    locationName: readString(value.locationName, "locationName"),
    currency: readString(value.currency, "currency"),
    timezone: readString(value.timezone, "timezone"),
    menuVersion: value.menuVersion,
    categories,
  };
};

export const getPublicMenu = async (slug: string): Promise<PublicMenu> => {
  const apiBaseUrl = process.env.RESTAURANTOS_API_URL ?? "http://localhost:3001/v1";
  const response = await fetch(
    `${apiBaseUrl}/public/restaurants/${encodeURIComponent(slug)}/menu`,
    { next: { revalidate: 60 } },
  );

  if (!response.ok) {
    throw new Error(`Public menu request failed with status ${response.status}`);
  }

  return parsePublicMenu(await response.json());
};
