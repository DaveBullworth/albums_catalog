"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Sparkles, Heart, Palette, ArrowRight } from "lucide-react";
import { Wordmark, BrandMark } from "@/components/brand";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/components/providers/i18n-provider";

export function Landing() {
  const { t } = useI18n();

  const features = [
    { Icon: Sparkles, title: t("landing.f1Title"), body: t("landing.f1Body") },
    { Icon: Heart, title: t("landing.f2Title"), body: t("landing.f2Body") },
    { Icon: Palette, title: t("landing.f3Title"), body: t("landing.f3Body") },
  ];

  return (
    <div className="relative flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Wordmark />
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link href="/login" className={buttonVariants({ variant: "subtle", size: "sm" })}>
            {t("landing.signIn")}
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 sm:px-8">
        <section className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/5 px-3 py-1 text-xs text-muted">
              <span className="size-1.5 rounded-full bg-accent-2" />
              {t("brand.tagline")}
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-text sm:text-6xl">
              {t("landing.headline")}
              <br />
              <span className="neon-text">{t("landing.headlineAccent")}</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted sm:text-lg">
              {t("landing.sub")}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/register" className={buttonVariants({ size: "lg" })}>
                {t("landing.create")}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/login"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                {t("landing.signIn")}
              </Link>
            </div>
          </motion.div>

          {/* Animated brand visual */}
          <div className="relative mx-auto hidden aspect-square w-full max-w-sm place-items-center lg:grid">
            <motion.div
              className="absolute inset-0 rounded-full border border-accent/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-8 rounded-full border border-dashed border-accent-2/25"
              animate={{ rotate: -360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-20 rounded-full border border-line"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <div
              className="absolute inset-24 rounded-full blur-2xl"
              style={{
                background:
                  "radial-gradient(circle, color-mix(in oklab, var(--color-accent) 60%, transparent), transparent 70%)",
              }}
            />
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <BrandMark className="relative size-28" />
            </motion.div>
          </div>
        </section>

        <section className="grid gap-4 pb-20 sm:grid-cols-3">
          {features.map(({ Icon, title, body }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass rounded-2xl p-5"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-accent/15 text-accent">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-text">
                {title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
            </motion.div>
          ))}
        </section>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-5 pb-8 text-sm text-dim sm:px-8">
        Resonance · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
