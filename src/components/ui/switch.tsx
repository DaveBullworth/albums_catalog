"use client";

import { cn } from "@/lib/utils";

export function Switch({
  checked,
  onChange,
  label,
  className,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      <span
        className={cn(
          "relative h-6 w-11 rounded-full border transition-colors",
          checked
            ? "border-accent/60 bg-accent/80"
            : "border-line bg-white/5",
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 size-4 -translate-y-1/2 rounded-full bg-white shadow transition-all",
            checked ? "left-[22px]" : "left-1",
          )}
        />
      </span>
      {label && (
        <span className="text-sm text-muted transition group-hover:text-text">
          {label}
        </span>
      )}
    </button>
  );
}
