import { ImageSlot } from "@/components/site/blog/ImageSlot";
import type { PostImage } from "@/lib/schemas";
import { cn } from "@/lib/utils";

/* In-article photo (openspec progress-now-v4-blog D4). `breakout` pushes 80px
 * past the article on each side at lg+, capped at the page gutters. */
export function BlockImage({ image, breakout }: { image: PostImage; breakout?: boolean }) {
  return (
    <figure
      className={cn(
        "block-image m-0 flex w-full flex-col",
        breakout && "lg:-mx-20 lg:w-[calc(100%+10rem)] lg:max-w-[calc(100vw-3rem)]",
      )}
      data-testid="block-image"
      data-breakout={Boolean(breakout)}
    >
      <div className="h-[clamp(240px,38vw,440px)] overflow-hidden rounded-[20px] bg-white">
        <ImageSlot src={image.src} alt={image.alt} opacity={0.25} loading="lazy" label="Photo" />
      </div>
      {image.caption || image.credit ? (
        <figcaption
          className="pt-3 text-[0.9rem] leading-[1.5] text-muted"
          data-testid="block-image-caption"
        >
          {image.caption}{" "}
          {image.credit ? <span data-testid="block-image-credit">{image.credit}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
