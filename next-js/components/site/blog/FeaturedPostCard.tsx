import { ArrowGlyph } from "@/components/site/ArrowGlyph";
import { SiteLink } from "@/components/site/SiteLink";
import { ImageSlot } from "@/components/site/blog/ImageSlot";
import type { BlogPost } from "@/lib/schemas";

/* Featured post card (openspec blog-presentation § Featured post card): from
 * `lg` a two-column grid with the brand "Featured" pill; below, a stacked
 * radius-18 card with a 16:9 image. The whole card is the link. */
export function FeaturedPostCard({
  post,
  featuredLabel = "Featured",
  readLabel = "Read the post",
  wpOrigin,
}: {
  post: BlogPost;
  featuredLabel?: string;
  readLabel?: string;
  wpOrigin: string;
}) {
  return (
    <SiteLink
      href={post.url}
      wpOrigin={wpOrigin}
      data-blog-link=""
      data-testid="featured-post-card"
      data-post-slug={post.url}
      className="featured-post-card grid overflow-hidden rounded-[18px] bg-white text-ink no-underline shadow-featured transition-[box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:shadow-card-hover-lg lg:rounded-[24px] lg:[grid-template-columns:minmax(300px,1.2fr)_minmax(280px,1fr)]"
    >
      <span
        className="relative block aspect-video overflow-hidden lg:aspect-auto lg:min-h-[300px]"
        data-post-image=""
        data-testid="featured-post-card-image"
      >
        <span className="absolute inset-0">
          <ImageSlot
            src={post.image?.src ?? null}
            alt={post.image?.alt}
            opacity={0.3}
            loading="eager"
          />
        </span>
        <span
          className="absolute left-3 top-3 rounded-full bg-brand px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.06em] text-white lg:left-4 lg:top-4 lg:px-3.5 lg:py-[5px] lg:text-[0.75rem]"
          data-testid="featured-post-card-badge"
        >
          {featuredLabel}
        </span>
      </span>
      <span className="flex flex-col justify-center gap-2 px-5 pb-[22px] pt-[18px] lg:gap-3 lg:px-10 lg:py-9">
        <span
          className="text-[0.82rem] font-semibold text-muted lg:text-[0.85rem]"
          data-testid="featured-post-card-meta"
        >
          {post.date}
          {post.readMinutes ? ` · ${post.readMinutes} min read` : null}
        </span>
        <span
          className="font-display text-[1.15rem] leading-[1.25] [text-wrap:balance] lg:text-[clamp(1.3rem,2.4vw,1.7rem)] lg:leading-[1.2]"
          data-testid="featured-post-card-title"
        >
          {post.title}
        </span>
        <span
          className="text-[0.95rem] leading-[1.55] text-muted lg:text-[1.05rem] lg:leading-[1.6]"
          data-testid="featured-post-card-dek"
        >
          {post.dek ?? post.excerpt}
        </span>
        <span
          className="mt-1 hidden items-center gap-3 text-[0.95rem] font-extrabold uppercase tracking-[0.03em] text-accent lg:flex"
          data-testid="featured-post-card-read-cta"
        >
          {readLabel}
          <ArrowGlyph className="h-4 w-8 flex-none fill-accent" />
        </span>
      </span>
    </SiteLink>
  );
}
