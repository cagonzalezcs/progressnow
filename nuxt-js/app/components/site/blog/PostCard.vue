<script setup lang="ts">
/* Post card (openspec progress-now-v4-blog specs "Post grid and pagination" /
 * "Read next"). From `md` a stacked card — 16:9 image, meta, 800
 * title; below `md` the compact `96px 1fr` row card (uppercase brand category,
 * 700 .95rem title, date).
 *   grid    — browse grid: radius 24, white category pill over the image,
 *             date · read time, 1.12rem title, excerpt
 *   compact — read next / results: radius 20, brand category text, 1.05rem
 *             title, date (· read time when `readTime`) */
import { computed } from "vue";
import CategoryTag from "@/components/site/blog/CategoryTag.vue";
import ImageSlot from "@/components/site/blog/ImageSlot.vue";
import type { BlogPost } from "@/lib/posts";

const props = withDefaults(
  defineProps<{
    post: BlogPost;
    variant?: "grid" | "compact";
    /** append "· N min read" to the date (results grid) */
    readTime?: boolean;
  }>(),
  { variant: "grid", readTime: false },
);

const isGrid = computed(() => props.variant === "grid");
const meta = computed(() => {
  const min = props.post.readMinutes;
  const withRead = isGrid.value || props.readTime;
  return withRead && min ? `${props.post.date} · ${min} min read` : props.post.date;
});
</script>

<template>
  <a
    :href="post.url"
    data-blog-link
    class="post-card grid overflow-hidden rounded-[16px] bg-white text-ink no-underline shadow-card transition-[box-shadow,transform] duration-150 [grid-template-columns:96px_1fr] hover:-translate-y-0.5 hover:shadow-card-hover-lg md:flex md:flex-1 md:flex-col"
    :class="isGrid ? 'md:rounded-[24px]' : 'md:rounded-[20px]'"
  >
    <span class="relative block min-h-[96px] overflow-hidden md:aspect-video md:min-h-0" aria-hidden="true" data-post-image>
      <ImageSlot class="absolute inset-0" :src="post.image?.src" :alt="post.image?.alt" :opacity="0" loading="lazy" />
      <span v-if="isGrid" class="absolute left-3 top-3 hidden md:block"><CategoryTag :cat-id="post.cat" variant="white" size="sm" /></span>
    </span>
    <span
      class="flex flex-col justify-center gap-[5px] px-4 py-3 md:justify-start md:gap-2"
      :class="isGrid ? 'md:px-6 md:pb-[26px] md:pt-[22px]' : 'md:px-[22px] md:pb-6 md:pt-5'"
    >
      <CategoryTag :cat-id="post.cat" variant="text" size="sm" :class="isGrid ? 'md:hidden' : 'md:text-[0.78rem]'" />
      <span class="text-[0.95rem] font-bold leading-[1.3] md:font-extrabold" :class="isGrid ? 'md:text-[1.12rem]' : 'md:text-[1.05rem]'">{{ post.title }}</span>
      <span class="text-[0.8rem] font-semibold text-muted md:text-[0.85rem]" :class="isGrid ? 'md:order-first' : ''">
        <span class="md:hidden">{{ readTime ? meta : post.date }}</span>
        <span class="hidden md:inline">{{ meta }}</span>
      </span>
      <span v-if="isGrid && post.excerpt" class="hidden text-[0.98rem] leading-[1.55] text-muted md:block">{{ post.excerpt }}</span>
    </span>
  </a>
</template>
