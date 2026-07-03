"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthContext } from "@/lib/auth";
import { usernameSchema, passwordSchema } from "@/lib/validation";

const EMAIL_DOMAIN = "users.resonance.app";
const toEmail = (u: string) => `${u.toLowerCase()}@${EMAIL_DOMAIN}`;

export type AccountState = { ok?: boolean; error?: string };

export async function updateAccountAction(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const ctx = await getAuthContext();
  if (!ctx.userId) return { error: "generic" };

  const username = String(formData.get("username") ?? "").trim();
  const newPassword = String(formData.get("newPassword") ?? "");
  const supabase = await createClient();

  if (username && username !== ctx.profile?.username) {
    if (!usernameSchema.safeParse(username).success) return { error: "username" };
    const admin = createAdminClient();
    const { data: existing } = await admin
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();
    if (existing && existing.id !== ctx.userId) return { error: "usernameTaken" };

    const { error: authErr } = await admin.auth.admin.updateUserById(ctx.userId, {
      email: toEmail(username),
      user_metadata: { username },
      email_confirm: true,
    });
    if (authErr) return { error: "generic" };
    await admin.from("profiles").update({ username }).eq("id", ctx.userId);
  }

  if (newPassword) {
    if (!passwordSchema.safeParse(newPassword).success) return { error: "password" };
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { error: "generic" };
  }

  revalidatePath("/account");
  return { ok: true };
}

export async function deleteAccountAction() {
  const ctx = await getAuthContext();
  if (!ctx.userId) return;
  const admin = createAdminClient();
  await admin.auth.admin.deleteUser(ctx.userId);
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/register");
}
