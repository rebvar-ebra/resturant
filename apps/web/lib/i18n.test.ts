import { describe, expect, it } from "vitest";
import { localeDirection, normalizeLocale } from "./i18n";

describe("locale", () => {
  it("accepts the supported Persian and German locale values", () => {
    expect(normalizeLocale("fa")).toBe("fa");
    expect(normalizeLocale("de")).toBe("de");
  });

  it("falls back to Persian for an unknown or missing locale", () => {
    expect(normalizeLocale("en")).toBe("fa");
    expect(normalizeLocale(undefined)).toBe("fa");
  });

  it("uses the correct writing direction for each language", () => {
    expect(localeDirection("fa")).toBe("rtl");
    expect(localeDirection("de")).toBe("ltr");
  });
});
