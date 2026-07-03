"use client";

import { useState, useTransition } from "react";
import { LogIn, Shield, ShieldOff, Trash2, Search } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  startImpersonation,
  setUserRole,
  deleteUserAction,
} from "@/app/(app)/admin/actions";
import type { Profile } from "@/lib/types";

type Row = Profile & { albumCount: number };

export function UserTable({
  users,
  currentUserId,
}: {
  users: Row[];
  currentUserId: string;
}) {
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [pending, start] = useTransition();

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(query.toLowerCase()),
  );

  function changeRole(u: Row) {
    start(async () => {
      const res = await setUserRole(u.id, u.role === "admin" ? "user" : "admin");
      if (res.error) toast({ variant: "error", title: t("toast.error") });
    });
  }

  function confirmDelete() {
    if (!deleting) return;
    const target = deleting;
    setDeleting(null);
    start(async () => {
      const res = await deleteUserAction(target.id);
      if (res.error) toast({ variant: "error", title: t("toast.error") });
    });
  }

  return (
    <div className="glass rounded-3xl p-3.5 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text">
            {t("admin.title")}
          </h1>
          <p className="mt-0.5 text-sm text-muted">{t("admin.subtitle")}</p>
        </div>
        <label className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dim" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("admin.search")}
            className="h-10 pl-9"
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-dim">
              <th className="px-3 py-2 font-medium">{t("admin.user")}</th>
              <th className="px-3 py-2 font-medium">{t("admin.role")}</th>
              <th className="px-3 py-2 font-medium">{t("admin.albums")}</th>
              <th className="px-3 py-2 font-medium">{t("admin.joined")}</th>
              <th className="px-3 py-2 text-right font-medium">
                {t("admin.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-10 text-center text-dim">
                  {t("admin.empty")}
                </td>
              </tr>
            ) : (
              filtered.map((u) => {
                const self = u.id === currentUserId;
                return (
                  <tr
                    key={u.id}
                    className="border-t border-line/60 transition hover:bg-white/[0.02]"
                  >
                    <td className="px-3 py-3">
                      <span className="font-medium text-text">{u.username}</span>
                      {self && (
                        <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">
                          {t("admin.you")}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={
                          u.role === "admin"
                            ? "inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent"
                            : "text-muted"
                        }
                      >
                        {u.role === "admin" && <Shield className="size-3" />}
                        {t(u.role === "admin" ? "admin.admin" : "admin.member")}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-mono text-muted">
                      {u.albumCount}
                    </td>
                    <td className="px-3 py-3 text-muted">
                      {new Date(u.created_at).toLocaleDateString(locale)}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {!self && (
                          <>
                            <form action={startImpersonation.bind(null, u.id)}>
                              <button
                                type="submit"
                                title={t("admin.impersonate")}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface/50 px-2.5 py-1.5 text-xs text-muted transition hover:text-text"
                              >
                                <LogIn className="size-3.5" />
                                <span className="hidden lg:inline">
                                  {t("admin.impersonate")}
                                </span>
                              </button>
                            </form>
                            <button
                              onClick={() => changeRole(u)}
                              disabled={pending}
                              title={t(u.role === "admin" ? "admin.revokeAdmin" : "admin.makeAdmin")}
                              className="grid size-8 place-items-center rounded-lg border border-line bg-surface/50 text-muted transition hover:text-text"
                            >
                              {u.role === "admin" ? (
                                <ShieldOff className="size-3.5" />
                              ) : (
                                <Shield className="size-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => setDeleting(u)}
                              title={t("admin.deleteUser")}
                              className="grid size-8 place-items-center rounded-lg border border-line bg-surface/50 text-muted transition hover:border-danger/40 hover:text-danger"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        size="sm"
        title={t("admin.confirmDeleteTitle")}
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
          {t("admin.confirmDeleteBody", { username: deleting?.username ?? "" })}
        </p>
      </Modal>
    </div>
  );
}
