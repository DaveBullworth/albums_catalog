import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth";
import { Landing } from "@/components/landing";

export default async function Home() {
  const ctx = await getAuthContext();
  if (ctx.userId) redirect("/catalog");
  return <Landing />;
}
