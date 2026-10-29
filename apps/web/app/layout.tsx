import "@fontsource-variable/fraunces";
import "@fontsource-variable/vazirmatn";
import type { Metadata, Viewport } from "next";
import { localeDirection } from "../lib/i18n";
import { getCurrentLocale } from "../lib/locale.server";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "RestaurantOS — عملیات رستوران، یکپارچه و روشن",
    template: "%s | RestaurantOS",
  },
  description: "منو، سفارش، آشپزخانه و گزارش فروش در یک جریان عملیاتی قابل اعتماد.",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f3ead8",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getCurrentLocale();

  return (
    <html lang={locale} dir={localeDirection(locale)}>
      <body>{children}</body>
    </html>
  );
}
