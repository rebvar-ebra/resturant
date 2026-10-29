import "@fontsource-variable/fraunces";
import "@fontsource-variable/vazirmatn";
import type { Metadata, Viewport } from "next";
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
