"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { LOCALES } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  return (
    <div className="inline-flex items-center rounded-full border border-line bg-bg-2/60 p-0.5 text-xs">
      {LOCALES.map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={cn(
            "rounded-full px-2.5 py-1 font-semibold uppercase tracking-wide transition",
            locale === l ? "bg-accent text-white" : "text-muted hover:text-text",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
