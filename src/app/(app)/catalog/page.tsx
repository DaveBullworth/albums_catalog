import { getAuthContext } from "@/lib/auth";
import { getCatalog } from "@/lib/queries";
import { CatalogHeading } from "@/components/catalog/catalog-heading";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import { CatalogBoard } from "@/components/catalog/catalog-board";
import { Pagination } from "@/components/catalog/pagination";
import type { CatalogFilters as Filters, SortDir, SortKey } from "@/lib/types";

export const metadata = { title: "Catalogue" };

type SearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}
function toInt(v: string | string[] | undefined): number | undefined {
  const s = first(v);
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const ctx = await getAuthContext();
  const userId = ctx.effectiveUserId!;

  const sortRaw = first(sp.sort);
  const sort: SortKey = (["year", "artist", "name"].includes(sortRaw ?? "")
    ? sortRaw
    : "recent") as SortKey;
  const dirRaw = first(sp.dir);
  const dir: SortDir | undefined =
    dirRaw === "asc" || dirRaw === "desc" ? dirRaw : undefined;

  const filters: Filters = {
    artist: first(sp.artist),
    name: first(sp.name),
    yearFrom: toInt(sp.yearFrom),
    yearTo: toInt(sp.yearTo),
    liked: first(sp.liked) === "1",
    favorite: first(sp.favorite) === "1",
    sort,
    dir,
    page: toInt(sp.page) ?? 1,
  };

  const { albums, total, page, pageCount } = await getCatalog(userId, filters);
  const filtered = Boolean(
    filters.artist ||
      filters.name ||
      filters.yearFrom ||
      filters.yearTo ||
      filters.liked ||
      filters.favorite,
  );

  return (
    <div className="flex flex-col gap-5">
      <CatalogHeading total={total} />
      <CatalogFilters />
      <CatalogBoard initialAlbums={albums} filtered={filtered} />
      <Pagination page={page} pageCount={pageCount} />
    </div>
  );
}
