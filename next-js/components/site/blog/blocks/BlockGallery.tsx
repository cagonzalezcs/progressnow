import { ImageSlot } from "@/components/site/blog/ImageSlot";
import type { PostImage } from "@/lib/schemas";
import { cn } from "@/lib/utils";

/* Gallery (openspec gutenberg-post-blocks § gallery): `essay` leads with one
 * wide photo, `grid` is a plain two-up. Each image is its own <figure> so a
 * caption stays bound to its photo. */
export function BlockGallery({
  layout,
  images,
}: {
  layout: "essay" | "grid";
  images: PostImage[];
}) {
  return (
    <div className="block-gallery grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
      {images.map((img, i) => {
        const wide = layout === "essay" && i === 0;
        return (
          <figure
            key={`${img.src ?? "placeholder"}-${i}`}
            className={cn(
              "m-0 flex flex-col overflow-hidden rounded-[20px] bg-white shadow-gallery",
              wide && "sm:col-span-2",
            )}
          >
            <div className={wide ? "h-[clamp(220px,34vw,360px)]" : "h-[clamp(180px,24vw,280px)]"}>
              <ImageSlot
                src={img.src}
                alt={img.alt}
                loading="lazy"
                label={wide ? "Wide photo" : "Photo"}
                sizes={
                  wide ? "(min-width: 1140px) 880px, 100vw" : "(min-width: 1140px) 432px, 50vw"
                }
              />
            </div>
            {img.caption ? (
              <figcaption className="bg-white px-4 py-2.5 text-[0.85rem] text-muted">
                {img.caption}
              </figcaption>
            ) : null}
          </figure>
        );
      })}
    </div>
  );
}
