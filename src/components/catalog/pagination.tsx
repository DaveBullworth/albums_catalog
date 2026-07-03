"use client";

import { useOptimistic, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pageCount,
}: {
  page: number;
  pageCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [isPending, startTransition] = useTransition();
  // The highlighted page moves instantly and rebases to the real page once
  // navigation lands — no local state, no effect.
  const [currentPage, setOptimisticPage] = useOptimistic(page);

  if (pageCount <= 1) return null;

  function go(p: number) {
    const params = new URLSearchParams(sp.toString());
    if (p <= 1) params.delete("page");
    else params.set("page", String(p));
    startTransition(() => {
      setOptimisticPage(p);
      router.push(`${pathname}?${params.toString()}`, { scroll: true });
    });
  }

  // Windowed page numbers around the (optimistic) current page.
  const pages: number[] = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(pageCount, start + 4);
  for (let i = Math.max(1, end - 4); i <= end; i++) pages.push(i);

  const btn =
    "grid size-10 place-items-center rounded-xl border text-sm transition disabled:opacity-40";

  return (
    <nav className="flex items-center justify-center gap-1.5 pt-2">
      <button
        onClick={() => go(currentPage - 1)}
        disabled={currentPage <= 1 || isPending}
        className={cn(btn, "border-line bg-surface/50 text-muted hover:text-text")}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => go(p)}
          disabled={isPending}
          className={cn(
            btn,
            p === currentPage
              ? "border-transparent bg-accent font-semibold text-white shadow-[0_8px_24px_-10px_var(--color-accent)]"
              : "border-line bg-surface/50 text-muted hover:text-text",
          )}
        >
          {isPending && p === currentPage ? <Spinner className="size-4" /> : p}
        </button>
      ))}
      <button
        onClick={() => go(currentPage + 1)}
        disabled={currentPage >= pageCount || isPending}
        className={cn(btn, "border-line bg-surface/50 text-muted hover:text-text")}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
