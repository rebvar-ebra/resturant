import { cookies } from "next/headers";
import { normalizeLocale, type Locale } from "./i18n";

export const getCurrentLocale = async (): Promise<Locale> => {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get("restaurantos_locale")?.value);
};
