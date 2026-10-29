export type Locale = "fa" | "de";

export const normalizeLocale = (value: string | undefined): Locale =>
  value === "de" ? "de" : "fa";

export const localeDirection = (locale: Locale): "rtl" | "ltr" =>
  locale === "fa" ? "rtl" : "ltr";

export const localeTag = (locale: Locale): "fa-IR" | "de-DE" =>
  locale === "fa" ? "fa-IR" : "de-DE";

export const homeMessages = {
  fa: {
    demoMenu: "مشاهده منوی نمونه",
    eyebrow: "سیستم عملیاتی برای رستوران‌های مستقل",
    headline: "هر سفارش،",
    headlineAccent: "سر جای خودش.",
    intro: "منو، سفارش، آشپزخانه و فروش را از لحظه‌ی انتخاب مشتری تا پایان شیفت در یک جریان روشن نگه دارید.",
    enterMenu: "ورود به منوی مشتری",
    release: "نسخه‌ی اولیه · Catalog Slice",
    branch: "شعبه میته",
    todayMenu: "منوی امروز",
    kitchenPick: "پیشنهاد آشپزخانه",
    dishDescription: "خمیر تازه، گوجه، موزارلا و ریحان",
    clearPrice: "قیمت نهایی روشن",
    visibleAllergens: "آلرژن قابل مشاهده",
    principles: "سه اصل محصول",
    footer: "ساخته‌شده برای شیفت‌های واقعی، نه داشبوردهای نمایشی.",
    pillars: [
      { number: "۰۱", title: "یک صف سفارش", text: "سالن، QR و بیرون‌بر در یک جریان مشترک و قابل پیگیری." },
      { number: "۰۲", title: "آشپزخانه هم‌زمان", text: "تیکت روشن، تغییر وضعیت سریع و تاریخچه‌ای که گم نمی‌شود." },
      { number: "۰۳", title: "فروش قابل تطبیق", text: "قیمت نهایی، پرداخت و گزارش شعبه با مرجع مشخص." },
    ],
  },
  de: {
    demoMenu: "Demo-Menü ansehen",
    eyebrow: "Das Betriebssystem für unabhängige Restaurants",
    headline: "Jede Bestellung.",
    headlineAccent: "Genau am richtigen Platz.",
    intro: "Menü, Bestellungen, Küche und Umsatz bleiben vom ersten Klick bis zum Schichtende in einem klaren Ablauf.",
    enterMenu: "Zum Gästemenü",
    release: "Erste Version · Catalog Slice",
    branch: "Standort Mitte",
    todayMenu: "Heutiges Menü",
    kitchenPick: "Empfehlung der Küche",
    dishDescription: "Frischer Teig, Tomate, Mozzarella und Basilikum",
    clearPrice: "Endpreis auf einen Blick",
    visibleAllergens: "Allergene klar sichtbar",
    principles: "Drei Produktprinzipien",
    footer: "Für echte Schichten gebaut – nicht für Demo-Dashboards.",
    pillars: [
      { number: "01", title: "Eine Bestellwarteschlange", text: "Service, QR und Abholung in einem gemeinsamen, nachvollziehbaren Ablauf." },
      { number: "02", title: "Küche in Echtzeit", text: "Klare Tickets, schnelle Statuswechsel und eine lückenlose Historie." },
      { number: "03", title: "Abgleichbarer Umsatz", text: "Endpreise, Zahlungen und Standortberichte mit eindeutiger Referenz." },
    ],
  },
} as const;

export const menuMessages = {
  fa: {
    pageTitle: "منوی امروز",
    activeMenu: "منوی فعال",
    welcome: "خوش آمدید به",
    intro: "غذای خود را انتخاب کنید؛ قیمت نهایی و آلرژن‌ها پیش از ثبت سفارش همیشه قابل مشاهده‌اند.",
    menuVersion: "نسخه منو",
    categories: "دسته‌های منو",
    fallbackDescription: "با مواد تازه و آماده‌سازی روزانه‌ی آشپزخانه.",
    allergens: "آلرژن‌ها",
    add: "افزودن",
    addToCart: "افزودن به سبد",
    increase: "افزایش",
    decrease: "کاهش",
    quantity: "تعداد",
    cart: "سبد سفارش",
    checkoutSoon: "ثبت نهایی سفارش — به‌زودی",
    added: "به سبد اضافه شد.",
    decreased: "کم شد.",
    unavailableTitle: "منو فعلاً در دسترس نیست",
    unavailableText: "ممکن است رستوران هنوز منوی امروز را منتشر نکرده باشد. چند لحظه‌ی دیگر دوباره امتحان کنید.",
    backHome: "بازگشت به صفحه اصلی",
    allergensMap: { gluten: "گلوتن", milk: "لبنیات", eggs: "تخم‌مرغ", nuts: "آجیل", peanuts: "بادام‌زمینی", soy: "سویا" },
  },
  de: {
    pageTitle: "Heutiges Menü",
    activeMenu: "Menü aktiv",
    welcome: "Willkommen bei",
    intro: "Wählen Sie Ihr Essen aus. Endpreise und Allergene sind vor der Bestellung immer sichtbar.",
    menuVersion: "Menüversion",
    categories: "Menükategorien",
    fallbackDescription: "Mit frischen Zutaten und täglich in unserer Küche zubereitet.",
    allergens: "Allergene",
    add: "Hinzufügen",
    addToCart: "Zum Warenkorb hinzufügen",
    increase: "Mehr",
    decrease: "Weniger",
    quantity: "Anzahl",
    cart: "Warenkorb",
    checkoutSoon: "Bestellung abschließen — demnächst",
    added: "wurde zum Warenkorb hinzugefügt.",
    decreased: "wurde reduziert.",
    unavailableTitle: "Das Menü ist gerade nicht verfügbar",
    unavailableText: "Vielleicht wurde das heutige Menü noch nicht veröffentlicht. Bitte versuchen Sie es in wenigen Augenblicken erneut.",
    backHome: "Zur Startseite",
    allergensMap: { gluten: "Gluten", milk: "Milch", eggs: "Eier", nuts: "Schalenfrüchte", peanuts: "Erdnüsse", soy: "Soja" },
  },
} as const;
