import type { Metadata } from "next";
import Link from "next/link";
import { MenuExperience } from "../../../components/menu-experience";
import { getPublicMenu } from "../../../lib/menu";

interface PublicMenuPageProps {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = {
  title: "منوی امروز",
  robots: { index: false, follow: false },
};

const MenuUnavailable = () => (
  <main className="shell grid min-h-screen place-items-center py-16">
    <section className="max-w-xl rounded-[2.5rem] border border-[var(--line)] bg-[var(--paper-light)] p-8 text-center shadow-[0_24px_70px_rgba(82,45,19,0.12)] md:p-12">
      <div className="mx-auto grid size-20 place-items-center rounded-full bg-[var(--saffron)] text-3xl" aria-hidden="true">◌</div>
      <h1 className="mt-7 text-3xl font-black">منو فعلاً در دسترس نیست</h1>
      <p className="mt-4 leading-8 text-[var(--ink-soft)]">ممکن است رستوران هنوز منوی امروز را منتشر نکرده باشد. چند لحظه‌ی دیگر دوباره امتحان کنید.</p>
      <Link href="/" className="mt-8 inline-flex min-h-12 items-center rounded-full border border-[var(--ink)] px-6 font-bold transition hover:bg-[var(--ink)] hover:text-[var(--paper-light)]">بازگشت به صفحه اصلی</Link>
    </section>
  </main>
);

export default async function PublicMenuPage({ params }: PublicMenuPageProps) {
  const { slug } = await params;

  try {
    const menu = await getPublicMenu(slug);
    return (
      <main>
        <header className="shell flex min-h-24 items-center justify-between border-b border-[var(--line)]">
          <Link href="/" className="display-latin text-xl font-semibold tracking-[-0.04em]" dir="ltr">RestaurantOS.</Link>
          <span className="rounded-full bg-[var(--sage)] px-4 py-2 text-xs font-bold text-white">منوی فعال</span>
        </header>

        <section className="shell grid gap-8 py-14 md:grid-cols-[1fr_auto] md:items-end md:py-20">
          <div>
            <p className="text-sm font-bold text-[var(--saffron-dark)]">خوش آمدید به</p>
            <h1 className="mt-3 text-[clamp(3rem,10vw,7rem)] font-black leading-none tracking-[-0.065em]">{menu.locationName}</h1>
            <p className="mt-6 max-w-xl leading-8 text-[var(--ink-soft)]">غذای خود را انتخاب کنید؛ قیمت نهایی و آلرژن‌ها پیش از ثبت سفارش همیشه قابل مشاهده‌اند.</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-[var(--ink-soft)]">
            <span className="h-px w-10 bg-[var(--line)]" />
            نسخه منو {menu.menuVersion.toLocaleString("fa-IR")}
          </div>
        </section>

        <MenuExperience menu={menu} />
      </main>
    );
  } catch {
    return <MenuUnavailable />;
  }
}
