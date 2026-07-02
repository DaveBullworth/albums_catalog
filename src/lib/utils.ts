import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-aware className combiner. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Decide whether black or white text reads better on a given hex colour. */
export function readableOn(hex: string): "#000000" | "#ffffff" {
  const c = hex.replace("#", "");
  if (c.length < 6) return "#ffffff";
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  // Perceived luminance (ITU-R BT.601).
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#000000" : "#ffffff";
}

/** Convert a hex colour to an `r g b` triple string for CSS color-mix / alpha. */
export function hexToRgbChannels(hex: string): string {
  const c = hex.replace("#", "");
  if (c.length < 6) return "124 108 255";
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

/** Clamp a string to a max length with an ellipsis. */
export function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}
