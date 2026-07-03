"use client";

import { ExternalLink, Star } from "lucide-react";
import { AlbumCover } from "./album-cover";
import { LikeToggle, FavToggle } from "./rating-toggles";
import { useI18n } from "@/components/providers/i18n-provider";
import type { AlbumWithTracks } from "@/lib/types";

export function AlbumDetail({ album }: { album: AlbumWithTracks }) {
  const { t } = useI18n();
  const accent = album.dominant_color ?? "var(--color-accent)";

  return (
    <div style={{ "--cover": accent } as React.CSSProperties}>
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
        <div className="shrink-0">
          <AlbumCover
            src={album.cover_url}
            alt={`${album.artist} — ${album.name}`}
            color={accent}
            className="w-full rounded-2xl accent-ring sm:w-44"
            sizes="200px"
          />
        </div>
        <div className="min-w-0 flex-1">
          {album.year && (
            <span className="font-mono text-xs accent-text">{album.year}</span>
          )}
          <h3 className="mt-1 font-display text-2xl font-semibold leading-tight text-text">
            {album.name}
          </h3>
          <p className="mt-0.5 text-muted">{album.artist}</p>

          <div className="mt-4 flex items-center gap-2">
            <LikeToggle active={album.liked} title={t("catalog.liked")} />
            <FavToggle active={album.favorite} title={t("catalog.favorite")} />
            {album.spotify_url && (
              <a
                href={album.spotify_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-line bg-white/5 px-3 py-1.5 text-xs font-medium text-muted transition hover:text-text"
              >
                <ExternalLink className="size-3.5" />
                {t("catalog.openSpotify")}
              </a>
            )}
          </div>
        </div>
      </div>

      <section className="mt-5 sm:mt-6">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-dim">
          {t("catalog.tracklist")}
        </h4>
        {album.tracks.length === 0 ? (
          <p className="text-sm text-dim">{t("catalog.noTracks")}</p>
        ) : (
          <ol className="divide-y divide-line/60 overflow-hidden rounded-xl border border-line/60">
            {album.tracks.map((track) => (
              <li
                key={track.id}
                className="group flex items-center gap-3 px-3 py-2 transition hover:bg-white/[0.03] sm:px-3.5 sm:py-2.5"
              >
                <span className="w-5 shrink-0 text-right font-mono text-xs text-dim">
                  {track.position}
                </span>
                {track.spotify_url ? (
                  <a
                    href={track.spotify_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-0 flex-1 truncate text-sm text-text transition group-hover:accent-text"
                  >
                    {track.name}
                  </a>
                ) : (
                  <span className="min-w-0 flex-1 truncate text-sm text-text">
                    {track.name}
                  </span>
                )}
                {track.starred && (
                  <Star
                    className="size-4 shrink-0"
                    fill="var(--color-fav)"
                    stroke="var(--color-fav)"
                  />
                )}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="mt-5 sm:mt-6">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-dim">
          {t("catalog.review")}
        </h4>
        {album.review ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">
            {album.review}
          </p>
        ) : (
          <p className="text-sm text-dim">{t("catalog.noReview")}</p>
        )}
      </section>
    </div>
  );
}
