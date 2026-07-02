import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Album, AlbumWithTracks, CatalogFilters } from "@/lib/types";

export const PAGE_SIZE = 12;

export interface CatalogResult {
  albums: Album[];
  total: number;
  page: number;
  pageCount: number;
}

/**
 * Fetches a page of the catalogue for `userId`. When an admin is impersonating,
 * `userId` is the impersonated user and the is_admin RLS policy permits the read.
 */
export async function getCatalog(
  userId: string,
  f: CatalogFilters,
): Promise<CatalogResult> {
  const supabase = await createClient();
  const page = Math.max(1, f.page ?? 1);

  let q = supabase
    .from("albums")
    .select("*", { count: "exact" })
    .eq("user_id", userId);

  if (f.artist) q = q.ilike("artist", `%${f.artist}%`);
  if (f.name) q = q.ilike("name", `%${f.name}%`);
  if (typeof f.yearFrom === "number") q = q.gte("year", f.yearFrom);
  if (typeof f.yearTo === "number") q = q.lte("year", f.yearTo);
  if (f.liked) q = q.eq("liked", true);
  if (f.favorite) q = q.eq("favorite", true);

  const col =
    f.sort === "year"
      ? "year"
      : f.sort === "artist"
        ? "artist"
        : f.sort === "name"
          ? "name"
          : "created_at";
  const ascending = f.dir
    ? f.dir === "asc"
    : f.sort === "artist" || f.sort === "name";

  q = q.order(col, { ascending, nullsFirst: false });
  if (col !== "created_at") q = q.order("created_at", { ascending: false });

  const from = (page - 1) * PAGE_SIZE;
  q = q.range(from, from + PAGE_SIZE - 1);

  const { data, count } = await q;
  const total = count ?? 0;
  return {
    albums: data ?? [],
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getAlbumWithTracks(
  userId: string,
  id: string,
): Promise<AlbumWithTracks | null> {
  const supabase = await createClient();
  const { data: album } = await supabase
    .from("albums")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  if (!album) return null;

  const { data: tracks } = await supabase
    .from("tracks")
    .select("*")
    .eq("album_id", id)
    .order("position", { ascending: true });

  return { ...album, tracks: tracks ?? [] };
}
