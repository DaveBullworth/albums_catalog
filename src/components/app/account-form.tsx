"use client";

import { useActionState, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  updateAccountAction,
  deleteAccountAction,
  type AccountState,
} from "@/app/(app)/account/actions";

export function AccountForm({ username }: { username: string }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [state, action, pending] = useActionState<AccountState, FormData>(
    updateAccountAction,
    {},
  );
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (state.ok) toast({ variant: "success", title: t("toast.accountSaved") });
    else if (state.error)
      toast({ variant: "error", title: t("toast.error") });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <div className="flex flex-col gap-6">
      <div className="glass rounded-3xl p-6">
        <h2 className="text-lg font-semibold text-text">{t("account.title")}</h2>
        <p className="mt-0.5 text-sm text-muted">{t("account.subtitle")}</p>
        <form action={action} className="mt-5 flex flex-col gap-4">
          <Field label={t("account.username")} htmlFor="acc-username">
            <Input
              id="acc-username"
              name="username"
              defaultValue={username}
              autoCapitalize="none"
              spellCheck={false}
              placeholder={t("auth.usernamePh")}
            />
          </Field>
          <Field
            label={t("account.newPassword")}
            hint={t("account.newPasswordHint")}
            htmlFor="acc-pass"
          >
            <Input
              id="acc-pass"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              placeholder={t("auth.passwordPh")}
            />
          </Field>
          <div>
            <Button type="submit" loading={pending}>
              {t("account.save")}
            </Button>
          </div>
        </form>
      </div>

      <div className="rounded-3xl border border-danger/25 bg-danger/5 p-6">
        <h2 className="text-lg font-semibold text-danger">
          {t("account.dangerZone")}
        </h2>
        <p className="mt-0.5 text-sm text-muted">{t("account.deleteWarning")}</p>
        <Button variant="danger" className="mt-4" onClick={() => setConfirm(true)}>
          <Trash2 className="size-4" /> {t("account.deleteAccount")}
        </Button>
      </div>

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        size="sm"
        title={t("account.confirmDeleteTitle")}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm(false)}>
              {t("common.cancel")}
            </Button>
            <form action={deleteAccountAction}>
              <Button variant="danger" type="submit">
                {t("account.deleteAccount")}
              </Button>
            </form>
          </>
        }
      >
        <p className="text-sm text-muted">{t("account.confirmDeleteBody")}</p>
      </Modal>
    </div>
  );
}
