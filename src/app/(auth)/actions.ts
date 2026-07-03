"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { credentialsSchema } from "@/lib/validation";
import { IMPERSONATION_COOKIE } from "@/lib/impersonation";
import { cookies } from "next/headers";

// Supabase Auth needs an email; we mint a stable internal one from the
// username so the UX stays username-only (no real email required).
const EMAIL_DOMAIN = "users.resonance.app";
const toEmail = (username: string) => `${username.toLowerCase()}@${EMAIL_DOMAIN}`;

export type AuthState = { error?: string };

export async function registerAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "generic" };

  const { username, password } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: toEmail(username),
    password,
    options: { data: { username } },
  });

  if (error) {
    if (/already|registered|exists/i.test(error.message)) {
      return { error: "usernameTaken" };
    }
    if (/password/i.test(error.message)) return { error: "weakPassword" };
    return { error: "generic" };
  }

  redirect("/catalog");
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!username || !password) return { error: "invalidCredentials" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: toEmail(username),
    password,
  });

  if (error) return { error: "invalidCredentials" };
  redirect("/catalog");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  (await cookies()).delete(IMPERSONATION_COOKIE);
  redirect("/login");
}
