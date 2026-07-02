// Domain & database types for Resonance.

export type Role = "user" | "admin";

// NB: these Row types are declared with `type` (object-literal) rather than
// `interface` on purpose — interfaces lack an implicit index signature and so
// don't satisfy supabase-js's `Record<string, unknown>` constraint, which
// silently collapses query result types to `never`.
export type Profile = {
  id: string;
  username: string;
  role: Role;
  created_at: string;
};

export type Track = {
  id: string;
  album_id: string;
  position: number;
  name: string;
  spotify_url: string | null;
  starred: boolean;
};

export type Album = {
  id: string;
  user_id: string;
  spotify_id: string | null;
  name: string;
  artist: string;
  year: number | null;
  cover_url: string | null;
  dominant_color: string | null;
  review: string | null;
  liked: boolean;
  favorite: boolean;
  spotify_url: string | null;
  created_at: string;
  updated_at: string;
};

export type AlbumWithTracks = Album & {
  tracks: Track[];
};

// Shape returned by the Spotify import endpoint / parser.
export interface ParsedAlbum {
  spotifyId: string;
  name: string;
  artist: string;
  year: number | null;
  coverUrl: string | null;
  spotifyUrl: string | null;
  tracks: { position: number; name: string; spotifyUrl: string | null }[];
}

// Catalogue filters & sorting (mirrors the search UI).
export type SortKey = "recent" | "year" | "artist" | "name";
export type SortDir = "asc" | "desc";

export interface CatalogFilters {
  artist?: string;
  name?: string;
  yearFrom?: number;
  yearTo?: number;
  liked?: boolean;
  favorite?: boolean;
  sort?: SortKey;
  dir?: SortDir;
  page?: number;
}

// Minimal Database generic for the typed supabase-js client.
// The shape must structurally satisfy supabase-js's GenericSchema, so each
// table carries `Relationships` and the schema lists Views/Functions/etc.
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; username: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      albums: {
        Row: Album;
        Insert: Omit<Album, "id" | "created_at" | "updated_at"> &
          Partial<Pick<Album, "id" | "created_at" | "updated_at">>;
        Update: Partial<Album>;
        Relationships: [];
      };
      tracks: {
        Row: Track;
        Insert: Omit<Track, "id"> & Partial<Pick<Track, "id">>;
        Update: Partial<Track>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
