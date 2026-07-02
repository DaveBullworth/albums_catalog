import "server-only";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { IMPERSONATION_COOKIE, verifyImpersonation } from "@/lib/impersonation";
import type { Profile } from "@/lib/types";

export interface AuthContext {
  /** The real, signed-in user. */
  userId: string | null;
  profile: Profile | null;
  isAdmin: boolean;
  /** Set when an admin is impersonating someone else. */
  impersonatedProfile: Profile | null;
  /** Whose catalogue we are actually operating on. */
  effectiveUserId: string | null;
}

const EMPTY: AuthContext = {
  userId: null,
  profile: null,
  isAdmin: false,
  impersonatedProfile: null,
  effectiveUserId: null,
};

/**
 * Resolves the current request's auth context, including any active admin
 * impersonation. Use `effectiveUserId` for catalogue queries.
 */
export async function getAuthContext(): Promise<AuthContext> {
  const supabase = await createClient();

  let user = null;
  try {
    ({
      data: { user },
    } = await supabase.auth.getUser());
  } catch {
    // Supabase unreachable / misconfigured — treat as signed out.
    return EMPTY;
  }
  if (!user) return EMPTY;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";
  let impersonatedProfile: Profile | null = null;

  if (isAdmin) {
    const raw = (await cookies()).get(IMPERSONATION_COOKIE)?.value;
    const targetId = raw ? await verifyImpersonation(raw) : null;
    if (targetId && targetId !== user.id) {
      const admin = createAdminClient();
      const { data: target } = await admin
        .from("profiles")
        .select("*")
        .eq("id", targetId)
        .single();
      if (target) impersonatedProfile = target as Profile;
    }
  }

  return {
    userId: user.id,
    profile: profile ?? null,
    isAdmin,
    impersonatedProfile,
    effectiveUserId: impersonatedProfile?.id ?? user.id,
  };
}

/** Throws (via redirect-friendly null) unless the caller is an admin. */
export async function requireAdmin(): Promise<AuthContext> {
  const ctx = await getAuthContext();
  return ctx;
}
