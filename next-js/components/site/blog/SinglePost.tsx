import { ArrowGlyph } from "@/components/site/ArrowGlyph";
import { CtaCard } from "@/components/site/CtaCard";
import { LinkListCard } from "@/components/site/LinkListCard";
import { PageHeader } from "@/components/site/PageHeader";
import { SiteLink } from "@/components/site/SiteLink";
import { CategoryTag } from "@/components/site/blog/CategoryTag";
import { ImageSlot } from "@/components/site/blog/ImageSlot";
import { PostBlocks } from "@/components/site/blog/PostBlocks";
import { PostCard } from "@/components/site/blog/PostCard";
import { ShareRow } from "@/components/site/blog/ShareRow";
import { authorName, initials, proseAnchors } from "@/lib/post";
import type { BlogPost, SinglePostEnvelope, SiteEnvelope } from "@/lib/schemas";
import { cn } from "@/lib/utils";

/* Single post (Claude Design "Progress Now Blog Post v4" + Tablet/Mobile;
 * openspec progress-now-v4-blog D4). Hero via PageHeader's `post` variant
 * (breadcrumb pill, white category pill, balanced h1, initials byline); the
 * article pulls the featured image 110px (70px on phones) up over the band;
 * sticky sidebar = "On this page" (prose h2 anchors) + Get involved card,
 * honoring the per-post meta-rail toggle; "Read next" cards on the alt band.
 * Twin of views/single.twig / SinglePost.vue. */
export interface SinglePostPageProps {
  post: SinglePostEnvelope;
  readNext: BlogPost[];
  site: SiteEnvelope;
  paths: { home: string; blog: string; calendar: string };
  wpOrigin: string;
}

const ALL_POSTS =
  "items-center gap-4 text-[1.05rem] font-extrabold uppercase tracking-[0.03em] text-accent no-underline hover:underline hover:underline-offset-4";

export function SinglePostPage({ post, readNext, site, paths, wpOrigin }: SinglePostPageProps) {
  const s = site.strings as Record<string, string>;
  const joinUrl = site.chapter.join_url;
  const hasImage = Boolean(post.featuredImage.src);
  const byline = authorName(post);
  const avatar = initials(post);
  const anchors = proseAnchors(post.blocks);
  const rail = post.showMetaRail;
  const cta = {
    title: s.blog_get_involved_h || "Get involved",
    body:
      s.blog_get_involved_p ||
      "Meetings, actions and committees are open to everyone. Come find your place in the work.",
    label: s.cta_join_now || "Join Now",
  };

  return (
    <div data-route-kind="post" className="route-post contents">
      <PageHeader
        title={post.title}
        variant="post"
        pullUp={hasImage}
        crumbs={[
          { label: s.blog_crumb_home || "Home", href: paths.home },
          { label: s.blog_crumb_blog || "Blog", href: paths.blog },
        ]}
        breadcrumbLabel={s.blog_crumb_home ? `${s.blog_crumb_home} › ${post.title}` : undefined}
        before={
          <CategoryTag
            catId={post.cat}
            href={`${paths.blog}?category=${post.cat}`}
            variant="white"
            categories={site.categories}
            wpOrigin={wpOrigin}
          />
        }
        wpOrigin={wpOrigin}
      >
        <div className="flex flex-wrap items-center gap-2.5 text-[0.9rem] font-semibold md:gap-3.5 md:text-base">
          {avatar ? (
            <span
              aria-hidden="true"
              className="inline-flex size-[38px] items-center justify-center rounded-full bg-brand-light text-[0.85rem] font-extrabold text-brand-deep md:size-11 md:text-base"
            >
              {avatar}
            </span>
          ) : null}
          {byline ? (
            <>
              <span>By {byline}</span>
              <span aria-hidden="true">·</span>
            </>
          ) : null}
          <span>
            <time>{post.date}</time>
            <span className="md:hidden"> · {post.readMinutes} min</span>
          </span>
          <span aria-hidden="true" className="hidden md:inline">
            ·
          </span>
          <span className="hidden md:inline">{post.readMinutes} min read</span>
        </div>
      </PageHeader>

      <section className="bg-white px-6 pb-12 md:pb-20" data-tone="white">
        <div
          className={cn(
            "mx-auto grid max-w-[1140px] items-start gap-10 lg:gap-14",
            rail
              ? "lg:[grid-template-columns:minmax(300px,1fr)_280px]"
              : "lg:justify-center lg:[grid-template-columns:minmax(300px,880px)]",
          )}
        >
          <article className={cn("flex min-w-0 flex-col gap-[18px] md:gap-6", !hasImage && "pt-8")}>
            {hasImage ? (
              <figure className="m-0 -mt-[70px] flex flex-col md:-mt-[110px]">
                <div
                  className="aspect-video overflow-hidden rounded-[16px] bg-white shadow-photo md:rounded-[24px]"
                  data-post-hero=""
                >
                  <ImageSlot
                    src={post.featuredImage.src}
                    alt={post.featuredImage.alt}
                    opacity={0.25}
                    loading="eager"
                  />
                </div>
                {post.featuredImage.caption || post.featuredImage.credit ? (
                  <figcaption className="mt-3 text-[0.9rem] leading-[1.5] text-muted">
                    {post.featuredImage.caption}{" "}
                    {post.featuredImage.credit ? <span>{post.featuredImage.credit}</span> : null}
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
              categories={site.categories}
              calendarHref={paths.calendar}
              wpOrigin={wpOrigin}
            />

            <ShareRow
              title={post.title}
              shareLabel={s.blog_share || "Share"}
              copyLabel={s.blog_copy_link || "Copy link"}
              emailLabel={s.blog_email_it || "Email it"}
            />

            {/* Below lg the sidebar stacks under the article: the CTA card follows the share row (Mobile canvas). */}
            {rail && joinUrl ? (
              <div className="mt-2 lg:hidden">
                <CtaCard
                  title={cta.title}
                  body={cta.body}
                  href={joinUrl}
                  label={cta.label}
                  external
                  wpOrigin={wpOrigin}
                />
              </div>
            ) : null}
          </article>

          {rail ? (
            <aside
              aria-label={s.chrome_related || "Post details"}
              className="hidden flex-col gap-6 lg:sticky lg:top-[108px] lg:flex lg:pt-8"
            >
              {anchors.length ? (
                <LinkListCard
                  heading={s.chrome_on_this_page || "On this page"}
                  links={anchors}
                  wpOrigin={wpOrigin}
                />
              ) : null}
              {joinUrl ? (
                <CtaCard
                  title={cta.title}
                  body={cta.body}
                  href={joinUrl}
                  label={cta.label}
                  external
                  wpOrigin={wpOrigin}
                />
              ) : null}
            </aside>
          ) : null}
        </div>
      </section>

      {readNext.length > 0 ? (
        <section className="bg-alt px-6 pb-14 pt-11 md:pb-24 md:pt-16" data-tone="alt">
          <div className="mx-auto flex max-w-[1140px] flex-col gap-[18px] md:gap-7">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h2 className="m-0 font-display text-[1.35rem] font-normal leading-[1.2] md:text-[clamp(1.6rem,2.8vw,2.2rem)] md:leading-[1.1]">
                {s.blog_read_next || "Read next"}
              </h2>
              <SiteLink
                href={paths.blog}
                wpOrigin={wpOrigin}
                className={cn("hidden md:flex", ALL_POSTS)}
              >
                {s.home_blog_all || "All posts"}
                <ArrowGlyph />
              </SiteLink>
            </div>
            <div
              className="flex flex-col gap-3 md:grid md:gap-6 md:[grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]"
              data-read-next=""
            >
              {readNext.map((p) => (
                <PostCard
                  key={p.id}
                  post={p}
                  variant="compact"
                  categories={site.categories}
                  wpOrigin={wpOrigin}
                />
              ))}
            </div>
            <SiteLink
              href={paths.blog}
              wpOrigin={wpOrigin}
              className={cn("flex justify-center md:hidden", ALL_POSTS, "gap-3.5 text-[0.95rem]")}
            >
              {s.home_blog_all || "All posts"}
              <ArrowGlyph className="h-[17px] w-[34px] flex-none fill-accent" />
            </SiteLink>
          </div>
        </section>
      ) : null}
    </div>
  );
}
