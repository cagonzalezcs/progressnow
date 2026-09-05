<script setup lang="ts">
/* Featured post card (openspec progress-now-v4-blog spec "Featured post
 * card"): from `lg` a `minmax(300px,1.2fr) minmax(280px,1fr)` grid — duotone
 * image (.30) with the brand "Featured" pill beside a centered text column;
 * below `lg` a stacked radius-18 card with a 16:9 image. The whole card is
 * the link. */
import ImageSlot from "@/components/site/blog/ImageSlot.vue";
import type { BlogPost } from "@/lib/posts";

defineProps<{ post: BlogPost; featuredLabel?: string; readLabel?: string }>();
</script>

<template>
  <a
    :href="post.url"
    data-blog-link
    class="featured-post-card grid overflow-hidden rounded-[18px] bg-white text-ink no-underline shadow-featured transition-[box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:shadow-card-hover-lg lg:rounded-[24px] lg:[grid-template-columns:minmax(300px,1.2fr)_minmax(280px,1fr)]"
  >
    <span class="relative block aspect-video overflow-hidden lg:aspect-auto lg:min-h-[300px]" data-post-image>
      <ImageSlot class="absolute inset-0" :src="post.image?.src" :alt="post.image?.alt" :opacity="0.3" loading="eager" />
      <span class="absolute left-3 top-3 rounded-full bg-brand px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.06em] text-white lg:left-4 lg:top-4 lg:px-3.5 lg:py-[5px] lg:text-[0.75rem]">{{ featuredLabel ?? "Featured" }}</span>
    </span>
    <span class="flex flex-col justify-center gap-2 px-5 pb-[22px] pt-[18px] lg:gap-3 lg:px-10 lg:py-9">
      <span class="text-[0.82rem] font-semibold text-muted lg:text-[0.85rem]">{{ post.date }}<template v-if="post.readMinutes"> · {{ post.readMinutes }} min read</template></span>
      <span class="font-display text-[1.15rem] leading-[1.25] [text-wrap:balance] lg:text-[clamp(1.3rem,2.4vw,1.7rem)] lg:leading-[1.2]">{{ post.title }}</span>
      <span class="text-[0.95rem] leading-[1.55] text-muted lg:text-[1.05rem] lg:leading-[1.6]">{{ post.dek ?? post.excerpt }}</span>
      <span class="mt-1 hidden items-center gap-3 text-[0.95rem] font-extrabold uppercase tracking-[0.03em] text-accent lg:flex">
        {{ readLabel ?? "Read the post" }}
        <svg aria-hidden="true" focusable="false" viewBox="0 0 40 20" class="h-4 w-8 flex-none fill-accent"><path d="M0 8.4h26v3.2H0z" /><path d="M24 1.5 38.5 10 24 18.5Z" /></svg>
      </span>
    </span>
  </a>
</template>
