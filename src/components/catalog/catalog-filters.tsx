"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, ArrowDownUp, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

/**
 * All controls keep optimistic local state (they flip instantly) while the
 * server re-render happens inside a transition; a spinner shows while pending.
 */
export function CatalogFilters() {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [artist, setArtist] = useState(sp.get("artist") ?? "");
  const [name, setName] = useState(sp.get("name") ?? "");
  const [yearFrom, setYearFrom] = useState(sp.get("yearFrom") ?? "");
  const [yearTo, setYearTo] = useState(sp.get("yearTo") ?? "");
  const [liked, setLiked] = useState(sp.get("liked") === "1");
  const [favorite, setFavorite] = useState(sp.get("favorite") === "1");
  const [sort, setSort] = useState(sp.get("sort") ?? "recent");
  const [dir, setDir] = useState(sp.get("dir") ?? "");
  const firstRun = useRef(true);

  // Re-sync local state when the URL changes from outside (reset, back/forward).
  useEffect(() => {
    setLiked(sp.get("liked") === "1");
    setFavorite(sp.get("favorite") === "1");
    setSort(sp.get("sort") ?? "recent");
    setDir(sp.get("dir") ?? "");
  }, [sp]);

  const apply = useCallback(
    (patch: Record<string, string | null>) => {
      const params = new URLSearchParams(sp.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v) params.set(k, v);
        else params.delete(k);
      }
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [sp, pathname, router],
  );

  // Debounced text inputs.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const id = setTimeout(() => {
      apply({
        artist: artist || null,
        name: name || null,
        yearFrom: yearFrom || null,
        yearTo: yearTo || null,
      });
    }, 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artist, name, yearFrom, yearTo]);

  const effectiveDir =
    dir || (sort === "artist" || sort === "name" ? "asc" : "desc");
  const hasFilters =
    Boolean(artist || name || yearFrom || yearTo || liked || favorite) ||
    sort !== "recent";

  function reset() {
    setArtist("");
    setName("");
    setYearFrom("");
    setYearTo("");
    setLiked(false);
    setFavorite(false);
    setSort("recent");
    setDir("");
    startTransition(() => router.push(pathname, { scroll: false }));
  }

  return (
    <div className="glass flex flex-wrap items-center gap-2.5 rounded-2xl p-2.5">
      <label className="relative min-w-40 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dim" />
        <Input
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          placeholder={t("filters.artist")}
          className="h-10 pl-9"
        />
      </label>
      <label className="relative min-w-40 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dim" />
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("filters.album")}
          className="h-10 pl-9"
        />
      </label>

      <div className="flex items-center gap-1.5">
        <Input
          value={yearFrom}
          onChange={(e) => /^\d{0,4}$/.test(e.target.value) && setYearFrom(e.target.value)}
          placeholder={t("filters.yearFrom")}
          inputMode="numeric"
          className="h-10 w-16 text-center"
        />
        <span className="text-dim">–</span>
        <Input
          value={yearTo}
          onChange={(e) => /^\d{0,4}$/.test(e.target.value) && setYearTo(e.target.value)}
          placeholder={t("filters.yearTo")}
          inputMode="numeric"
          className="h-10 w-16 text-center"
        />
      </div>

      <div className="flex items-center gap-3 px-1">
        <Switch
          checked={liked}
          onChange={(v) => {
            setLiked(v);
            apply({ liked: v ? "1" : null });
          }}
          label={t("filters.onlyLiked")}
        />
        <Switch
          checked={favorite}
          onChange={(v) => {
            setFavorite(v);
            apply({ favorite: v ? "1" : null });
          }}
          label={t("filters.onlyFavorites")}
        />
      </div>

      <div className="flex items-center gap-1.5">
        <select
          value={sort}
          onChange={(e) => {
            const v = e.target.value;
            setSort(v);
            setDir("");
            apply({ sort: v === "recent" ? null : v, dir: null });
          }}
          className="h-10 rounded-xl border border-line bg-bg-2/60 px-2.5 text-sm text-text outline-none focus:border-accent/60"
        >
          <option value="recent">{t("filters.sortRecent")}</option>
          <option value="year">{t("filters.sortYear")}</option>
          <option value="artist">{t("filters.sortArtist")}</option>
          <option value="name">{t("filters.sortName")}</option>
        </select>
        <button
          onClick={() => {
            const next = effectiveDir === "asc" ? "desc" : "asc";
            setDir(next);
            apply({ dir: next });
          }}
          className="grid size-10 place-items-center rounded-xl border border-line bg-bg-2/60 text-muted transition hover:text-text"
          title={effectiveDir}
          aria-label="Toggle sort direction"
        >
          <ArrowDownUp
            className={cn("size-4 transition", effectiveDir === "asc" && "rotate-180")}
          />
        </button>
      </div>

      {hasFilters && (
        <button
          onClick={reset}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm text-muted transition hover:text-text"
        >
          <RotateCcw className="size-4" />
          {t("filters.reset")}
        </button>
      )}

      {isPending && <Spinner className="size-4 text-accent" />}
    </div>
  );
}
