import { cn } from "@/lib/utils";

/* views/partials/star.twig — inline star art so `fill: currentColor` takes the
 * placement's `text-*` color (an <img> of a currentColor SVG paints black). */
export function StarGlyph({
  kind = "star",
  className = "w-[50px]",
}: {
  kind?: "star" | "star-notch" | "sparkle";
  className?: string;
}) {
  if (kind === "sparkle") {
    return (
      <svg
        aria-hidden="true"
        focusable="false"
        data-testid="star-glyph"
        data-glyph-kind={kind}
        viewBox="0 0 41.72 45.56"
        className={cn(className, "h-auto")}
      >
        <polygon
          fill="currentColor"
          points="25.85 16.6 41.72 23.74 27.94 27.33 22.78 45.56 15.78 30.31 0 38.44 9.45 22.37 3.27 13.79 14.39 13.86 28.2 0 25.85 16.6"
        />
      </svg>
    );
  }
  if (kind === "star-notch") {
    return (
      <svg
        aria-hidden="true"
        focusable="false"
        data-testid="star-glyph"
        data-glyph-kind={kind}
        viewBox="0 0 57.51 74.26"
        className={cn(className, "h-auto")}
      >
        <path
          fill="currentColor"
          d="M55.15,15.92l-13.04,15.8,15.39,26.17c-.36,1.11-19.46-8.38-26.05-11.08l-9.81,27.46-5.9-27.81c-1.08-1.43-15.75-2.83-15.75-2.83l14.46-13.81c.72-3.79.21-30.41.47-29.81l14.1,23.46c.56.51,27.21-8.76,26.12-7.55Z"
        />
      </svg>
    );
  }
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      data-testid="star-glyph"
      data-glyph-kind={kind}
      viewBox="0 0 61.68 70.82"
      className={cn(className, "h-auto")}
    >
      <path
        fill="currentColor"
        d="M61.62,30.6l-18.24,9.31,3.72,30.13c-.77.87-14.53-15.43-19.5-20.52l-19.92,21.3,5.64-27.87c-.42-1.74-13.32-8.86-13.32-8.86l18.75-6.92C20.92,23.99,31.04-.65,31.03.01l3.62,27.13c.31.69,28.45,2.78,26.97,3.46Z"
      />
    </svg>
  );
}
