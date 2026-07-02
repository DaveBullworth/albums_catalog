import { getAuthContext } from "@/lib/auth";
import { AccountForm } from "@/components/app/account-form";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const ctx = await getAuthContext();
  return (
    <div className="mx-auto max-w-xl">
      <AccountForm username={ctx.profile?.username ?? ""} />
    </div>
  );
}
