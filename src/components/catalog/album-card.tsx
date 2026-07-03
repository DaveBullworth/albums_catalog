"use client";

import { motion } from "motion/react";
import { Pencil, Trash2 } from "lucide-react";
import { AlbumCover } from "./album-cover";
import { LikeToggle, FavToggle } from "./rating-toggles";
import type { Album } from "@/lib/types";

export function AlbumCard({
  album,
  index = 0,
  canEdit,
  onOpen,
  onEdit,
  onDelete,
  onToggleLike,
  onToggleFav,
}: {
  album: Album;
  index?: number;
  canEdit: boolean;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleLike: () => void;
  onToggleFav: () => void;
}) {
  const accent = album.dominant_color ?? "var(--color-accent)";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index, 11) * 0.03 }}
      className="group relative"
      style={{ "--cover": accent } as React.CSSProperties}
    >
      <div className="panel overflow-hidden rounded-2xl transition duration-300 group-hover:-translate-y-1 group-hover:accent-glow">
        <button onClick={onOpen} className="block w-full text-left">
          <div className="relative">
            <AlbumCover
              src={album.cover_url}
              alt={`${album.artist} — ${album.name}`}
              color={accent}
              priority={index < 4}
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            {album.year && (
              <span className="absolute left-2 top-2 rounded-full bg-black/45 px-2 py-0.5 font-mono text-xs text-white/85 backdrop-blur-sm sm:left-3 sm:top-3">
                {album.year}
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3.5">
              <p className="truncate font-display font-semibold text-white">
                {album.name}
              </p>
              <p className="truncate text-sm text-white/70">{album.artist}</p>
            </div>
          </div>
        </button>

        <div className="flex items-center justify-between gap-2 px-2 py-2 sm:px-3 sm:py-2.5">
          <div className="flex items-center gap-1.5">
            <LikeToggle active={album.liked} onClick={onToggleLike} size="sm" />
            <FavToggle active={album.favorite} onClick={onToggleFav} size="sm" />
          </div>
          {canEdit && (
            <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
              <button
                onClick={onEdit}
                className="grid size-8 place-items-center rounded-full text-muted transition hover:bg-white/8 hover:text-text"
                aria-label="Edit"
              >
                <Pencil className="size-4" />
              </button>
              <button
                onClick={onDelete}
                className="grid size-8 place-items-center rounded-full text-muted transition hover:bg-danger/15 hover:text-danger"
                aria-label="Delete"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
