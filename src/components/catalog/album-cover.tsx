import Image from "next/image";
import { cn } from "@/lib/utils";

export function AlbumCover({
  src,
  alt,
  color,
  sizes = "(max-width:768px) 50vw, 320px",
  className,
  priority,
}: {
  src?: string | null;
  alt: string;
  color?: string | null;
  sizes?: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={cn("relative aspect-square overflow-hidden bg-bg-2", className)}
      style={
        color
          ? { background: `linear-gradient(140deg, ${color}, #0a0c14 70%)` }
          : undefined
      }
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <div className="grid h-full place-items-center font-display text-3xl font-semibold text-white/75">
          {alt.slice(0, 1).toUpperCase()}
        </div>
      )}
    </div>
  );
}
