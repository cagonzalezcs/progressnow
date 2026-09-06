import { ImageSlot } from "@/components/site/blog/ImageSlot";
import type { PostImage } from "@/lib/schemas";
import { cn } from "@/lib/utils";

/* Photo gallery: `essay` leads with one wide frame, `grid` is two-up. */
export function BlockGallery({
  layout,
  images,
}: {
  layout: "essay" | "grid";
  images: PostImage[];
}) {
  return (
    <div
      className="block-gallery grid w-full grid-cols-1 gap-4 sm:grid-cols-2"
      data-testid="block-gallery"
      data-layout={layout}
    >
      {images.map((img, i) => {
        const wide = layout === "essay" && i === 0;
        return (
          <figure
            key={`${img.src ?? "slot"}-${i}`}
            className={cn(
              "m-0 flex flex-col overflow-hidden rounded-[20px] bg-white shadow-gallery",
              wide && "sm:col-span-2",
            )}
            data-testid="block-gallery-item"
            data-item-index={i}
            data-wide={wide}
          >
            <div className={wide ? "h-[clamp(220px,34vw,360px)]" : "h-[clamp(180px,24vw,280px)]"}>
              <ImageSlot
                src={img.src}
                alt={img.alt}
                opacity={0.25}
                loading="lazy"
                label={wide ? "Wide photo" : "Photo"}
              />
            </div>
            {img.caption ? (
              <figcaption
                className="bg-white px-4 py-2.5 text-[0.85rem] text-muted"
                data-testid="block-gallery-caption"
              >
                {img.caption}
              </figcaption>
            ) : null}
          </figure>
        );
      })}
    </div>
  );
}
