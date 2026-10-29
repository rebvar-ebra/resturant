import type { Metadata } from "next";
import Link from "next/link";
import { LanguageSwitcher } from "../../../components/language-switcher";
import { MenuExperience } from "../../../components/menu-experience";
import { localeTag, menuMessages, type Locale } from "../../../lib/i18n";
import { getCurrentLocale } from "../../../lib/locale.server";
import { getPublicMenu } from "../../../lib/menu";

interface PublicMenuPageProps {
  params: Promise<{ slug: string }>;
}

export const generateMetadata = async (): Promise<Metadata> => {
  const locale = await getCurrentLocale();
  return {
    title: menuMessages[locale].pageTitle,
    robots: { index: false, follow: false },
  };
};

const MenuUnavailable = ({ locale }: { locale: Locale }) => {
  const messages = menuMessages[locale];
  return (
    <main className="shell grid min-h-screen place-items-center py-16">
      <section className="max-w-xl rounded-[2.5rem] border border-[var(--line)] bg-[var(--paper-light)] p-8 text-center shadow-[0_24px_70px_rgba(82,45,19,0.12)] md:p-12">
        <div className="mb-8 flex justify-center"><LanguageSwitcher locale={locale} /></div>
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-[var(--saffron)] text-3xl" aria-hidden="true">◌</div>
        <h1 className="mt-7 text-3xl font-black">{messages.unavailableTitle}</h1>
        <p className="mt-4 leading-8 text-[var(--ink-soft)]">{messages.unavailableText}</p>
        <Link href="/" className="mt-8 inline-flex min-h-12 items-center rounded-full border border-[var(--ink)] px-6 font-bold transition hover:bg-[var(--ink)] hover:text-[var(--paper-light)]">{messages.backHome}</Link>
      </section>
    </main>
  );
};

export default async function PublicMenuPage({ params }: PublicMenuPageProps) {
  const { slug } = await params;
  const locale = await getCurrentLocale();
  const messages = menuMessages[locale];

  try {
    const menu = await getPublicMenu(slug);
    return (
      <main>
        <header className="shell flex min-h-24 items-center justify-between border-b border-[var(--line)]">
          <Link href="/" className="display-latin text-xl font-semibold tracking-[-0.04em]" dir="ltr">RestaurantOS.</Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher locale={locale} />
            <span className="hidden rounded-full bg-[var(--sage)] px-4 py-2 text-xs font-bold text-white sm:inline-flex">{messages.activeMenu}</span>
          </div>
        </header>

        <section className="shell grid gap-8 py-14 md:grid-cols-[1fr_auto] md:items-end md:py-20">
          <div>
            <p className="text-sm font-bold text-[var(--saffron-dark)]">{messages.welcome}</p>
            <h1 className="mt-3 text-[clamp(3rem,10vw,7rem)] font-black leading-none tracking-[-0.065em]">{menu.locationName}</h1>
            <p className="mt-6 max-w-xl leading-8 text-[var(--ink-soft)]">{messages.intro}</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-[var(--ink-soft)]">
            <span className="h-px w-10 bg-[var(--line)]" />
            {messages.menuVersion} {menu.menuVersion.toLocaleString(localeTag(locale))}
          </div>
        </section>

        <MenuExperience menu={menu} locale={locale} />
      </main>
    );
  } catch {
    return <MenuUnavailable locale={locale} />;
  }
}
