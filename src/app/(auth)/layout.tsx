import Link from "next/link";
import { Wordmark } from "@/components/brand";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <header className="flex items-center justify-between p-5 sm:p-7">
        <Link href="/">
          <Wordmark />
        </Link>
        <LanguageSwitcher />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-20">
        {children}
      </main>
    </div>
  );
}
