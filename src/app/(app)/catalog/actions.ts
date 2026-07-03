"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthContext } from "@/lib/auth";
import { albumInputSchema, type AlbumInput } from "@/lib/validation";
import { dominantColorFromUrl } from "@/lib/color";
import { fetchSpotifyAlbum, SpotifyError } from "@/lib/spotify";
import { getAlbumWithTracks } from "@/lib/queries";
import type { AlbumWithTracks, ParsedAlbum } from "@/lib/types";

type ActionResult = { ok?: true; id?: string; error?: string };

/**
 * Resolves which user we're writing for and the appropriate client.
 * While impersonating, we use the service-role client (RLS bypass) but always
 * scope writes to the impersonated user's id.
 */
async function resolveTarget() {
  const ctx = await getAuthContext();
  if (!ctx.userId || !ctx.effectiveUserId) {
    throw new Error("unauthorized");
  }
  if (ctx.impersonatedProfile) {
    return { client: createAdminClient(), userId: ctx.effectiveUserId };
  }
  return { client: await createClient(), userId: ctx.userId };
}

/** Loads a single album with its tracks, scoped to the effective user. */
export async function loadAlbumAction(
  id: string,
): Promise<AlbumWithTracks | null> {
  const ctx = await getAuthContext();
  if (!ctx.effectiveUserId) return null;
  return getAlbumWithTracks(ctx.effectiveUserId, id);
}

/** Fetches album data from a Spotify link for the add/import form. */
export async function importFromSpotify(
  link: string,
): Promise<{ album?: ParsedAlbum & { dominantColor: string | null }; error?: string }> {
  try {
    const album = await fetchSpotifyAlbum(link);
    const dominantColor = await dominantColorFromUrl(album.coverUrl);
    return { album: { ...album, dominantColor } };
  } catch (e) {
    return {
      error: e instanceof SpotifyError ? e.message : "Import failed.",
    };
  }
}

export async function createAlbumAction(input: AlbumInput): Promise<ActionResult> {
  const parsed = albumInputSchema.safeParse(input);
  if (!parsed.success) return { error: "validation" };
  const data = parsed.data;

  const { client, userId } = await resolveTarget();

  let dominant = data.dominantColor ?? null;
  if (!dominant && data.coverUrl) {
    dominant = await dominantColorFromUrl(data.coverUrl);
  }

  const { data: album, error } = await client
    .from("albums")
    .insert({
      user_id: userId,
      spotify_id: data.spotifyId ?? null,
      name: data.name,
      artist: data.artist,
      year: data.year ?? null,
      cover_url: data.coverUrl ?? null,
      dominant_color: dominant,
      review: data.review ?? null,
      liked: data.liked,
      favorite: data.favorite,
      spotify_url: data.spotifyUrl ?? null,
    })
    .select("id")
    .single();

  if (error || !album) return { error: "generic" };

  if (data.tracks.length) {
    await client.from("tracks").insert(
      data.tracks.map((tr) => ({
        album_id: album.id,
        position: tr.position,
        name: tr.name,
        spotify_url: tr.spotifyUrl ?? null,
        starred: tr.starred,
      })),
    );
  }

  revalidatePath("/catalog");
  return { ok: true, id: album.id };
}

export async function updateAlbumAction(
  id: string,
  input: AlbumInput,
): Promise<ActionResult> {
  const parsed = albumInputSchema.safeParse(input);
  if (!parsed.success) return { error: "validation" };
  const data = parsed.data;

  const { client, userId } = await resolveTarget();

  let dominant = data.dominantColor ?? null;
  if (!dominant && data.coverUrl) {
    dominant = await dominantColorFromUrl(data.coverUrl);
  }

  const { error } = await client
    .from("albums")
    .update({
      spotify_id: data.spotifyId ?? null,
      name: data.name,
      artist: data.artist,
      year: data.year ?? null,
      cover_url: data.coverUrl ?? null,
      dominant_color: dominant,
      review: data.review ?? null,
      liked: data.liked,
      favorite: data.favorite,
      spotify_url: data.spotifyUrl ?? null,
    })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return { error: "generic" };

  // Tracks are owned by the album: replace them wholesale.
  await client.from("tracks").delete().eq("album_id", id);
  if (data.tracks.length) {
    await client.from("tracks").insert(
      data.tracks.map((tr) => ({
        album_id: id,
        position: tr.position,
        name: tr.name,
        spotify_url: tr.spotifyUrl ?? null,
        starred: tr.starred,
      })),
    );
  }

  revalidatePath("/catalog");
  return { ok: true, id };
}

export async function deleteAlbumAction(id: string): Promise<ActionResult> {
  const { client, userId } = await resolveTarget();
  const { error } = await client
    .from("albums")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) return { error: "generic" };
  revalidatePath("/catalog");
  return { ok: true };
}

export async function toggleAlbumFlag(
  id: string,
  field: "liked" | "favorite",
  value: boolean,
): Promise<ActionResult> {
  const { client, userId } = await resolveTarget();
  const patch =
    field === "liked" ? { liked: value } : { favorite: value };
  const { error } = await client
    .from("albums")
    .update(patch)
    .eq("id", id)
    .eq("user_id", userId);
  if (error) return { error: "generic" };
  revalidatePath("/catalog");
  return { ok: true };
}
