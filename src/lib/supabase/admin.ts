import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

/**
 * Service-role Supabase client — bypasses RLS.
 * SERVER ONLY. Used for admin operations (listing every user, managing
 * accounts) and for reading a user's catalogue while impersonating them.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
