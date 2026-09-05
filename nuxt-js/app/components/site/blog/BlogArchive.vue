<script setup lang="ts">
/* Blog archive island (openspec progress-now-v4-blog D3, specs "Blog
 * toolbar" … "Blog subscribe strip"). Presentation only changed in v4: URL
 * state, debounced abortable fetches and the browse/filter split are the
 * island-data-fetch contract. Browse mode (no query, "All") = featured card
 * + auto-fill grid + round pagination, on any page; a query or category
 * swaps in the filtered results section. */
import { useDebounceFn } from "@vueuse/core";
import { computed, nextTick, onMounted, ref, watch } from "vue";
import EmailSubscribeStrip from "@/components/site/blog/EmailSubscribeStrip.vue";
import FeaturedPostCard from "@/components/site/blog/FeaturedPostCard.vue";
import PostCard from "@/components/site/blog/PostCard.vue";
import { fetchPosts, isAbortError } from "@/lib/api";
import { type EventCategory, setCategories } from "@/lib/events";
import { POST_CATEGORIES, postCategoryById } from "@/lib/posts";
import type { BlogPost, PostsEnvelope } from "@/lib/schemas";
import { currentPathname, currentSearch, replaceSearch } from "@/lib/url-state";

const props = withDefaults(
  defineProps<{
    /** server-rendered first browse page (no fetch, no flash) */
    initialPosts: BlogPost[];
    /** honest corpus size for the browse/empty state */
    initialTotal: number;
    /** progressnow/v1 base URL */
    apiBase: string;
    /** Polylang language slug of the page; scopes fetched posts to it */
    lang?: string;
    /** WP term-driven categories — replaces the registry palette */
    categories?: EventCategory[];
    /** server-paged archive URLs (crawl path; island intercepts clicks) */
    pagination?: { newerUrl?: string; olderUrl?: string };
    showSubscribe?: boolean;
    /** Action Network newsletter form URL (from Chapter Settings) */
    newsletterUrl?: string;
    /** subscribe strip copy (translated by the caller) */
    subscribeTitle?: string;
    subscribeLede?: string;
    subscribeLabel?: string;
  }>(),
  {
    categories: undefined,
    pagination: undefined,
    showSubscribe: true,
    newsletterUrl: undefined,
    subscribeTitle: undefined,
    subscribeLede: undefined,
    subscribeLabel: undefined,
  },
);

if (props.categories && props.categories.length > 0) setCategories(props.categories);

/* ---- state (search + filter + page survive reload via URL params) ---- */
const initialParams = new URLSearchParams(currentSearch());
const initialCat = initialParams.get("category");

const query = ref(initialParams.get("s") ?? "");
const activeCat = ref(
  POST_CATEGORIES.some((c) => c.id === initialCat && c.id !== "all")
    ? (initialCat as string)
    : "all",
);
const page = ref(Math.max(1, Number.parseInt(initialParams.get("paged") ?? "1", 10) || 1));

watch([query, activeCat, page], () => {
  const params = new URLSearchParams(currentSearch());
  if (query.value.trim() === "") params.delete("s");
  else params.set("s", query.value.trim());
  if (activeCat.value === "all") params.delete("category");
  else params.set("category", activeCat.value);
  if (page.value <= 1) params.delete("paged");
  else params.set("paged", String(page.value));
  replaceSearch(params);
});

/* ---- server fetch (island-data-fetch): debounced, abortable, honest ---- */
const isDefaultState = computed(
  () => query.value.trim() === "" && activeCat.value === "all" && page.value === 1,
);

const fetched = ref<PostsEnvelope | null>(null);
const loading = ref(false);
const failed = ref(false);
let controller: AbortController | null = null;

async function runFetch() {
  controller?.abort();
  const ctl = new AbortController();
  controller = ctl;
  loading.value = true;
  failed.value = false;
  try {
    const envelope = await fetchPosts(
      props.apiBase,
      { s: query.value, category: activeCat.value, page: page.value, lang: props.lang },
      ctl.signal,
    );
    if (ctl !== controller) return;
    fetched.value = envelope;
  } catch (err) {
    if (isAbortError(err) || ctl !== controller) return;
    failed.value = true;
  } finally {
    if (ctl === controller) loading.value = false;
  }
}

function syncState() {
  if (isDefaultState.value) {
    // Back to the embedded browse page — no fetch needed.
    controller?.abort();
    fetched.value = null;
    loading.value = false;
    failed.value = false;
    return;
  }
  void runFetch();
}

const debouncedSync = useDebounceFn(syncState, 300);

watch(query, () => {
  page.value = 1;
  debouncedSync();
});
watch(activeCat, () => {
  page.value = 1;
  syncState();
});

/* Page changes scroll to the top of the featured/results section, offset for
 * the sticky header (D3). */
const resultsTop = ref<HTMLElement | null>(null);
watch(page, () => {
  syncState();
  void nextTick(() => {
    const el = resultsTop.value;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  });
});

onMounted(() => {
  // A shared/reloaded URL with filters fetches that exact state instead of
  // trusting the embedded browse props.
  if (!isDefaultState.value) void runFetch();
});

/* ---- browse vs filter layout ---- */
const isBrowsing = computed(() => query.value.trim() === "" && activeCat.value === "all");

const results = computed(() => fetched.value?.posts ?? []);
const total = computed(() => fetched.value?.total ?? 0);

/* Browse page count: page 1 is the embedded envelope (per-page size = its
 * length); later pages carry their own totals. */
const totalPages = computed(() => {
  if (fetched.value) return fetched.value.totalPages;
  const perPage = props.initialPosts.length;
  return perPage > 0 ? Math.max(1, Math.ceil(props.initialTotal / perPage)) : 1;
});
const currentPage = computed(() => fetched.value?.page ?? page.value);

/** Numbered pages with a window around the current page (≤ 7 buttons). */
const pageItems = computed<(number | "…")[]>(() => {
  const n = totalPages.value;
  const cur = currentPage.value;
  if (n <= 7) return Array.from({ length: n }, (_, i) => i + 1);
  const items: (number | "…")[] = [1];
  const lo = Math.max(2, cur - 1);
  const hi = Math.min(n - 1, cur + 1);
  if (lo > 2) items.push("…");
  for (let i = lo; i <= hi; i++) items.push(i);
  if (hi < n - 1) items.push("…");
  items.push(n);
  return items;
});

const resultLine = computed(() => {
  const n = total.value;
  const q = query.value.trim();
  const cat = activeCat.value === "all" ? "" : ` in ${postCategoryById(activeCat.value).label}`;
  return `${n} ${n === 1 ? "post" : "posts"}${cat}${q ? ` matching “${q}”` : ""}`;
});

function clearFilters() {
  query.value = "";
  activeCat.value = "all";
  page.value = 1;
}

/** Real server-paged href (crawl/middle-click path); clicks stay on-island. */
function pagedUrl(n: number): string {
  const base = currentPathname().replace(/page\/\d+\/?$/, "");
  const params = new URLSearchParams(currentSearch());
  params.delete("paged");
  const qs = params.toString();
  return `${n <= 1 ? base : `${base}page/${n}/`}${qs ? `?${qs}` : ""}`;
}

/* ---- browse-state data: embedded page 1, fetched page N ---- */
const browsePosts = computed(() => (page.value === 1 ? props.initialPosts : results.value));
const featuredPost = computed(
  () => browsePosts.value.find((p) => p.featured) ?? browsePosts.value[0],
);
const gridPosts = computed(() =>
  browsePosts.value.filter((p) => p.id !== featuredPost.value?.id),
);
const showBrowseSkeleton = computed(() => isBrowsing.value && page.value > 1 && loading.value);

/* class recipes shared by both pagination navs */
const NAV_BTN =
  "inline-flex h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border-2 bg-white px-[18px] text-[0.95rem] font-extrabold text-ink no-underline transition-colors hover:border-brand-deep hover:bg-brand-deep hover:text-white";
const NAV_BTN_DISABLED =
  "inline-flex h-11 min-w-11 items-center justify-center rounded-full border-2 border-control-faint bg-white px-[18px] text-[0.95rem] font-extrabold text-border-muted";
const PAGE_BTN =
  "inline-flex size-11 cursor-pointer items-center justify-center rounded-full border-2 p-0 font-display text-[0.9rem] font-normal no-underline transition-colors";
</script>

<template>
  <div class="blog-archive">
    <!-- Toolbar: category chips + search (search stacks above the chips below md) -->
    <section class="bg-white px-6 pt-7 md:pt-10" data-tone="white">
      <div class="mx-auto flex max-w-[1200px] flex-col gap-3.5 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-4">
        <input
          v-model="query"
          type="search"
          placeholder="Search posts…"
          aria-label="Search posts"
          class="order-first box-border w-full rounded-full border-2 border-control bg-white px-5 py-3 text-base font-medium text-ink outline-offset-2 md:order-last md:w-auto md:min-w-[240px] md:py-2.5"
        />
        <div role="group" aria-label="Filter by category" class="flex flex-wrap items-center gap-2">
          <button
            v-for="cat in POST_CATEGORIES"
            :key="cat.id"
            type="button"
            :aria-pressed="activeCat === cat.id"
            data-chip
            class="cursor-pointer rounded-full border-2 px-[18px] py-2 text-[0.88rem] font-bold transition-colors"
            :class="
              activeCat === cat.id
                ? 'border-brand bg-brand text-white'
                : 'border-control bg-white text-ink hover:border-brand-deep hover:bg-brand-deep hover:text-white'
            "
            @click="activeCat = cat.id"
          >
            {{ cat.label }}
          </button>
        </div>
      </div>
    </section>

    <!-- Browse state: featured + grid (embedded page 1, fetched page N) -->
    <template v-if="isBrowsing">
      <template v-if="browsePosts.length > 0 || showBrowseSkeleton || failed">
        <section ref="resultsTop" class="scroll-mt-20 bg-white px-6 pt-6 md:pt-8" data-tone="white">
          <div class="mx-auto max-w-[1200px]">
            <div v-if="showBrowseSkeleton" aria-hidden="true" class="h-[300px] animate-pulse rounded-[24px] bg-alt"></div>
            <FeaturedPostCard v-else-if="featuredPost" :post="featuredPost" />
          </div>
        </section>

        <section class="bg-white px-6 pb-14 pt-6 md:pb-[72px] md:pt-10" data-tone="white">
          <div class="mx-auto flex max-w-[1200px] flex-col">
            <div v-if="showBrowseSkeleton" aria-hidden="true" class="flex flex-col gap-3 md:grid md:gap-7 md:[grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
              <div v-for="n in 6" :key="n" class="h-24 animate-pulse rounded-[16px] bg-alt md:h-[300px] md:rounded-[24px]"></div>
            </div>
            <div v-else-if="failed" class="flex flex-col items-center gap-1 rounded-[16px] border-2 border-dashed border-border-muted px-6 py-11 text-center md:rounded-[20px] md:px-8 md:py-14">
              <div class="text-[1.05rem] font-extrabold md:text-[1.2rem] md:font-bold">Something went wrong</div>
              <p class="m-0 max-w-[42ch] text-base leading-[1.45] md:text-[1.1rem]">We couldn&rsquo;t load posts just now. Give it another try.</p>
              <button type="button" class="mt-4 cursor-pointer rounded-full border-2 border-accent bg-transparent px-6 py-2.5 text-[0.92rem] font-bold text-accent transition-colors hover:bg-accent hover:text-white" @click="runFetch">Retry</button>
            </div>
            <div v-else class="flex flex-col gap-3 md:grid md:gap-7 md:[grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
              <PostCard v-for="post in gridPosts" :key="post.id" :post="post" variant="grid" />
            </div>

            <!-- Round pagination: real server-paged hrefs, island-handled clicks -->
            <template v-if="totalPages > 1">
              <nav aria-label="Pagination" class="flex flex-wrap items-center justify-center gap-2 pt-7 md:gap-2.5 md:pt-12">
                <a v-if="currentPage > 1" :href="pagedUrl(currentPage - 1)" :class="[NAV_BTN, 'border-control']" @click.prevent="page = currentPage - 1">
                  <span aria-hidden="true">←</span><span class="hidden md:inline">&nbsp;Prev</span><span class="sr-only">Previous page</span>
                </a>
                <span v-else aria-disabled="true" :class="NAV_BTN_DISABLED"><span aria-hidden="true">←</span><span class="hidden md:inline">&nbsp;Prev</span></span>
                <template v-for="(item, i) in pageItems" :key="`${item}-${i}`">
                  <span v-if="item === '…'" aria-hidden="true" class="px-1 font-extrabold text-muted">…</span>
                  <a
                    v-else
                    :href="pagedUrl(item)"
                    :aria-label="`Page ${item}`"
                    :aria-current="item === currentPage ? 'page' : undefined"
                    :class="[PAGE_BTN, item === currentPage ? 'border-brand bg-brand text-white' : 'border-control bg-white text-ink hover:border-brand-deep hover:bg-brand-deep hover:text-white']"
                    @click.prevent="page = item"
                  >{{ item }}</a>
                </template>
                <a v-if="currentPage < totalPages" :href="pagedUrl(currentPage + 1)" :class="[NAV_BTN, 'border-control']" @click.prevent="page = currentPage + 1">
                  <span class="hidden md:inline">Next&nbsp;</span><span aria-hidden="true">→</span><span class="sr-only">Next page</span>
                </a>
                <span v-else aria-disabled="true" :class="NAV_BTN_DISABLED"><span class="hidden md:inline">Next&nbsp;</span><span aria-hidden="true">→</span></span>
              </nav>
              <div class="pt-1.5 text-center text-[0.9rem] font-bold text-muted md:pt-3.5 md:text-[0.95rem]">Page {{ currentPage }} of {{ totalPages }}</div>
            </template>
          </div>
        </section>
      </template>

      <!-- Designed empty state (island-empty-states): no posts yet -->
      <section v-else class="bg-white px-6 pb-14 pt-6 md:pb-[72px] md:pt-8" data-tone="white">
        <div class="mx-auto max-w-[1200px]">
          <div class="flex flex-col items-center gap-1 rounded-[16px] border-2 border-dashed border-border-muted px-6 py-11 text-center md:rounded-[20px] md:px-8 md:py-14">
            <div class="text-[1.05rem] font-extrabold md:text-[1.2rem] md:font-bold">No posts yet</div>
            <p class="m-0 max-w-[42ch] text-base leading-[1.45] md:text-[1.1rem]">
              The chapter blog is warming up. Check back soon — or subscribe below and we&rsquo;ll send the first post straight to you.
            </p>
          </div>
        </div>
      </section>
    </template>

    <!-- Filtered results (query and/or category): server-fetched cards -->
    <section v-else ref="resultsTop" class="scroll-mt-20 bg-white px-6 pb-14 pt-6 md:pb-[72px] md:pt-8" data-tone="white">
      <div class="mx-auto flex max-w-[1200px] flex-col gap-3.5 md:gap-[18px]">
        <div class="flex flex-wrap items-baseline justify-between gap-3 border-b-[3px] border-brand pb-2.5 md:gap-4 md:pb-3">
          <div role="status" aria-live="polite" class="font-display text-[1.05rem] md:text-[1.3rem]">
            <template v-if="loading">Searching…</template>
            <template v-else-if="!failed">{{ resultLine }}</template>
          </div>
          <button
            type="button"
            class="cursor-pointer border-none bg-transparent p-0 text-[0.9rem] font-bold text-accent hover:underline hover:underline-offset-4 md:text-[0.95rem]"
            @click="clearFilters"
          >
            Clear filters
          </button>
        </div>

        <!-- Loading skeleton -->
        <div v-if="loading" aria-hidden="true" class="flex flex-col gap-3 md:grid md:gap-6 md:[grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
          <div v-for="n in 4" :key="n" class="h-24 animate-pulse rounded-[16px] bg-alt md:h-[260px] md:rounded-[20px]"></div>
        </div>

        <!-- Error state -->
        <div v-else-if="failed" class="flex flex-col items-center gap-1 rounded-[16px] border-2 border-dashed border-border-muted px-6 py-11 text-center md:rounded-[20px] md:px-8 md:py-14">
          <div class="text-[1.05rem] font-extrabold md:text-[1.2rem] md:font-bold">Something went wrong</div>
          <p class="m-0 max-w-[42ch] text-base leading-[1.45] md:text-[1.1rem]">We couldn&rsquo;t load posts just now. Give it another try.</p>
          <button type="button" class="mt-4 cursor-pointer rounded-full border-2 border-accent bg-transparent px-6 py-2.5 text-[0.92rem] font-bold text-accent transition-colors hover:bg-accent hover:text-white" @click="runFetch">Retry</button>
        </div>

        <template v-else>
          <div v-if="results.length > 0" class="flex flex-col gap-3 md:grid md:gap-6 md:[grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
            <PostCard v-for="post in results" :key="post.id" :post="post" variant="compact" read-time />
          </div>

          <div v-else class="flex flex-col items-center gap-1 rounded-[16px] border-2 border-dashed border-border-muted px-6 py-11 text-center md:rounded-[20px] md:px-8 md:py-14">
            <div class="text-[1.05rem] font-extrabold md:text-[1.2rem] md:font-bold">No posts match</div>
            <p class="m-0 max-w-[42ch] text-base leading-[1.45] md:text-[1.1rem]">Try a different search term or clear the filters.</p>
          </div>

          <!-- Results pagination (envelope-driven) -->
          <template v-if="results.length > 0 && totalPages > 1">
            <nav aria-label="Results pagination" class="flex flex-wrap items-center justify-center gap-2 pt-5 md:gap-2.5 md:pt-9">
              <a v-if="currentPage > 1" :href="pagedUrl(currentPage - 1)" :class="[NAV_BTN, 'border-control']" @click.prevent="page = currentPage - 1">
                <span aria-hidden="true">←</span><span class="hidden md:inline">&nbsp;Prev</span><span class="sr-only">Previous page</span>
              </a>
              <span v-else aria-disabled="true" :class="NAV_BTN_DISABLED"><span aria-hidden="true">←</span><span class="hidden md:inline">&nbsp;Prev</span></span>
              <template v-for="(item, i) in pageItems" :key="`${item}-${i}`">
                <span v-if="item === '…'" aria-hidden="true" class="px-1 font-extrabold text-muted">…</span>
                <a
                  v-else
                  :href="pagedUrl(item)"
                  :aria-label="`Page ${item}`"
                  :aria-current="item === currentPage ? 'page' : undefined"
                  :class="[PAGE_BTN, item === currentPage ? 'border-brand bg-brand text-white' : 'border-control bg-white text-ink hover:border-brand-deep hover:bg-brand-deep hover:text-white']"
                  @click.prevent="page = item"
                >{{ item }}</a>
              </template>
              <a v-if="currentPage < totalPages" :href="pagedUrl(currentPage + 1)" :class="[NAV_BTN, 'border-control']" @click.prevent="page = currentPage + 1">
                <span class="hidden md:inline">Next&nbsp;</span><span aria-hidden="true">→</span><span class="sr-only">Next page</span>
              </a>
              <span v-else aria-disabled="true" :class="NAV_BTN_DISABLED"><span class="hidden md:inline">Next&nbsp;</span><span aria-hidden="true">→</span></span>
            </nav>
            <div class="text-center text-[0.9rem] font-bold text-muted md:pt-3 md:text-[0.95rem]">Page {{ currentPage }} of {{ totalPages }}</div>
          </template>
        </template>
      </div>
    </section>

    <EmailSubscribeStrip
      v-if="showSubscribe && newsletterUrl"
      :newsletter-url="newsletterUrl"
      :title="subscribeTitle"
      :lede="subscribeLede"
      :label="subscribeLabel"
    />
  </div>
</template>
