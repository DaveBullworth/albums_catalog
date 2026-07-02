import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { UserTable } from "@/components/admin/user-table";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const ctx = await getAuthContext();
  if (!ctx.isAdmin || !ctx.userId) redirect("/catalog");

  const admin = createAdminClient();
  const { data: profiles } = await admin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });
  const { data: albumRows } = await admin.from("albums").select("user_id");

  const counts = new Map<string, number>();
  for (const row of albumRows ?? []) {
    counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1);
  }
  const users = (profiles ?? []).map((p) => ({
    ...p,
    albumCount: counts.get(p.id) ?? 0,
  }));

  return <UserTable users={users} currentUserId={ctx.userId} />;
}
