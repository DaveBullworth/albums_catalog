"use client";

import { I18nProvider } from "./i18n-provider";
import { ToastProvider } from "./toast-provider";
import type { Locale } from "@/lib/i18n/dictionaries";

export function Providers({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  return (
    <I18nProvider initialLocale={initialLocale}>
      <ToastProvider>{children}</ToastProvider>
    </I18nProvider>
  );
}
