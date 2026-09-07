import { Suspense } from "react";
import { interiorPaths } from "@/components/routes/RoutePage";
import type { RouteProps } from "@/components/routes/types";
import { PageHeader } from "@/components/site/PageHeader";
import { ArchiveFrame } from "@/components/site/blog/ArchiveFrame";
import { EmailSubscribeStrip } from "@/components/site/blog/EmailSubscribeStrip";
import { FeaturedPostCard } from "@/components/site/blog/FeaturedPostCard";
import { Pagination } from "@/components/site/blog/Pagination";
import { PostCard } from "@/components/site/blog/PostCard";
import { isBrowse } from "@/lib/archive-url";
import { categoryById, postCategories } from "@/lib/categories";
import { getPage, getPosts, getRoutes, getSite } from "@/lib/data";
import { getEnv } from "@/lib/env";
import { payloadSlug } from "@/lib/routes";
import type { PostsEnvelope, SiteEnvelope } from "@/lib/schemas";

/* Posts page (+ `/page/N/`, `/category/{slug}/`, `?s=`) — index.twig /
 * archive.twig / search.twig (openspec blog-presentation; next-headless-site
 * § Interactive archive and calendar). Everything is server-rendered: the
 * browse page, filtered results and pagination come from the URL; the client
 * toolbar only writes the URL. */
const STRIPE =
  "flex flex-col items-center gap-1 rounded-[16px] border-2 border-dashed border-border-muted px-6 py-11 text-center md:rounded-[20px] md:px-8 md:py-14";

export async function RoutePostsIndex({ resolved, searchParams }: RouteProps) {
  const [site, manifest, page] = await Promise.all([
    getSite(resolved.lang),
    getRoutes(),
    resolved.route?.kind === "posts_index"
      ? getPage(payloadSlug(resolved.route), resolved.lang)
      : null,
  ]);
  const s = site.strings as Record<string, string>;
  const wpOrigin = getEnv().WP_ORIGIN;
  const paths = interiorPaths(manifest, resolved.lang);
  const basePath = resolved.route?.path ?? resolved.path;
  const categories = postCategories(site.categories);

  // Path-derived state (category archive, /page/N/); query state is read inside Suspense.
  const isSearchPath = resolved.kind === "search";
  const title = isSearchPath
    ? `Search results for ${resolved.search}`
    : resolved.category
      ? categoryById(resolved.category, categories).label
      : page?.title || "From the blog";
  const lede =
    isSearchPath || resolved.category
      ? ""
      : page?.lede ||
        `News, analysis, and dispatches from chapter organizers across ${site.chapter.region_label || "our community"}.`;

  return (
    <div
      data-route-kind={isSearchPath ? "search" : "posts_index"}
      className="route-posts-index contents"
      data-testid="route-posts-index"
    >
      <PageHeader
        title={title}
        lede={lede}
        crumbs={[{ label: s.blog_crumb_home || "Home", href: paths.home }]}
        wide
        wpOrigin={wpOrigin}
      />
      <Suspense
        fallback={
          <div
            aria-hidden="true"
            className="h-40 animate-pulse bg-alt"
            data-testid="archive-fallback"
          />
        }
      >
        <ArchiveWithQuery
          resolved={resolved}
          searchParams={searchParams}
          site={site}
          basePath={basePath}
          wpOrigin={wpOrigin}
        />
      </Suspense>
      {site.chapter.newsletter_url ? (
        <EmailSubscribeStrip
          newsletterUrl={site.chapter.newsletter_url}
          title={s.blog_subscribe_h}
          lede={s.blog_subscribe_p}
          label={s.blog_subscribe_cta}
        />
      ) : null}
    </div>
  );
}

async function ArchiveWithQuery({
  resolved,
  searchParams,
  site,
  basePath,
  wpOrigin,
}: RouteProps & { site: SiteEnvelope; basePath: string; wpOrigin: string }) {
  const query = await searchParams;
  const pick = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
  const s = pick(query.s) || resolved.search;
  const category = pick(query.category) || resolved.category;
  const paged = Number.parseInt(pick(query.paged) || "", 10);
  const page = Number.isFinite(paged) && paged > 1 ? paged : resolved.page;
  const state = { s, category, page };
  const posts = await getPosts({
    lang: resolved.lang,
    s: s || undefined,
    category: category || undefined,
    page,
  });
  const strings = site.strings as Record<string, string>;
  const categories = postCategories(site.categories);

  return (
    <ArchiveFrame
      categories={categories}
      initial={{ s, category: category || "all" }}
      basePath={basePath}
      strings={{
        searchPlaceholder: strings.blog_search ? `${strings.blog_search}…` : "Search posts…",
        searchLabel: strings.blog_search || "Search posts",
        filterLabel: "Filter by category",
        searching: "Searching…",
        clear: "Clear filters",
      }}
    >
      {isBrowse(state) ? (
        <Browse posts={posts} site={site} basePath={basePath} page={page} wpOrigin={wpOrigin} />
      ) : (
        <Filtered posts={posts} site={site} basePath={basePath} state={state} wpOrigin={wpOrigin} />
      )}
    </ArchiveFrame>
  );
}

function Browse({
  posts,
  site,
  basePath,
  page,
  wpOrigin,
}: {
  posts: PostsEnvelope;
  site: SiteEnvelope;
  basePath: string;
  page: number;
  wpOrigin: string;
}) {
  const s = site.strings as Record<string, string>;
  const featured = posts.posts.find((p) => p.featured) ?? posts.posts[0];
  const grid = posts.posts.filter((p) => p.id !== featured?.id);
  if (posts.posts.length === 0) {
    return (
      <section
        className="bg-white px-6 pb-14 pt-6 md:pb-[72px] md:pt-8"
        data-tone="white"
        data-testid="archive-browse-empty-section"
      >
        <div className="mx-auto max-w-[1200px]">
          <div className={STRIPE} data-empty="browse" data-testid="archive-browse-empty">
            <div
              className="text-[1.05rem] font-extrabold md:text-[1.2rem] md:font-bold"
              data-testid="archive-browse-empty-title"
            >
              {s.blog_empty_h || "No posts yet"}
            </div>
            <p
              className="m-0 max-w-[42ch] text-base leading-[1.45] md:text-[1.1rem]"
              data-testid="archive-browse-empty-body"
            >
              {s.blog_empty_p ||
                "The chapter blog is warming up. Check back soon — or subscribe below and we’ll send the first post straight to you."}
            </p>
          </div>
        </div>
      </section>
    );
  }
  return (
    <>
      <section
        className="scroll-mt-20 bg-white px-6 pt-6 md:pt-8"
        data-tone="white"
        data-testid="archive-featured-section"
      >
        <div className="mx-auto max-w-[1200px]">
          {featured ? (
            <FeaturedPostCard
              post={featured}
              featuredLabel={s.blog_featured}
              readLabel={s.home_blog_read}
              wpOrigin={wpOrigin}
            />
          ) : null}
        </div>
      </section>
      <section
        className="bg-white px-6 pb-14 pt-6 md:pb-[72px] md:pt-10"
        data-tone="white"
        data-testid="archive-browse-section"
      >
        <div className="mx-auto flex max-w-[1200px] flex-col">
          <div
            className="flex flex-col gap-3 md:grid md:gap-7 md:[grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]"
            data-archive="browse"
            data-page={page}
            data-testid="archive-browse-grid"
          >
            {grid.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                variant="grid"
                categories={site.categories}
                wpOrigin={wpOrigin}
              />
            ))}
          </div>
          <Pagination base={basePath} state={{}} current={posts.page} total={posts.totalPages} />
        </div>
      </section>
    </>
  );
}

function Filtered({
  posts,
  site,
  basePath,
  state,
  wpOrigin,
}: {
  posts: PostsEnvelope;
  site: SiteEnvelope;
  basePath: string;
  state: { s: string; category: string; page: number };
  wpOrigin: string;
}) {
  const categories = postCategories(site.categories);
  const cat =
    state.category && state.category !== "all"
      ? ` in ${categoryById(state.category, categories).label}`
      : "";
  const line = `${posts.total} ${posts.total === 1 ? "post" : "posts"}${cat}${state.s ? ` matching “${state.s}”` : ""}`;
  return (
    <section
      className="scroll-mt-20 bg-white px-6 pb-14 pt-6 md:pb-[72px] md:pt-8"
      data-tone="white"
      data-testid="archive-filtered-section"
    >
      <div className="mx-auto flex max-w-[1200px] flex-col gap-3.5 md:gap-[18px]">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b-[3px] border-brand pb-2.5 md:gap-4 md:pb-3">
          <div
            role="status"
            className="font-display text-[1.05rem] md:text-[1.3rem]"
            data-results-status=""
            data-testid="archive-results-status"
          >
            {line}
          </div>
        </div>
        {posts.posts.length > 0 ? (
          <div
            className="flex flex-col gap-3 md:grid md:gap-6 md:[grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]"
            data-archive="filtered"
            data-category={state.category || "all"}
            data-search={state.s}
            data-page={state.page}
            data-testid="archive-filtered-grid"
          >
            {posts.posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                variant="compact"
                readTime
                categories={site.categories}
                wpOrigin={wpOrigin}
              />
            ))}
          </div>
        ) : (
          <div className={STRIPE} data-empty="filtered" data-testid="archive-filtered-empty">
            <div
              className="text-[1.05rem] font-extrabold md:text-[1.2rem] md:font-bold"
              data-testid="archive-filtered-empty-title"
            >
              No posts match
            </div>
            <p
              className="m-0 max-w-[42ch] text-base leading-[1.45] md:text-[1.1rem]"
              data-testid="archive-filtered-empty-body"
            >
              Try a different search term or clear the filters.
            </p>
          </div>
        )}
        {posts.posts.length > 0 ? (
          <Pagination
            base={basePath}
            state={{ s: state.s, category: state.category }}
            current={posts.page}
            total={posts.totalPages}
            label="Results pagination"
          />
        ) : null}
      </div>
    </section>
  );
}
