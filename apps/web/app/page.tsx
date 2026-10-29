import Link from "next/link";
import { LanguageSwitcher } from "../components/language-switcher";
import { homeMessages } from "../lib/i18n";
import { getCurrentLocale } from "../lib/locale.server";

export default async function HomePage() {
  const locale = await getCurrentLocale();
  const messages = homeMessages[locale];

  return (
    <main className="overflow-hidden">
      <header className="shell flex min-h-24 items-center justify-between border-b border-[var(--line)]">
        <Link href="/" className="display-latin text-2xl font-semibold tracking-[-0.04em]" dir="ltr">
          RestaurantOS<span className="text-[var(--tomato)]">.</span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} />
          <Link
            href="/r/demo-mitte"
            className="hidden min-h-11 items-center rounded-full border border-[var(--ink)] px-5 text-sm font-bold transition hover:-translate-y-0.5 hover:bg-[var(--ink)] hover:text-[var(--paper-light)] sm:inline-flex"
          >
            {messages.demoMenu}
          </Link>
        </div>
      </header>

      <section className="shell grid min-h-[calc(100vh-6rem)] items-center gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
        <div className="relative z-10">
          <p className="reveal mb-7 flex items-center gap-3 text-sm font-bold text-[var(--saffron-dark)]">
            <span className="h-px w-10 bg-current" />
            {messages.eyebrow}
          </p>
          <h1 className="reveal reveal-delay-1 max-w-3xl text-[clamp(3.25rem,9vw,7.8rem)] font-black leading-[0.92] tracking-[-0.065em]">
            {messages.headline}
            <br />
            <span className="text-[var(--tomato)]">{messages.headlineAccent}</span>
          </h1>
          <p className="reveal reveal-delay-2 mt-8 max-w-xl text-lg leading-8 text-[var(--ink-soft)] md:text-xl md:leading-9">
            {messages.intro}
          </p>
          <div className="reveal reveal-delay-2 mt-10 flex flex-wrap gap-3">
            <Link
              href="/r/demo-mitte"
              className="inline-flex min-h-14 items-center rounded-full bg-[var(--ink)] px-7 font-bold text-[var(--paper-light)] shadow-[0_10px_0_rgba(23,33,27,0.16)] transition hover:-translate-y-1 hover:shadow-[0_14px_0_rgba(23,33,27,0.14)]"
            >
              {messages.enterMenu}
              <span aria-hidden="true" className="ms-3 text-xl">{locale === "fa" ? "←" : "→"}</span>
            </Link>
            <span className="inline-flex min-h-14 items-center px-4 text-sm text-[var(--ink-soft)]">{messages.release}</span>
          </div>
        </div>

        <div className="relative mx-auto aspect-[4/5] w-full max-w-[31rem] lg:ml-0">
          <div className="absolute inset-x-8 bottom-0 top-16 rotate-3 rounded-[3rem] bg-[var(--tomato)] shadow-[0_35px_80px_rgba(82,45,19,0.24)]" />
          <div className="absolute inset-x-0 bottom-10 top-0 -rotate-2 overflow-hidden rounded-[3rem] border border-[var(--line)] bg-[var(--paper-light)] p-7 shadow-[0_24px_70px_rgba(82,45,19,0.18)]">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-5">
              <div>
                <p className="text-xs text-[var(--ink-soft)]">{messages.branch}</p>
                <p className="mt-1 text-xl font-black">{messages.todayMenu}</p>
              </div>
              <div className="grid size-12 place-items-center rounded-full bg-[var(--saffron)] text-xl">✦</div>
            </div>
            <div className="mt-7 rounded-[2rem] bg-[var(--ink)] p-6 text-[var(--paper-light)]">
              <p className="text-xs text-[var(--saffron)]">{messages.kitchenPick}</p>
              <h2 className="display-latin mt-3 text-4xl font-semibold" dir="ltr">Margherita</h2>
              <p className="mt-3 text-sm leading-6 text-white/60">{messages.dishDescription}</p>
              <p className="display-latin mt-8 text-3xl font-semibold" dir="ltr">€ 9.50</p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-[var(--line)] p-4">
                <span className="text-2xl">◎</span>
                <p className="mt-5 text-sm font-bold">{messages.clearPrice}</p>
              </div>
              <div className="rounded-3xl bg-[var(--saffron)] p-4">
                <span className="text-2xl">◌</span>
                <p className="mt-5 text-sm font-bold">{messages.visibleAllergens}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-[var(--ink)] py-20 text-[var(--paper-light)]">
        <div className="shell">
          <p className="mb-10 text-sm font-bold text-[var(--saffron)]">{messages.principles}</p>
          <div className="grid gap-px overflow-hidden rounded-[2rem] bg-white/15 md:grid-cols-3">
            {messages.pillars.map((pillar) => (
              <article key={pillar.number} className="min-h-64 bg-[var(--ink)] p-8 transition hover:bg-[#202d25]">
                <span className="display-latin text-sm text-[var(--saffron)]">{pillar.number}</span>
                <h2 className="mt-16 text-2xl font-black">{pillar.title}</h2>
                <p className="mt-4 max-w-xs leading-7 text-white/55">{pillar.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="shell flex flex-col gap-5 py-12 text-sm text-[var(--ink-soft)] sm:flex-row sm:items-center sm:justify-between">
        <p className="display-latin text-lg font-semibold text-[var(--ink)]" dir="ltr">RestaurantOS.</p>
        <p>{messages.footer}</p>
      </footer>
    </main>
  );
}
