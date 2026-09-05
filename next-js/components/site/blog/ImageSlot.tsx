import { DuotoneImage } from "@/components/site/DuotoneImage";

/* Post/event photo slot (openspec progress-now-v4-blog task 3.2). A real image
 * renders full-color inside the shared DuotoneImage wrapper; a null src draws
 * the striped v4 placeholder (decorative). */
export function ImageSlot({
  src = null,
  alt = "",
  label = "",
  opacity = 0,
  loading,
}: {
  src?: string | null;
  alt?: string;
  label?: string;
  opacity?: number;
  loading?: "lazy" | "eager";
}) {
  if (src) {
    return (
      <DuotoneImage
        src={src}
        alt={alt}
        opacity={opacity}
        loading={loading}
        className="image-slot size-full"
        imgClass="block size-full object-cover"
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className="image-slot flex size-full items-center justify-center bg-[repeating-linear-gradient(45deg,var(--color-alt)_0_14px,var(--color-control-faint)_14px_28px)]"
    >
      {label ? <span className="font-mono text-[0.78rem] text-muted">{label}</span> : null}
    </div>
  );
}
