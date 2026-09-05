import { CtaCard } from "@/components/site/CtaCard";
import { LinkListCard } from "@/components/site/LinkListCard";
import { PageHeader } from "@/components/site/PageHeader";
import { SiteLink } from "@/components/site/SiteLink";
import { CategoryTag } from "@/components/site/blog/CategoryTag";
import { ImageSlot } from "@/components/site/blog/ImageSlot";
import { PostBlocks } from "@/components/site/blog/PostBlocks";
import { PostCard } from "@/components/site/blog/PostCard";
import { ShareRow } from "@/components/site/blog/ShareRow";
import { bylineInitials, bylineName, postAnchors, readNextPosts } from "@/lib/post";
import type { BlogPost, EventCategory, SinglePostData } from "@/lib/schemas";
import { cn } from "@/lib/utils";

/* Single post (openspec progress-now-v4-blog D4, specs "Post hero" … "Read
 * next"; twin of views/single.twig and SinglePost.vue). Hero via PageHeader's
 * `post` variant (breadcrumb, category pill, byline with initials avatar); the
 * article column pulls the featured image 110px up over the band; sticky
 * sidebar = "On this page" (prose h2 anchors) + the Get involved CtaCard,
 * honoring the per-post meta-rail toggle; "Read next" cards on the alt band.
 * Server component: the share row, audio and video blocks are the only islands. */
export interface SinglePostLabels {
  crumbHome: string;
  crumbBlog: string;
  breadcrumbLabel: string;
  onThisPageLabel: string;
  shareLabel: string;
  copyLabel: string;
  emailLabel: string;
  readNextLabel: string;
  allPostsLabel: string;
  ctaTitle: string;
  ctaBody: string;
  joinLabel: string;
  postDetailsLabel: string;
}

export const DEFAULT_POST_LABELS: SinglePostLabels = {
  crumbHome: "Home",
  crumbBlog: "Blog",
  breadcrumbLabel: "Breadcrumb",
  onThisPageLabel: "On this page",
  shareLabel: "Share",
  copyLabel: "Copy link",
  emailLabel: "Email it",
  readNextLabel: "Read next",
  allPostsLabel: "All posts",
  ctaTitle: "Get involved",
  ctaBody:
    "Meetings, actions and committees are open to everyone. Come find your place in the work.",
  joinLabel: "Join Now",
  postDetailsLabel: "Post details",
};

const ALL_POSTS_ARROW = (
  <svg
    aria-hidden="true"
    focusable="false"
    viewBox="0 0 40 20"
    className="h-5 w-10 flex-none fill-accent"
  >
    <path d="M0 8.4h26v3.2H0z" />
    <path d="M24 1.5 38.5 10 24 18.5Z" />
  </svg>
);

export function SinglePost({
  post,
  posts = [],
  categories,
  bylineMode,
  showMetaRail = false,
  blogUrl = "/blog/",
  homeUrl = "/",
  calendarUrl = "/calendar/",
  joinUrl = "",
  labels = {},
  wpOrigin,
}: {
  post: SinglePostData;
  /** pool the Read Next query draws from (same category, latest 3) */
  posts?: BlogPost[];
  /** `/site.categories` (WordPress overrides); registry defaults otherwise. */
  categories?: EventCategory[] | null;
  /** overrides the post's own byline_mode (per-post ACF select) */
  bylineMode?: "named" | "committee";
  showMetaRail?: boolean;
  blogUrl?: string;
  homeUrl?: string;
  calendarUrl?: string;
  /** Get involved card (chapter join URL) — omitted when empty */
  joinUrl?: string;
  labels?: Partial<SinglePostLabels>;
  wpOrigin: string;
}) {
  // Routes pass `undefined` for strings WordPress has not translated; keep the defaults for those.
  const L: SinglePostLabels = {
    ...DEFAULT_POST_LABELS,
    ...Object.fromEntries(Object.entries(labels).filter(([, v]) => Boolean(v))),
  };
  const mode = bylineMode ?? post.bylineMode;
  const authorName = bylineName(post, mode);
  const initials = bylineInitials(post, mode);
  const hasFeaturedImage = Boolean(post.featuredImage.src);
  const anchors = postAnchors(post.blocks);
  const readNext = readNextPosts(post, posts);
  const categoryUrl = `${blogUrl}?category=${post.cat}`;

  const cta = joinUrl ? (
    <CtaCard
      title={L.ctaTitle}
      body={L.ctaBody}
      href={joinUrl}
      label={L.joinLabel}
      external
      wpOrigin={wpOrigin}
    />
  ) : null;

  return (
    <div className="single-post contents" data-route-kind="post">
      <PageHeader
        title={post.title}
        variant="post"
        pullUp={hasFeaturedImage}
        breadcrumbLabel={L.breadcrumbLabel}
        crumbs={[
          { label: L.crumbHome, href: homeUrl },
          { label: L.crumbBlog, href: blogUrl },
        ]}
        before={
          <CategoryTag
            catId={post.cat}
            href={categoryUrl}
            variant="white"
            categories={categories}
            wpOrigin={wpOrigin}
          />
        }
        wpOrigin={wpOrigin}
      >
        <div className="flex flex-wrap items-center gap-2.5 text-[0.9rem] font-semibold md:gap-3.5 md:text-base">
          {initials ? (
            <span
              aria-hidden="true"
              className="inline-flex size-[38px] items-center justify-center rounded-full bg-brand-light text-[0.85rem] font-extrabold text-brand-deep md:size-11 md:text-base"
            >
              {initials}
            </span>
          ) : null}
          {authorName ? (
            <>
              <span>By {authorName}</span>
              <span aria-hidden="true">·</span>
            </>
          ) : null}
          <span>
            {post.date}
            <span className="md:hidden"> · {post.readMinutes} min</span>
          </span>
          <span aria-hidden="true" className="hidden md:inline">
            ·
          </span>
          <span className="hidden md:inline">{post.readMinutes} min read</span>
        </div>
      </PageHeader>

      {/* Article + sidebar */}
      <section className="bg-white px-6 pb-12 md:pb-20" data-tone="white">
        <div
          className={cn(
            "mx-auto grid max-w-[1140px] items-start gap-10 lg:gap-14",
            showMetaRail
              ? "lg:[grid-template-columns:minmax(300px,1fr)_280px]"
              : "lg:justify-center lg:[grid-template-columns:minmax(300px,880px)]",
          )}
        >
          <article
            className={cn("flex min-w-0 flex-col gap-[18px] md:gap-6", !hasFeaturedImage && "pt-8")}
          >
            {hasFeaturedImage ? (
              <figure className="m-0 -mt-[70px] flex flex-col md:-mt-[110px]">
                <div
                  className="aspect-video overflow-hidden rounded-[16px] bg-white shadow-photo md:rounded-[24px]"
                  data-post-hero=""
                >
                  <ImageSlot
                    src={post.featuredImage.src}
                    alt={post.featuredImage.alt}
                    priority
                    sizes="(min-width: 1140px) 880px, 100vw"
                  />
                </div>
                {post.featuredImage.caption || post.featuredImage.credit ? (
                  <figcaption className="mt-3 text-[0.9rem] leading-[1.5] text-muted">
                    {post.featuredImage.caption}
                    {post.featuredImage.credit ? <span> {post.featuredImage.credit}</span> : null}
                  </figcaption>
                ) : null}
              </figure>
            ) : null}

            {post.dek ? (
              <p className="m-0 mt-1.5 text-[1.08rem] font-semibold leading-[1.6] text-ink md:mt-2 md:text-[1.22rem] md:leading-[1.65]">
                {post.dek}
              </p>
            ) : null}

            <PostBlocks
              blocks={post.blocks}
              categories={categories}
              calendarUrl={calendarUrl}
              wpOrigin={wpOrigin}
            />

            <ShareRow
              title={post.title}
              shareLabel={L.shareLabel}
              copyLabel={L.copyLabel}
              emailLabel={L.emailLabel}
            />

            {/* Mobile/tablet Get involved card (the sidebar stacks under the article below lg) */}
            {cta && showMetaRail ? <div className="mt-2 lg:hidden">{cta}</div> : null}
          </article>

          {showMetaRail ? (
            <aside
              aria-label={L.postDetailsLabel}
              className="hidden flex-col gap-6 lg:sticky lg:top-[calc(108px+var(--wp-admin--admin-bar--height,0px))] lg:flex lg:pt-8"
            >
              {anchors.length ? (
                <LinkListCard heading={L.onThisPageLabel} links={anchors} wpOrigin={wpOrigin} />
              ) : null}
              {cta}
            </aside>
          ) : null}
        </div>
      </section>

      {readNext.length > 0 ? (
        <section
          className="bg-alt px-6 pb-14 pt-11 md:pb-24 md:pt-16"
          data-tone="alt"
          data-read-next=""
        >
          <div className="mx-auto flex max-w-[1140px] flex-col gap-[18px] md:gap-7">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h2 className="m-0 font-display text-[1.35rem] font-normal leading-[1.2] md:text-[clamp(1.6rem,2.8vw,2.2rem)] md:leading-[1.1]">
                {L.readNextLabel}
              </h2>
              <SiteLink
                href={blogUrl}
                wpOrigin={wpOrigin}
                className="hidden items-center gap-4 text-[1.05rem] font-extrabold uppercase tracking-[0.03em] text-accent no-underline hover:underline hover:underline-offset-4 md:flex"
              >
                {L.allPostsLabel}
                {ALL_POSTS_ARROW}
              </SiteLink>
            </div>
            <div className="flex flex-col gap-3 md:grid md:gap-6 md:[grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
              {readNext.map((p) => (
                <PostCard
                  key={p.id}
                  post={p}
                  variant="compact"
                  categories={categories}
                  wpOrigin={wpOrigin}
                />
              ))}
            </div>
            <SiteLink
              href={blogUrl}
              wpOrigin={wpOrigin}
              className="flex items-center justify-center gap-3.5 text-[0.95rem] font-extrabold uppercase tracking-[0.03em] text-accent no-underline hover:underline hover:underline-offset-4 md:hidden"
            >
              {L.allPostsLabel}
              <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 40 20"
                className="h-[17px] w-[34px] flex-none fill-accent"
              >
                <path d="M0 8.4h26v3.2H0z" />
                <path d="M24 1.5 38.5 10 24 18.5Z" />
              </svg>
            </SiteLink>
          </div>
        </section>
      ) : null}
    </div>
  );
}
