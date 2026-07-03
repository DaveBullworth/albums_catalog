"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

type Variant = "primary" | "outline" | "ghost" | "danger" | "subtle";
type Size = "sm" | "md" | "lg" | "icon";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-accent text-white shadow-[0_12px_34px_-12px_var(--color-accent)] hover:brightness-110",
  outline:
    "border border-line bg-surface/50 text-text hover:bg-surface-2 hover:border-accent/50",
  ghost: "text-muted hover:text-text hover:bg-white/5",
  danger:
    "bg-danger text-white shadow-[0_12px_34px_-12px_var(--color-danger)] hover:brightness-110",
  subtle: "border border-white/5 bg-white/5 text-text hover:bg-white/10",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
  icon: "size-10 p-0",
};

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
} = {}) {
  return cn(
    "inline-flex select-none items-center justify-center rounded-xl font-medium transition",
    "active:scale-[0.98] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={buttonVariants({ variant, size, className })}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  );
});
