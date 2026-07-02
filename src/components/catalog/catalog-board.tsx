"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Disc3 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { AlbumCard } from "./album-card";
import { AlbumDetail } from "./album-detail";
import { AlbumForm } from "./album-form";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useI18n } from "@/components/providers/i18n-provider";
import { useToast } from "@/components/providers/toast-provider";
import {
  loadAlbumAction,
  deleteAlbumAction,
  toggleAlbumFlag,
} from "@/app/(app)/catalog/actions";
import type { Album, AlbumWithTracks } from "@/lib/types";

export function CatalogBoard({
  initialAlbums,
  filtered,
}: {
  initialAlbums: Album[];
  filtered: boolean;
}) {
  const { t } = useI18n();
  const { toast } = useToast();
  const router = useRouter();

  const [albums, setAlbums] = useState(initialAlbums);
  useEffect(() => setAlbums(initialAlbums), [initialAlbums]);

  const [detail, setDetail] = useState<AlbumWithTracks | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AlbumWithTracks | null>(null);
  const [deleting, setDeleting] = useState<Album | null>(null);
  const [, startTx] = useTransition();

  async function openDetail(a: Album) {
    setDetail(null);
    setDetailOpen(true);
    setDetail(await loadAlbumAction(a.id));
  }
  async function openEdit(a: Album) {
    const full = await loadAlbumAction(a.id);
    if (full) {
      setEditing(full);
      setFormOpen(true);
    }
  }
  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }
  function onSaved() {
    setFormOpen(false);
    setEditing(null);
    router.refresh();
  }

  function toggle(a: Album, field: "liked" | "favorite") {
    const value = !a[field];
    setAlbums((prev) =>
      prev.map((x) => (x.id === a.id ? { ...x, [field]: value } : x)),
    );
    startTx(async () => {
      const res = await toggleAlbumFlag(a.id, field, value);
      if (res.error) {
        toast({ variant: "error", title: t("toast.error") });
        setAlbums((prev) =>
          prev.map((x) => (x.id === a.id ? { ...x, [field]: !value } : x)),
        );
      }
    });
  }

  async function confirmDelete() {
    if (!deleting) return;
    const target = deleting;
    setDeleting(null);
    setAlbums((prev) => prev.filter((x) => x.id !== target.id));
    const res = await deleteAlbumAction(target.id);
    if (res.error) {
      toast({ variant: "error", title: t("toast.error") });
    } else {
      toast({
        variant: "success",
        title: t("toast.deleted"),
        body: `${target.artist} — ${target.name}`,
      });
    }
    router.refresh();
  }

  return (
    <>
      {albums.length === 0 ? (
        <div className="glass mt-2 flex flex-col items-center rounded-3xl px-6 py-16 text-center">
          <Disc3 className="size-12 text-dim" />
          <p className="mt-4 text-lg font-medium text-text">
            {filtered ? t("filters.none") : t("catalog.empty")}
          </p>
          {!filtered && (
            <>
              <p className="mt-1 max-w-sm text-sm text-muted">
                {t("catalog.emptyBody")}
              </p>
              <Button onClick={openAdd} className="mt-6">
                <Plus className="size-4" /> {t("catalog.add")}
              </Button>
            </>
          )}
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {albums.map((album, i) => (
              <AlbumCard
                key={album.id}
                album={album}
                index={i}
                canEdit
                onOpen={() => openDetail(album)}
                onEdit={() => openEdit(album)}
                onDelete={() => setDeleting(album)}
                onToggleLike={() => toggle(album, "liked")}
                onToggleFav={() => toggle(album, "favorite")}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Floating add button */}
      <button
        onClick={openAdd}
        className="fixed bottom-6 right-6 z-40 grid size-14 place-items-center rounded-full bg-accent text-white shadow-[0_16px_44px_-10px_var(--color-accent)] transition hover:brightness-110 active:scale-95"
        aria-label={t("catalog.add")}
      >
        <Plus className="size-6" />
      </button>

      {/* Album detail */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} size="lg">
        {detail ? (
          <AlbumDetail album={detail} />
        ) : (
          <div className="grid place-items-center py-20 text-muted">
            <Spinner className="size-6" />
          </div>
        )}
      </Modal>

      {/* Add / edit form */}
      <AlbumForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        initial={editing}
        onSaved={onSaved}
      />

      {/* Delete confirmation */}
      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        size="sm"
        title={t("confirm.deleteAlbumTitle")}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              {t("common.cancel")}
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              {t("common.delete")}
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          {t("confirm.deleteAlbumBody", {
            name: deleting ? `${deleting.artist} — ${deleting.name}` : "",
          })}
        </p>
      </Modal>
    </>
  );
}
