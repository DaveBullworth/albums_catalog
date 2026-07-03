"use client";

import { useI18n } from "@/components/providers/i18n-provider";

export function CatalogHeading({ total }: { total: number }) {
  const { t } = useI18n();
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-text sm:text-3xl">
          {t("catalog.title")}
        </h1>
        <p className="mt-0.5 text-sm text-muted">
          {t(total === 1 ? "catalog.countOne" : "catalog.countMany", {
            count: total,
          })}
        </p>
      </div>
    </div>
  );
}
