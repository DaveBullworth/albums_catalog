"use client";

import { useTransition } from "react";
import { Eye, X } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { stopImpersonation } from "@/app/(app)/admin/actions";

export function ImpersonationBanner({ username }: { username: string }) {
  const { t } = useI18n();
  const [pending, start] = useTransition();

  return (
    <div className="sticky top-0 z-40 flex items-center justify-center gap-3 bg-warning/15 px-4 py-2 text-sm text-warning backdrop-blur-sm">
      <Eye className="size-4 shrink-0" />
      <span className="truncate font-medium">
        {t("impersonation.banner", { username })}
      </span>
      <button
        onClick={() => start(() => void stopImpersonation())}
        disabled={pending}
        className="inline-flex items-center gap-1 rounded-full bg-warning/20 px-2.5 py-0.5 text-xs font-semibold transition hover:bg-warning/30"
      >
        <X className="size-3.5" /> {t("impersonation.exit")}
      </button>
    </div>
  );
}
