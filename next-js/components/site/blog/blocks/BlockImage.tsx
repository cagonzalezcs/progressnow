import { ImageSlot } from "@/components/site/blog/ImageSlot";
import type { PostImage } from "@/lib/schemas";
import { cn } from "@/lib/utils";

/* Single image (openspec gutenberg-post-blocks § image). `breakout` widens
 * past the article measure at lg+: negative margins push 80px past the
 * article on each side, capped so it never overflows the 24px page gutters. */
export function BlockImage({ image, breakout = false }: { image: PostImage; breakout?: boolean }) {
  return (
    <figure
      className={cn(
        "block-image m-0 flex w-full flex-col",
        breakout && "lg:-mx-20 lg:w-[calc(100%+10rem)] lg:max-w-[calc(100vw-3rem)]",
      )}
    >
      <div className="h-[clamp(240px,38vw,440px)] overflow-hidden rounded-[20px] bg-white">
        <ImageSlot
          src={image.src}
          alt={image.alt}
          loading="lazy"
          label="Photo"
          sizes={breakout ? "(min-width: 1140px) 1040px, 100vw" : undefined}
        />
      </div>
      {image.caption || image.credit ? (
        <figcaption className="pt-3 text-[0.9rem] leading-[1.5] text-muted">
          {image.caption}
          {image.credit ? <span> {image.credit}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
