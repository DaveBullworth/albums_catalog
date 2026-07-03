"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { IMPERSONATION_COOKIE, signImpersonation } from "@/lib/impersonation";

type Result = { ok?: true; error?: string };

async function assertAdmin() {
  const ctx = await getAuthContext();
  if (!ctx.isAdmin || !ctx.userId) throw new Error("forbidden");
  return ctx;
}

export async function startImpersonation(userId: string) {
  const ctx = await assertAdmin();
  if (userId === ctx.userId) return;
  const value = await signImpersonation(userId);
  (await cookies()).set(IMPERSONATION_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  redirect("/catalog");
}

export async function stopImpersonation() {
  (await cookies()).delete(IMPERSONATION_COOKIE);
  redirect("/admin");
}

export async function setUserRole(
  userId: string,
  role: "user" | "admin",
): Promise<Result> {
  const ctx = await assertAdmin();
  if (userId === ctx.userId) return { error: "self" };
  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ role }).eq("id", userId);
  if (error) return { error: "generic" };
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteUserAction(userId: string): Promise<Result> {
  const ctx = await assertAdmin();
  if (userId === ctx.userId) return { error: "self" };
  const admin = createAdminClient();
  // Cascades: auth.users → profiles → albums → tracks.
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { error: "generic" };
  revalidatePath("/admin");
  return { ok: true };
}
