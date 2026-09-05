/* Photo slot (openspec progress-now-v4-foundation-chrome D4 — treatment
 * retired 2026-09-05: photos render in full color; the `.duotone` wrapper only
 * clips to the slot's radius). The `opacity` prop is kept for markup parity
 * with views/partials/duotone.twig. In-content images keep WordPress' own
 * srcset (design D4); known-size slots may switch to next/image later. */
export interface DuotoneImageProps {
  src: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  srcSet?: string;
  sizes?: string;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  /** Legacy slot opacity — no visual effect since the treatment was retired. */
  opacity?: number;
  /** Classes for the inner <img> (object-fit, sizing). */
  imgClass?: string;
  className?: string;
}

export function DuotoneImage({
  src,
  alt = "",
  width,
  height,
  srcSet,
  sizes,
  loading,
  fetchPriority,
  opacity = 0.3,
  imgClass = "block h-auto w-full",
  className,
}: DuotoneImageProps) {
  return (
    <span
      className={["duotone", className].filter(Boolean).join(" ")}
      style={{ ["--duotone-opacity" as string]: String(opacity) } as React.CSSProperties}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- WordPress-sized srcset; see design D4 */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        srcSet={srcSet}
        sizes={sizes}
        loading={loading}
        fetchPriority={fetchPriority}
        className={imgClass}
      />
    </span>
  );
}
