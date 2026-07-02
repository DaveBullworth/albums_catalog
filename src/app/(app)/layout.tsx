import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth";
import { TopNav } from "@/components/app/top-nav";
import { ImpersonationBanner } from "@/components/app/impersonation-banner";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getAuthContext();
  if (!ctx.userId) redirect("/login");

  return (
    <div className="flex min-h-dvh flex-col">
      {ctx.impersonatedProfile && (
        <ImpersonationBanner username={ctx.impersonatedProfile.username} />
      )}
      <TopNav username={ctx.profile?.username ?? ""} isAdmin={ctx.isAdmin} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}
