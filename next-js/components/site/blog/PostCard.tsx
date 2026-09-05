import { SiteLink } from "@/components/site/SiteLink";
import { CategoryTag } from "@/components/site/blog/CategoryTag";
import { ImageSlot } from "@/components/site/blog/ImageSlot";
import type { BlogPost, EventCategory } from "@/lib/schemas";
import { cn } from "@/lib/utils";

/* Post card (openspec blog-presentation § Post grid and pagination / § Read
 * next). `grid` = browse grid (radius 24, white category pill over the image);
 * `compact` = results / read next (radius 20, brand category text). Below `md`
 * both collapse to the compact 96px row card. */
export function PostCard({
  post,
  variant = "grid",
  readTime = false,
  categories,
  wpOrigin,
}: {
  post: BlogPost;
  variant?: "grid" | "compact";
  readTime?: boolean;
  categories?: EventCategory[] | null;
  wpOrigin: string;
}) {
  const isGrid = variant === "grid";
  const min = post.readMinutes;
  const meta = (isGrid || readTime) && min ? `${post.date} · ${min} min read` : post.date;
  return (
    <SiteLink
      href={post.url}
      wpOrigin={wpOrigin}
      data-blog-link=""
      className={cn(
        "post-card grid overflow-hidden rounded-[16px] bg-white text-ink no-underline shadow-card transition-[box-shadow,transform] duration-150 [grid-template-columns:96px_1fr] hover:-translate-y-0.5 hover:shadow-card-hover-lg md:flex md:flex-1 md:flex-col",
        isGrid ? "md:rounded-[24px]" : "md:rounded-[20px]",
      )}
    >
      <span
        className="relative block min-h-[96px] overflow-hidden md:aspect-video md:min-h-0"
        aria-hidden="true"
        data-post-image=""
      >
        <span className="absolute inset-0">
          <ImageSlot
            src={post.image?.src ?? null}
            alt={post.image?.alt}
            opacity={0}
            loading="lazy"
          />
        </span>
        {isGrid ? (
          <span className="absolute left-3 top-3 hidden md:block">
            <CategoryTag catId={post.cat} variant="white" size="sm" categories={categories} />
          </span>
        ) : null}
      </span>
      <span
        className={cn(
          "flex flex-col justify-center gap-[5px] px-4 py-3 md:justify-start md:gap-2",
          isGrid ? "md:px-6 md:pb-[26px] md:pt-[22px]" : "md:px-[22px] md:pb-6 md:pt-5",
        )}
      >
        <span className={isGrid ? "md:hidden" : "md:text-[0.78rem]"}>
          <CategoryTag catId={post.cat} variant="text" size="sm" categories={categories} />
        </span>
        <span
          className={cn(
            "text-[0.95rem] font-bold leading-[1.3] md:font-extrabold",
            isGrid ? "md:text-[1.12rem]" : "md:text-[1.05rem]",
          )}
        >
          {post.title}
        </span>
        <span
          className={cn(
            "text-[0.8rem] font-semibold text-muted md:text-[0.85rem]",
            isGrid && "md:order-first",
          )}
        >
          <span className="md:hidden">{readTime ? meta : post.date}</span>
          <span className="hidden md:inline">{meta}</span>
        </span>
        {isGrid && post.excerpt ? (
          <span className="hidden text-[0.98rem] leading-[1.55] text-muted md:block">
            {post.excerpt}
          </span>
        ) : null}
      </span>
    </SiteLink>
  );
}
