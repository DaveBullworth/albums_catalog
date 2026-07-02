import "server-only";
import type { ParsedAlbum } from "@/lib/types";

/** Raised for any Spotify-related failure; message is safe to surface to users. */
export class SpotifyError extends Error {}

// Token is cached per warm server instance (Client Credentials flow).
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.value;

  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) {
    throw new SpotifyError("Spotify is not configured on the server.");
  }

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) throw new SpotifyError("Could not authenticate with Spotify.");
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000 - 60_000, // 1 min safety margin
  };
  return cachedToken.value;
}

/** Pulls the album id out of a URL, URI, or raw id. */
export function extractAlbumId(input: string): string | null {
  const value = input.trim();
  const match = value.match(/album[/:]([a-zA-Z0-9]+)/);
  if (match) return match[1];
  if (/^[a-zA-Z0-9]{22}$/.test(value)) return value;
  return null;
}

interface SpotifyArtist {
  name: string;
}
interface SpotifyTrack {
  name: string;
  track_number?: number;
  external_urls?: { spotify?: string };
}
interface SpotifyAlbumResponse {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  release_date?: string;
  images?: { url: string }[];
  external_urls?: { spotify?: string };
  tracks?: { items: SpotifyTrack[] };
}

/** Fetches and normalises an album from a Spotify link / URI / id. */
export async function fetchSpotifyAlbum(linkOrId: string): Promise<ParsedAlbum> {
  const albumId = extractAlbumId(linkOrId);
  if (!albumId) {
    throw new SpotifyError("That doesn't look like a Spotify album link.");
  }

  const token = await getAccessToken();
  const res = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (res.status === 404) throw new SpotifyError("That album wasn't found on Spotify.");
  if (res.status === 429) throw new SpotifyError("Spotify is rate-limiting us — try again shortly.");
  if (!res.ok) throw new SpotifyError("The Spotify request failed.");

  const data = (await res.json()) as SpotifyAlbumResponse;

  return {
    spotifyId: data.id,
    name: data.name,
    artist: data.artists.map((a) => a.name).join(", "),
    year: data.release_date ? Number(data.release_date.split("-")[0]) || null : null,
    coverUrl: data.images?.[0]?.url ?? null,
    spotifyUrl: data.external_urls?.spotify ?? null,
    tracks: (data.tracks?.items ?? []).map((t, i) => ({
      position: t.track_number ?? i + 1,
      name: t.name,
      spotifyUrl: t.external_urls?.spotify ?? null,
    })),
  };
}
