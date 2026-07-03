"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, Shield, User as UserIcon, Library } from "lucide-react";
import { Wordmark } from "@/components/brand";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useI18n } from "@/components/providers/i18n-provider";
import { logoutAction } from "@/app/(auth)/actions";
import { cn } from "@/lib/utils";

export function TopNav({
  username,
  isAdmin,
}: {
  username: string;
  isAdmin: boolean;
}) {
  const { t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const links = [
    { href: "/catalog", label: t("nav.catalog"), Icon: Library },
    ...(isAdmin ? [{ href: "/admin", label: t("nav.admin"), Icon: Shield }] : []),
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-line/60 bg-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/catalog">
            <Wordmark />
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {links.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition",
                  pathname.startsWith(href)
                    ? "bg-white/8 text-text"
                    : "text-muted hover:text-text",
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <div ref={ref} className="relative">
            <button
              onClick={() => setOpen((o) => !o)}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/50 py-1.5 pl-1.5 pr-2.5 text-sm transition hover:bg-surface-2"
            >
              <span className="grid size-7 place-items-center rounded-full bg-accent/20 text-accent">
                <UserIcon className="size-4" />
              </span>
              <span className="hidden max-w-28 truncate font-medium text-text sm:block">
                {username}
              </span>
              <ChevronDown className="size-4 text-muted" />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
                <div className="border-b border-line/70 px-4 py-3">
                  <p className="truncate text-sm font-medium text-text">{username}</p>
                </div>
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted transition hover:bg-white/5 hover:text-text"
                >
                  <UserIcon className="size-4" /> {t("nav.account")}
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted transition hover:bg-white/5 hover:text-text sm:hidden"
                  >
                    <Shield className="size-4" /> {t("nav.admin")}
                  </Link>
                )}
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-danger transition hover:bg-danger/10"
                  >
                    <LogOut className="size-4" /> {t("nav.signOut")}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
