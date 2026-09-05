<script setup lang="ts">
import { computed } from "vue";
import BlogArchive from "@/components/site/blog/BlogArchive.vue";
import FeaturedPostCard from "@/components/site/blog/FeaturedPostCard.vue";
import PostCard from "@/components/site/blog/PostCard.vue";
import PageHeader from "@/components/site/PageHeader.vue";
import { fetchPage, fetchPosts } from "@/lib/api";
import { pageKey, postsKey } from "@/lib/chapter/keys";
import { frontRoute, type ResolvedRoute } from "@/lib/chapter/routes";
import { postCategoryById } from "@/lib/posts";
import {
  payloadSlug,
  provideRouteLanguages,
  useChapterApi,
  useChapterData,
  useChapterRoutes,
  useChapterSite,
  useRouteSeo,
} from "@/composables/useChapter";
import type { PageEnvelope, PostsEnvelope } from "@/lib/schemas";

/* Posts page (+ `/page/N/`, `/category/{slug}/`, `?s=` search) — views/
 * index.twig, archive.twig, search.twig. The first browse page is embedded
 * (`posts:{lang}`, prerendered); every interaction (search/filter/page) is
 * fetched by the BlogArchive island from REST, debounced + abortable, and
 * mirrored into the URL through the router-backed url-state adapter. */
const props = defineProps<{ resolved: ResolvedRoute }>();

const lang = computed(() => props.resolved.lang);
const api = useChapterApi();
const { data: site } = await useChapterSite(lang.value);

const route = props.resolved.route;
const isSearch = props.resolved.kind === "search";
const serverPage = props.resolved.page;
const isDefaultBrowse = !isSearch && props.resolved.category === "" && serverPage === 1;

/* Header copy comes from the posts page itself (title + Interior lede). */
const pageData =
  route && route.kind === "posts_index"
    ? await useChapterData<PageEnvelope>(pageKey(lang.value, payloadSlug(route)), () =>
        fetchPage(api, payloadSlug(route), lang.value),
      )
    : null;
const page = computed(() => pageData?.data.value ?? null);

/* Browse data: page 1 is the shared `posts:{lang}` payload; `/page/N/` gets
 * its own (non-prerendered → REST). Search/filter states leave it to the island. */
const postsData = isSearch
  ? null
  : await useChapterData<PostsEnvelope>(
      postsKey(lang.value, serverPage, props.resolved.category),
      () =>
        fetchPosts(api, {
          lang: lang.value,
          page: serverPage,
          category: props.resolved.category || undefined,
        }),
    );
const posts = computed(() => postsData?.data.value ?? null);

provideRouteLanguages(computed(() => page.value?.languages ?? site.value?.languages));
useRouteSeo(
  computed(() => {
    const seo = page.value?.seo;
    if (!seo) return undefined;
    // Search/filter/paged states are noindex today (inc/seo.php); keep parity.
    return isDefaultBrowse ? seo : { ...seo, robots: "noindex,follow" as const };
  }),
  lang,
);

const routes = useChapterRoutes();
const home = computed(() => frontRoute(routes.value, lang.value)?.path ?? "/");
const basePath = computed(() => route?.path ?? props.resolved.path);

const title = computed(() => {
  if (isSearch) return `Search results for ${props.resolved.search}`;
  if (props.resolved.category) return postCategoryById(props.resolved.category).label;
  return page.value?.title || "From the blog";
});
const lede = computed(() =>
  isSearch || props.resolved.category
    ? ""
    : page.value?.lede ||
      `News, analysis, and dispatches from chapter organizers across ${site.value?.chapter.region_label ?? "our community"}.`,
);

/* Translated UI strings (Polylang) with English fallbacks for the mock site. */
const strings = computed(() => ({
  blog_crumb_home: site.value?.strings.blog_crumb_home || "Home",
  blog_featured: site.value?.strings.blog_featured || "Featured",
  home_blog_read: site.value?.strings.home_blog_read || "Read the post",
  blog_subscribe_h: site.value?.strings.blog_subscribe_h || "Never miss a post",
  blog_subscribe_p: site.value?.strings.blog_subscribe_p || "One email when we publish. No spam, no lists sold — ever.",
  blog_subscribe_cta: site.value?.strings.blog_subscribe_cta || "Subscribe",
}));

const fallbackFeatured = computed(() => {
  const list = posts.value?.posts ?? [];
  return list.find((p) => p.featured) ?? list[0];
});
const fallbackGrid = computed(() =>
  (posts.value?.posts ?? []).filter((p) => p.id !== fallbackFeatured.value?.id),
);

const pagination = computed(() => {
  const env = posts.value;
  if (!env || env.totalPages <= 1) return undefined;
  const out: { newerUrl?: string; olderUrl?: string } = {};
  if (env.page > 1) out.newerUrl = env.page === 2 ? basePath.value : `${basePath.value}page/${env.page - 1}/`;
  if (env.page < env.totalPages) out.olderUrl = `${basePath.value}page/${env.page + 1}/`;
  return out;
});
</script>

<template>
  <div class="route-posts-index contents">
    <PageHeader :title="title" :lede="lede" :crumbs="[{ label: strings.blog_crumb_home, href: home }]" wide />
    <ClientOnly>
      <BlogArchive
        :initial-posts="posts?.posts ?? []"
        :initial-total="posts?.total ?? 0"
        :api-base="api"
        :lang="lang"
        :categories="site?.categories"
        :pagination="pagination"
        :show-subscribe="true"
        :newsletter-url="site?.chapter.newsletter_url || undefined"
        :subscribe-title="strings.blog_subscribe_h"
        :subscribe-lede="strings.blog_subscribe_p"
        :subscribe-label="strings.blog_subscribe_cta"
      />
      <template #fallback>
        <!-- Prerendered/crawlable fallback: the first browse page as v4 cards
             (index.twig does the same inside the island mount). -->
        <section class="bg-white px-6 pb-14 pt-6 md:pb-[72px] md:pt-8" data-tone="white">
          <div class="mx-auto flex max-w-[1200px] flex-col gap-6">
            <FeaturedPostCard v-if="fallbackFeatured" :post="fallbackFeatured" :featured-label="strings.blog_featured" :read-label="strings.home_blog_read" />
            <div class="flex flex-col gap-3 md:grid md:gap-7 md:[grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
              <PostCard v-for="p in fallbackGrid" :key="p.id" :post="p" variant="grid" />
            </div>
            <nav v-if="pagination" class="flex justify-center gap-4" aria-label="Pagination">
              <a v-if="pagination.newerUrl" :href="pagination.newerUrl" class="font-extrabold text-ink no-underline hover:underline">← Prev</a>
              <a v-if="pagination.olderUrl" :href="pagination.olderUrl" class="font-extrabold text-ink no-underline hover:underline">Next →</a>
            </nav>
          </div>
        </section>
      </template>
    </ClientOnly>
  </div>
</template>
