import Image from "next/image";
import { cn } from "@/lib/utils";

/* Post/event photo slot (openspec progress-now-v4-blog task 3.2; next-headless-
 * site § Images). A real image renders full-color through next/image in `fill`
 * mode — the parent gives the slot its box (aspect ratio / clamp height) and
 * `sizes` tells the optimizer how wide that box gets. SVG brand art bypasses
 * the optimizer (`dangerouslyAllowSVG` stays off). A null src draws the
 * striped v4 placeholder (decorative). */
export function ImageSlot({
  src = null,
  alt = "",
  label = "",
  loading,
  sizes = "(min-width: 1140px) 880px, 100vw",
  priority = false,
  className,
}: {
  src?: string | null;
  alt?: string;
  label?: string;
  loading?: "lazy" | "eager";
  /** Responsive `sizes` for the optimizer; defaults to the article measure. */
  sizes?: string;
  /** Above-the-fold hero: preload + fetchpriority=high. */
  priority?: boolean;
  /** Legacy duotone opacity — no visual effect since the treatment was retired. */
  opacity?: number;
  className?: string;
}) {
  if (src) {
    return (
      <span className={cn("image-slot duotone relative block size-full", className)}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          loading={priority ? undefined : loading}
          priority={priority}
          unoptimized={/\.svg(\?|#|$)/i.test(src)}
          className="object-cover"
        />
      </span>
    );
  }
  return (
    <div
      aria-hidden="true"
      className={cn(
        "image-slot flex size-full items-center justify-center bg-[repeating-linear-gradient(45deg,var(--color-alt)_0_14px,var(--color-control-faint)_14px_28px)]",
        className,
      )}
    >
      {label ? <span className="font-mono text-[0.78rem] text-muted">{label}</span> : null}
    </div>
  );
}
