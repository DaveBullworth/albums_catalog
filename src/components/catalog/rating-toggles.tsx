"use client";

import { Heart, Star } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

function Toggle({
  active,
  onClick,
  Icon,
  color,
  title,
  size = "md",
}: {
  active: boolean;
  onClick?: () => void;
  Icon: typeof Heart;
  color: string;
  title?: string;
  size?: "sm" | "md";
}) {
  const box = size === "sm" ? "size-8" : "size-9";
  const icon = size === "sm" ? "size-4" : "size-[18px]";
  return (
    <motion.button
      type="button"
      title={title}
      onClick={onClick}
      disabled={!onClick}
      whileTap={onClick ? { scale: 0.82 } : undefined}
      className={cn(
        "grid place-items-center rounded-full border transition disabled:cursor-default",
        box,
        active
          ? "border-transparent"
          : "border-white/10 bg-black/20 text-muted hover:text-text",
      )}
      style={
        active
          ? {
              background: `color-mix(in oklab, ${color} 22%, transparent)`,
              color,
              boxShadow: `0 0 18px -4px ${color}`,
            }
          : undefined
      }
    >
      <Icon className={icon} fill={active ? "currentColor" : "none"} strokeWidth={2} />
    </motion.button>
  );
}

export function LikeToggle(props: {
  active: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
  title?: string;
}) {
  return <Toggle {...props} Icon={Heart} color="var(--color-like)" />;
}

export function FavToggle(props: {
  active: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
  title?: string;
}) {
  return <Toggle {...props} Icon={Star} color="var(--color-fav)" />;
}
