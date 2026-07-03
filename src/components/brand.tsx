import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="resonance-mark" x1="2" y1="2" x2="30" y2="30">
          <stop offset="0" stopColor="var(--color-accent)" />
          <stop offset="1" stopColor="var(--color-accent-2)" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="14" stroke="url(#resonance-mark)" strokeWidth="1.4" opacity="0.45" />
      <circle cx="16" cy="16" r="9.5" stroke="url(#resonance-mark)" strokeWidth="1.4" opacity="0.7" />
      <circle cx="16" cy="16" r="5" stroke="url(#resonance-mark)" strokeWidth="1.4" />
      <circle cx="16" cy="16" r="2.4" fill="url(#resonance-mark)" />
    </svg>
  );
}

export function Wordmark({
  className,
  markClassName,
}: {
  className?: string;
  markClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark className={cn("size-7", markClassName)} />
      <span className="font-display text-lg font-semibold tracking-tight text-text">
        Resonance
      </span>
    </span>
  );
}
