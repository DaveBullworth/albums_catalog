"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";
import { useI18n } from "@/components/providers/i18n-provider";
import {
  loginAction,
  registerAction,
  type AuthState,
} from "@/app/(auth)/actions";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { t } = useI18n();
  const action = mode === "login" ? loginAction : registerAction;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    {},
  );
  const [show, setShow] = useState(false);

  const isRegister = mode === "register";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass w-full max-w-md rounded-3xl p-5 sm:p-9"
    >
      <div className="mb-7 flex flex-col items-center text-center">
        <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-white/5 accent-ring">
          <BrandMark className="size-8" />
        </span>
        <h1 className="text-2xl font-semibold text-text">
          {t(isRegister ? "auth.registerTitle" : "auth.loginTitle")}
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          {t(isRegister ? "auth.registerSubtitle" : "auth.loginSubtitle")}
        </p>
      </div>

      {state.error && (
        <div className="mb-5 rounded-xl border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {t(`auth.${state.error}`)}
        </div>
      )}

      <form action={formAction} className="flex flex-col gap-4">
        <Field
          label={t("auth.username")}
          hint={isRegister ? t("auth.usernameHint") : undefined}
          htmlFor="username"
        >
          <Input
            id="username"
            name="username"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder={t("auth.usernamePh")}
            required
          />
        </Field>

        <Field
          label={t("auth.password")}
          hint={isRegister ? t("auth.passwordHint") : undefined}
          htmlFor="password"
        >
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={show ? "text" : "password"}
              autoComplete={isRegister ? "new-password" : "current-password"}
              placeholder={t("auth.passwordPh")}
              className="pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted transition hover:text-text"
              tabIndex={-1}
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>

        <Button type="submit" loading={pending} className="mt-2 w-full" size="lg">
          {t(isRegister ? "auth.signUp" : "auth.signIn")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {t(isRegister ? "auth.toLogin" : "auth.toRegister")}{" "}
        <Link
          href={isRegister ? "/login" : "/register"}
          className="font-medium accent-text transition hover:brightness-125"
        >
          {t(isRegister ? "auth.toLoginCta" : "auth.toRegisterCta")}
        </Link>
      </p>
    </motion.div>
  );
}
