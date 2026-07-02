"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus, X, Sparkles, Star } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { LikeToggle, FavToggle } from "./rating-toggles";
import { AlbumCover } from "./album-cover";
import {
  importFromSpotify,
  createAlbumAction,
  updateAlbumAction,
} from "@/app/(app)/catalog/actions";
import type { AlbumInput } from "@/lib/validation";
import type { AlbumWithTracks } from "@/lib/types";

interface TrackState {
  position: number;
  name: string;
  spotifyUrl: string | null;
  starred: boolean;
}
interface FormState {
  name: string;
  artist: string;
  year: string;
  review: string;
  coverUrl: string | null;
  spotifyUrl: string | null;
  spotifyId: string | null;
  dominantColor: string | null;
  liked: boolean;
  favorite: boolean;
  tracks: TrackState[];
}

function buildState(initial?: AlbumWithTracks | null): FormState {
  if (initial) {
    return {
      name: initial.name,
      artist: initial.artist,
      year: initial.year ? String(initial.year) : "",
      review: initial.review ?? "",
      coverUrl: initial.cover_url,
      spotifyUrl: initial.spotify_url,
      spotifyId: initial.spotify_id,
      dominantColor: initial.dominant_color,
      liked: initial.liked,
      favorite: initial.favorite,
      tracks: initial.tracks.map((t) => ({
        position: t.position,
        name: t.name,
        spotifyUrl: t.spotify_url,
        starred: t.starred,
      })),
    };
  }
  return {
    name: "",
    artist: "",
    year: "",
    review: "",
    coverUrl: null,
    spotifyUrl: null,
    spotifyId: null,
    dominantColor: null,
    liked: false,
    favorite: false,
    tracks: [],
  };
}

export function AlbumForm({
  open,
  onClose,
  initial,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  initial?: AlbumWithTracks | null;
  onSaved: () => void;
}) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(() => buildState(initial));
  const [dirty, setDirty] = useState(false);
  const [link, setLink] = useState("");
  const [importing, startImport] = useTransition();
  const [saving, startSave] = useTransition();
  const [confirmClose, setConfirmClose] = useState(false);

  const isEdit = Boolean(initial);
  const accent = form.dominantColor ?? "var(--color-accent)";

  // Reset whenever the modal (re)opens for a different album.
  useEffect(() => {
    if (open) {
      setForm(buildState(initial));
      setDirty(false);
      setLink("");
      setConfirmClose(false);
    }
  }, [open, initial]);

  function patch(p: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...p }));
    setDirty(true);
  }

  function handleImport() {
    if (!link.trim()) {
      toast({ variant: "error", title: t("toast.importFailed"), body: t("toast.importEmpty") });
      return;
    }
    startImport(async () => {
      const res = await importFromSpotify(link.trim());
      if (res.error || !res.album) {
        toast({ variant: "error", title: t("toast.importFailed"), body: res.error });
        return;
      }
      const a = res.album;
      setForm((prev) => ({
        ...prev,
        name: a.name,
        artist: a.artist,
        year: a.year ? String(a.year) : "",
        coverUrl: a.coverUrl,
        spotifyUrl: a.spotifyUrl,
        spotifyId: a.spotifyId,
        dominantColor: a.dominantColor,
        tracks: a.tracks.map((tr) => ({
          position: tr.position,
          name: tr.name,
          spotifyUrl: tr.spotifyUrl,
          starred: false,
        })),
      }));
      setDirty(true);
    });
  }

  function addTrack() {
    patch({
      tracks: [
        ...form.tracks,
        { position: form.tracks.length + 1, name: "", spotifyUrl: null, starred: false },
      ],
    });
  }
  function removeTrack(i: number) {
    patch({
      tracks: form.tracks
        .filter((_, idx) => idx !== i)
        .map((tr, idx) => ({ ...tr, position: idx + 1 })),
    });
  }
  function patchTrack(i: number, p: Partial<TrackState>) {
    patch({
      tracks: form.tracks.map((tr, idx) => (idx === i ? { ...tr, ...p } : tr)),
    });
  }

  function handleSave() {
    if (!form.name.trim() || !form.artist.trim()) {
      toast({ variant: "error", title: t("toast.error"), body: t("form.name") + " / " + t("form.artist") });
      return;
    }
    const input: AlbumInput = {
      name: form.name.trim(),
      artist: form.artist.trim(),
      year: form.year ? Number(form.year) : null,
      review: form.review.trim() || null,
      liked: form.liked,
      favorite: form.favorite,
      coverUrl: form.coverUrl || null,
      spotifyUrl: form.spotifyUrl || null,
      spotifyId: form.spotifyId || null,
      dominantColor: form.dominantColor || null,
      tracks: form.tracks
        .filter((tr) => tr.name.trim())
        .map((tr, i) => ({
          position: i + 1,
          name: tr.name.trim(),
          spotifyUrl: tr.spotifyUrl?.trim() || null,
          starred: tr.starred,
        })),
    };

    startSave(async () => {
      const res = isEdit
        ? await updateAlbumAction(initial!.id, input)
        : await createAlbumAction(input);
      if (res.error) {
        toast({ variant: "error", title: t("toast.error") });
        return;
      }
      toast({
        variant: "success",
        title: t(isEdit ? "toast.updated" : "toast.added"),
        body: `${input.artist} — ${input.name}`,
      });
      onSaved();
    });
  }

  function requestClose() {
    if (dirty) setConfirmClose(true);
    else onClose();
  }

  return (
    <>
      <Modal
        open={open}
        onClose={requestClose}
        size="xl"
        dismissable={false}
        title={t(isEdit ? "form.editTitle" : "form.addTitle")}
        footer={
          <>
            <Button variant="ghost" onClick={requestClose}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {t(isEdit ? "form.save" : "form.create")}
            </Button>
          </>
        }
      >
        <div style={{ "--cover": accent } as React.CSSProperties} className="flex flex-col gap-6">
          {/* Spotify import */}
          <div className="rounded-2xl border border-line/70 bg-bg-2/40 p-4">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-dim">
              <Sparkles className="size-3.5 accent-text" />
              {t("form.importLabel")}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder={t("form.importPlaceholder")}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={handleImport}
                loading={importing}
                className="shrink-0"
              >
                {importing ? t("form.importing") : t("form.import")}
              </Button>
            </div>
          </div>

          {/* Core fields */}
          <div className="grid gap-5 sm:grid-cols-[11rem_1fr]">
            {/* stretch the cover to the full height of the fields column */}
            <div className="relative sm:self-stretch">
              <AlbumCover
                src={form.coverUrl}
                alt={form.name || "?"}
                color={accent}
                className="w-full rounded-xl accent-ring sm:absolute sm:inset-0 sm:aspect-auto sm:h-full"
                sizes="220px"
              />
            </div>
            <div className="flex flex-col gap-4">
              <Field label={t("form.name")} htmlFor="f-name">
                <Input
                  id="f-name"
                  value={form.name}
                  maxLength={200}
                  placeholder={t("form.namePh")}
                  onChange={(e) => patch({ name: e.target.value })}
                />
              </Field>
              <div className="grid grid-cols-[1fr_auto] gap-3">
                <Field label={t("form.artist")} htmlFor="f-artist">
                  <Input
                    id="f-artist"
                    value={form.artist}
                    maxLength={200}
                    placeholder={t("form.artistPh")}
                    onChange={(e) => patch({ artist: e.target.value })}
                  />
                </Field>
                <Field label={t("form.year")} htmlFor="f-year" className="w-24">
                  <Input
                    id="f-year"
                    value={form.year}
                    inputMode="numeric"
                    maxLength={4}
                    placeholder={t("form.yearPh")}
                    className="text-center"
                    onChange={(e) =>
                      /^\d{0,4}$/.test(e.target.value) && patch({ year: e.target.value })
                    }
                  />
                </Field>
              </div>
              <div className="flex items-center gap-5">
                {/* toggle and its text label are sibling buttons — a button
                    must never nest another button (hydration error) */}
                <div className="flex items-center gap-2">
                  <LikeToggle
                    active={form.liked}
                    onClick={() => patch({ liked: !form.liked })}
                    size="sm"
                  />
                  <button
                    type="button"
                    onClick={() => patch({ liked: !form.liked })}
                    className="text-sm text-muted transition hover:text-text"
                  >
                    {t("form.liked")}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <FavToggle
                    active={form.favorite}
                    onClick={() => patch({ favorite: !form.favorite })}
                    size="sm"
                  />
                  <button
                    type="button"
                    onClick={() => patch({ favorite: !form.favorite })}
                    className="text-sm text-muted transition hover:text-text"
                  >
                    {t("form.favorite")}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <Field label={t("form.spotifyUrl")} htmlFor="f-spotify">
            <Input
              id="f-spotify"
              value={form.spotifyUrl ?? ""}
              onChange={(e) => patch({ spotifyUrl: e.target.value })}
              placeholder="https://open.spotify.com/album/…"
            />
          </Field>

          <Field label={t("form.review")} htmlFor="f-review">
            <Textarea
              id="f-review"
              value={form.review}
              maxLength={2000}
              rows={4}
              placeholder={t("form.reviewPh")}
              onChange={(e) => patch({ review: e.target.value })}
            />
          </Field>

          {/* Tracks */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-dim">
                {t("form.tracks")}
              </p>
              <Button variant="subtle" size="sm" onClick={addTrack}>
                <Plus className="size-4" /> {t("form.addTrack")}
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              {form.tracks.map((track, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-6 shrink-0 text-right font-mono text-xs text-dim">
                    {i + 1}
                  </span>
                  <Input
                    value={track.name}
                    onChange={(e) => patchTrack(i, { name: e.target.value })}
                    placeholder={t("form.trackName")}
                    className="h-10 flex-1"
                  />
                  <Input
                    value={track.spotifyUrl ?? ""}
                    onChange={(e) => patchTrack(i, { spotifyUrl: e.target.value })}
                    placeholder={t("form.trackLink")}
                    className="hidden h-10 w-44 sm:block"
                  />
                  <button
                    type="button"
                    onClick={() => patchTrack(i, { starred: !track.starred })}
                    className="grid size-9 shrink-0 place-items-center rounded-full border border-line transition hover:bg-white/5"
                    style={track.starred ? { color: "var(--color-fav)" } : undefined}
                    aria-label="Star track"
                  >
                    <Star
                      className="size-4"
                      fill={track.starred ? "currentColor" : "none"}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeTrack(i)}
                    className="grid size-9 shrink-0 place-items-center rounded-full text-muted transition hover:bg-danger/15 hover:text-danger"
                    aria-label="Remove track"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Unsaved-changes guard */}
      <Modal
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
        size="sm"
        title={t("form.unsavedTitle")}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmClose(false)}>
              {t("form.keepEditing")}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setConfirmClose(false);
                onClose();
              }}
            >
              {t("form.discard")}
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">{t("form.unsavedBody")}</p>
      </Modal>
    </>
  );
}
