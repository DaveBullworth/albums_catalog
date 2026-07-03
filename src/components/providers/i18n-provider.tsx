"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  dictionaries,
  DEFAULT_LOCALE,
  type Locale,
} from "@/lib/i18n/dictionaries";

type Vars = Record<string, string | number>;

interface I18nValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string, vars?: Vars) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

function resolve(source: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>((acc, key) => (acc as Record<string, unknown>)?.[key], source);
}

export function I18nProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    const stored = (typeof window !== "undefined" &&
      (localStorage.getItem("locale") as Locale | null)) as Locale | null;
    if (stored && stored !== locale && dictionaries[stored]) {
      setLocaleState(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem("locale", next);
    document.cookie = `locale=${next};path=/;max-age=31536000;samesite=lax`;
  }, []);

  const t = useCallback(
    (path: string, vars?: Vars) => {
      let value =
        resolve(dictionaries[locale], path) ??
        resolve(dictionaries[DEFAULT_LOCALE], path);
      if (typeof value !== "string") return path;
      if (vars) {
        for (const [key, v] of Object.entries(vars)) {
          value = (value as string).replaceAll(`{${key}}`, String(v));
        }
      }
      return value as string;
    },
    [locale],
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within <I18nProvider>");
  return ctx;
}
