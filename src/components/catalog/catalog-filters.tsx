"use client";

import {
  useCallback,
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  RotateCcw,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/components/providers/i18n-provider";

/**
 * Two-row layout: search fields + year range on top, toggles and sorting
 * below. Controls flip optimistically; the server re-render runs inside a
 * transition indicated by a slim progress line at the bottom of the block.
 */
export function CatalogFilters() {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Text inputs are genuine local state (typing), applied to the URL after a
  // debounce below.
  const [artist, setArtist] = useState(sp.get("artist") ?? "");
  const [name, setName] = useState(sp.get("name") ?? "");
  const [yearFrom, setYearFrom] = useState(sp.get("yearFrom") ?? "");
  const [yearTo, setYearTo] = useState(sp.get("yearTo") ?? "");

  // Toggles and sorting are the URL itself, wrapped in useOptimistic so they
  // flip instantly and rebase automatically when navigation lands — no local
  // copies, no URL→state sync effect.
  const [liked, setLikedOptimistic] = useOptimistic(sp.get("liked") === "1");
  const [favorite, setFavoriteOptimistic] = useOptimistic(
    sp.get("favorite") === "1",
  );
  const [sort, setSortOptimistic] = useOptimistic(sp.get("sort") ?? "recent");
  const [dir, setDirOptimistic] = useOptimistic(sp.get("dir") ?? "");

  // Latest URL params for the debounced comparison below — a ref so the
  // debounce effect doesn't re-fire (and mis-push) on back/forward.
  const spRef = useRef(sp);
  useEffect(() => {
    spRef.current = sp;
  }, [sp]);

  const apply = useCallback(
    (patch: Record<string, string | null>, optimistic?: () => void) => {
      const params = new URLSearchParams(spRef.current.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v) params.set(k, v);
        else params.delete(k);
      }
      params.delete("page");
      startTransition(() => {
        optimistic?.();
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router],
  );

  // Debounced text inputs. Only navigates when the values actually differ
  // from the URL — this also keeps StrictMode's double effect run from
  // triggering a phantom navigation on mount.
  useEffect(() => {
    const id = setTimeout(() => {
      const cur = spRef.current;
      const unchanged =
        (cur.get("artist") ?? "") === artist &&
        (cur.get("name") ?? "") === name &&
        (cur.get("yearFrom") ?? "") === yearFrom &&
        (cur.get("yearTo") ?? "") === yearTo;
      if (unchanged) return;
      apply({
        artist: artist || null,
        name: name || null,
        yearFrom: yearFrom || null,
        yearTo: yearTo || null,
      });
    }, 350);
    return () => clearTimeout(id);
  }, [artist, name, yearFrom, yearTo, apply]);

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
    startTransition(() => {
      setLikedOptimistic(false);
      setFavoriteOptimistic(false);
      setSortOptimistic("recent");
      setDirOptimistic("");
      router.push(pathname, { scroll: false });
    });
  }

  const DirIcon = effectiveDir === "asc" ? ArrowUpNarrowWide : ArrowDownWideNarrow;

  return (
    <div className="glass relative overflow-hidden rounded-2xl p-3 sm:p-3.5">
      <div className="flex flex-col gap-2.5">
        {/* Row 1 — searches + year range */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[1fr_1fr_auto]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dim" />
            <Input
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder={t("filters.artist")}
              className="h-10 pl-9"
            />
          </label>
          <label className="relative">
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
              onChange={(e) =>
                /^\d{0,4}$/.test(e.target.value) && setYearFrom(e.target.value)
              }
              placeholder={t("filters.yearFrom")}
              inputMode="numeric"
              className="h-10 flex-1 text-center sm:w-16 sm:flex-none"
            />
            <span className="text-dim">–</span>
            <Input
              value={yearTo}
              onChange={(e) =>
                /^\d{0,4}$/.test(e.target.value) && setYearTo(e.target.value)
              }
              placeholder={t("filters.yearTo")}
              inputMode="numeric"
              className="h-10 flex-1 text-center sm:w-16 sm:flex-none"
            />
          </div>
        </div>

        {/* Row 2 — toggles left, sorting right */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5">
          <div className="flex items-center gap-4">
            <Switch
              checked={liked}
              onChange={(v) =>
                apply({ liked: v ? "1" : null }, () => setLikedOptimistic(v))
              }
              label={t("filters.onlyLiked")}
            />
            <Switch
              checked={favorite}
              onChange={(v) =>
                apply({ favorite: v ? "1" : null }, () =>
                  setFavoriteOptimistic(v),
                )
              }
              label={t("filters.onlyFavorites")}
            />
          </div>

          <div className="flex items-center gap-1.5">
            <select
              value={sort}
              onChange={(e) => {
                const v = e.target.value;
                apply({ sort: v === "recent" ? null : v, dir: null }, () => {
                  setSortOptimistic(v);
                  setDirOptimistic("");
                });
              }}
              className="h-9 rounded-xl border border-line bg-bg-2/60 px-2 text-sm text-text outline-none focus:border-accent/60"
            >
              <option value="recent">{t("filters.sortRecent")}</option>
              <option value="year">{t("filters.sortYear")}</option>
              <option value="artist">{t("filters.sortArtist")}</option>
              <option value="name">{t("filters.sortName")}</option>
            </select>
            <button
              onClick={() => {
                const next = effectiveDir === "asc" ? "desc" : "asc";
                apply({ dir: next }, () => setDirOptimistic(next));
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-line bg-bg-2/60 px-2.5 text-sm text-muted transition hover:text-text"
              title={t(effectiveDir === "asc" ? "filters.asc" : "filters.desc")}
            >
              <DirIcon className="size-4" />
              <span className="hidden md:inline">
                {t(effectiveDir === "asc" ? "filters.asc" : "filters.desc")}
              </span>
            </button>
            {hasFilters && (
              <button
                onClick={reset}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-sm text-muted transition hover:text-text"
                title={t("filters.reset")}
              >
                <RotateCcw className="size-4" />
                <span className="hidden md:inline">{t("filters.reset")}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* slim progress line while the server re-renders */}
      {isPending && (
        <div className="absolute inset-x-0 bottom-0 h-0.5">
          <div className="animate-progress h-full w-1/3 bg-gradient-to-r from-transparent via-accent to-transparent" />
        </div>
      )}
    </div>
  );
}
