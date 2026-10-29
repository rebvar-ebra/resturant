"use client";

import { useRouter } from "next/navigation";
import type { Locale } from "../lib/i18n";

export const LanguageSwitcher = ({ locale }: { locale: Locale }) => {
  const router = useRouter();

  const handleLocaleChange = (nextLocale: Locale) => {
    document.cookie = `restaurantos_locale=${nextLocale}; Max-Age=31536000; Path=/; SameSite=Lax`;
    router.refresh();
  };

  return (
    <div className="flex min-h-11 items-center rounded-full border border-[var(--line)] bg-[var(--paper-light)] p-1" aria-label={locale === "fa" ? "انتخاب زبان" : "Sprache wählen"}>
      {(["fa", "de"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => handleLocaleChange(option)}
          className={`min-h-9 rounded-full px-3 text-xs font-bold transition ${locale === option ? "bg-[var(--ink)] text-[var(--paper-light)]" : "text-[var(--ink-soft)] hover:bg-black/5"}`}
          aria-pressed={locale === option}
          lang={option}
          dir={option === "fa" ? "rtl" : "ltr"}
        >
          {option === "fa" ? "فارسی" : "Deutsch"}
        </button>
      ))}
    </div>
  );
};
