<script setup lang="ts">
/* Single post island (openspec progress-now-v4-blog D4, specs "Post hero" …
 * "Read next"). Hero via PageHeader's `post` variant (breadcrumb, category
 * pill, byline with initials avatar); the article column pulls the duotone
 * featured image 110px up over the band; sticky sidebar = "On this page"
 * (prose h2 anchors) + the Get involved CtaCard, honoring the per-post
 * meta-rail toggle; "Read next" cards on the alt band. views/single.twig
 * mirrors the crawlable shell with the same class recipes. */
import { computed, ref } from "vue";
import CategoryTag from "@/components/site/blog/CategoryTag.vue";
import ImageSlot from "@/components/site/blog/ImageSlot.vue";
import PostBlocks from "@/components/site/blog/PostBlocks.vue";
import PostCard from "@/components/site/blog/PostCard.vue";
import CtaCard from "@/components/site/CtaCard.vue";
import LinkListCard from "@/components/site/LinkListCard.vue";
import PageHeader from "@/components/site/PageHeader.vue";
import { type EventCategory, setCategories } from "@/lib/events";
import type { BlogPost, SinglePostData } from "@/lib/posts";

const props = withDefaults(
  defineProps<{
    post: SinglePostData;
    /** pool the Read Next query draws from (same category, latest 3) */
    posts?: BlogPost[];
    /** WP term-driven categories — replaces the registry palette when provided */
    categories?: EventCategory[];
    /** overrides the post's own byline_mode (per-post ACF select) */
    bylineMode?: "named" | "committee";
    showMetaRail?: boolean;
    blogUrl?: string;
    homeUrl?: string;
    /** Get involved card (chapter join URL + translated copy) */
    joinUrl?: string;
    joinLabel?: string;
    ctaTitle?: string;
    ctaBody?: string;
    /** translated UI strings */
    crumbHome?: string;
    crumbBlog?: string;
    onThisPageLabel?: string;
    shareLabel?: string;
    copyLabel?: string;
    emailLabel?: string;
    readNextLabel?: string;
    allPostsLabel?: string;
  }>(),
  {
    posts: () => [],
    categories: undefined,
    bylineMode: undefined,
    showMetaRail: false,
    blogUrl: "/blog/",
    homeUrl: "/",
    joinUrl: "",
    joinLabel: "Join Now",
    ctaTitle: "Get involved",
    ctaBody: "Meetings, actions and committees are open to everyone. Come find your place in the work.",
    crumbHome: "Home",
    crumbBlog: "Blog",
    onThisPageLabel: "On this page",
    shareLabel: "Share",
    copyLabel: "Copy link",
    emailLabel: "Email it",
    readNextLabel: "Read next",
    allPostsLabel: "All posts",
  },
);

if (props.categories && props.categories.length > 0) setCategories(props.categories);

const mode = computed(() => props.bylineMode ?? props.post.bylineMode);
const isNamed = computed(() => mode.value !== "committee");
const categoryUrl = computed(() => `${props.blogUrl}?category=${props.post.cat}`);

const authorName = computed(() => {
  const name = isNamed.value ? props.post.author : props.post.committee;
  return name ? (isNamed.value ? name : `The ${name}`) : "";
});
/** Two-letter initials for the byline avatar ("Lorem Ipsum" → "LI"). */
const initials = computed(() => {
  const source = isNamed.value ? props.post.author : props.post.committee;
  return source
    .split(/\s+/)
    .filter((w) => w && w !== "Committee")
    .map((w) => w[0]!.toUpperCase())
    .slice(0, 2)
    .join("");
});

const hasFeaturedImage = computed(() => Boolean(props.post.featuredImage.src));

/* "On this page": the prose blocks' h2 anchors (ids are injected at serialize
 * time — inc/blog.php; a slug fallback covers fixtures/mock content). */
const H2 = /<h2(?:\s+id="([^"]*)")?[^>]*>([\s\S]*?)<\/h2>/gi;
const anchors = computed(() => {
  const out: { label: string; href: string }[] = [];
  for (const block of props.post.blocks) {
    if (block.type !== "prose") continue;
    for (const m of block.html.matchAll(H2)) {
      const label = m[2]!.replace(/<[^>]+>/g, "").trim();
      const id =
        m[1] ||
        label
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      if (label && id) out.push({ label, href: `#${id}` });
    }
  }
  return out;
});

/* Read Next: same category, latest 3, excluding current — padded with other
 * recent posts when the category has fewer than 3. */
const readNext = computed(() => {
  const rest = props.posts.filter((p) => !p.featured);
  const sameCat = rest.filter((p) => p.cat === props.post.cat);
  const others = rest.filter((p) => p.cat !== props.post.cat);
  return [...sameCat, ...others].slice(0, 3);
});

/* Copy link w/ "Copied ✓" state */
const copied = ref(false);
let copyTimer: ReturnType<typeof setTimeout> | undefined;
function copyLink() {
  void navigator.clipboard?.writeText(location.href).catch(() => {});
  copied.value = true;
  clearTimeout(copyTimer);
  copyTimer = setTimeout(() => (copied.value = false), 2000);
}
const copyText = computed(() => (copied.value ? "Copied ✓" : props.copyLabel));
const mailShareUrl = computed(
  () => `mailto:?subject=${encodeURIComponent(`${props.post.title}`)}`,
);

const SHARE_PILL =
  "cursor-pointer rounded-full border-2 border-accent bg-transparent px-4 py-2 text-[0.85rem] font-bold text-accent no-underline transition-colors hover:bg-accent hover:text-white md:px-[18px] md:py-[7px] md:text-[0.9rem]";
</script>

<template>
  <div class="single-post">
    <PageHeader
      :title="post.title"
      variant="post"
      :pull-up="hasFeaturedImage"
      :crumbs="[
        { label: crumbHome, href: homeUrl },
        { label: crumbBlog, href: blogUrl },
      ]"
    >
      <template #before>
        <CategoryTag :cat-id="post.cat" :href="categoryUrl" variant="white" />
      </template>
      <div class="flex flex-wrap items-center gap-2.5 text-[0.9rem] font-semibold md:gap-3.5 md:text-base">
        <span v-if="initials" aria-hidden="true" class="inline-flex size-[38px] items-center justify-center rounded-full bg-brand-light text-[0.85rem] font-extrabold text-brand-deep md:size-11 md:text-base">{{ initials }}</span>
        <template v-if="authorName">
          <span>By {{ authorName }}</span>
          <span aria-hidden="true">·</span>
        </template>
        <span>{{ post.date }}<span class="md:hidden"> · {{ post.readMinutes }} min</span></span>
        <span aria-hidden="true" class="hidden md:inline">·</span>
        <span class="hidden md:inline">{{ post.readMinutes }} min read</span>
      </div>
    </PageHeader>

    <!-- Article + sidebar -->
    <section class="bg-white px-6 pb-12 md:pb-20" data-tone="white">
      <div class="mx-auto grid max-w-[1140px] items-start gap-10 lg:gap-14" :class="showMetaRail ? 'lg:[grid-template-columns:minmax(300px,1fr)_280px]' : 'lg:[grid-template-columns:minmax(300px,880px)] lg:justify-center'">
        <article class="flex min-w-0 flex-col gap-[18px] md:gap-6" :class="hasFeaturedImage ? '' : 'pt-8'">
          <!-- Featured image, pulled up over the blue band (D4) -->
          <figure v-if="hasFeaturedImage" class="m-0 -mt-[70px] flex flex-col md:-mt-[110px]">
            <div class="aspect-video overflow-hidden rounded-[16px] bg-white shadow-photo md:rounded-[24px]" data-post-hero>
              <ImageSlot :src="post.featuredImage.src" :alt="post.featuredImage.alt" :opacity="0.25" loading="eager" />
            </div>
            <figcaption v-if="post.featuredImage.caption || post.featuredImage.credit" class="mt-3 text-[0.9rem] leading-[1.5] text-muted">
              {{ post.featuredImage.caption }}
              <span v-if="post.featuredImage.credit" class="text-muted">{{ post.featuredImage.credit }}</span>
            </figcaption>
          </figure>

          <!-- Lede -->
          <p v-if="post.dek" class="m-0 mt-1.5 text-[1.08rem] font-semibold leading-[1.6] text-ink md:mt-2 md:text-[1.22rem] md:leading-[1.65]">{{ post.dek }}</p>

          <!-- post_blocks flexible-content stack -->
          <PostBlocks :blocks="post.blocks" />

          <!-- Share row -->
          <div class="mt-1.5 flex flex-wrap items-center gap-2.5 border-t border-line pt-5 md:mt-2 md:gap-3.5 md:pt-6">
            <span class="text-[0.85rem] font-extrabold uppercase tracking-[0.06em] text-muted md:text-[0.9rem]">{{ shareLabel }}</span>
            <button type="button" :class="SHARE_PILL" @click="copyLink">{{ copyText }}</button>
            <a :href="mailShareUrl" :class="SHARE_PILL">{{ emailLabel }}</a>
          </div>

          <!-- Mobile/tablet Get involved card (the sidebar stacks under the article below lg) -->
          <CtaCard v-if="joinUrl && showMetaRail" class="mt-2 lg:hidden" :title="ctaTitle" :body="ctaBody" :href="joinUrl" :label="joinLabel" external />
        </article>

        <!-- Sticky sidebar (per-post meta-rail toggle) -->
        <aside
          v-if="showMetaRail"
          aria-label="Post details"
          class="hidden flex-col gap-6 lg:sticky lg:top-[calc(108px+var(--wp-admin--admin-bar--height,0px))] lg:flex lg:pt-8"
        >
          <LinkListCard v-if="anchors.length" :heading="onThisPageLabel" :links="anchors" />
          <CtaCard v-if="joinUrl" :title="ctaTitle" :body="ctaBody" :href="joinUrl" :label="joinLabel" external />
        </aside>
      </div>
    </section>

    <!-- Read next (omitted when the pool is empty) -->
    <section v-if="readNext.length > 0" class="bg-alt px-6 pb-14 pt-11 md:pb-24 md:pt-16" data-tone="alt">
      <div class="mx-auto flex max-w-[1140px] flex-col gap-[18px] md:gap-7">
        <div class="flex flex-wrap items-baseline justify-between gap-4">
          <h2 class="m-0 font-display text-[1.35rem] font-normal leading-[1.2] md:text-[clamp(1.6rem,2.8vw,2.2rem)] md:leading-[1.1]">{{ readNextLabel }}</h2>
          <a :href="blogUrl" class="hidden items-center gap-4 text-[1.05rem] font-extrabold uppercase tracking-[0.03em] text-accent no-underline hover:underline hover:underline-offset-4 md:flex">
            {{ allPostsLabel }}
            <svg aria-hidden="true" focusable="false" viewBox="0 0 40 20" class="h-5 w-10 flex-none fill-accent"><path d="M0 8.4h26v3.2H0z" /><path d="M24 1.5 38.5 10 24 18.5Z" /></svg>
          </a>
        </div>
        <div class="flex flex-col gap-3 md:grid md:gap-6 md:[grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
          <PostCard v-for="p in readNext" :key="p.id" :post="p" variant="compact" />
        </div>
        <a :href="blogUrl" class="flex items-center justify-center gap-3.5 text-[0.95rem] font-extrabold uppercase tracking-[0.03em] text-accent no-underline hover:underline hover:underline-offset-4 md:hidden">
          {{ allPostsLabel }}
          <svg aria-hidden="true" focusable="false" viewBox="0 0 40 20" class="h-[17px] w-[34px] flex-none fill-accent"><path d="M0 8.4h26v3.2H0z" /><path d="M24 1.5 38.5 10 24 18.5Z" /></svg>
        </a>
      </div>
    </section>
  </div>
</template>
