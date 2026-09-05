<script setup lang="ts">
/* v4 page header band (openspec progress-now-v4-blog D1 / -interior-404 spec
 * "Interior page header with breadcrumb"): blue band, white breadcrumb pill
 * (from `md`), Bowlby title, 600 lede. Twin of views/partials/page-header.twig
 * — keep the class literals identical.
 *
 *   variant "page" (default): uppercase shadowed h1, 1140px column (1200px
 *     with `wide` — the blog archive, whose toolbar/grid run 1200px).
 *   variant "post": the single-post hero — 880px column, plain balanced h1,
 *     and `pullUp` grows the bottom padding to 150px so the article's featured
 *     image can overlap the band by 110px (blog D4).
 *
 * Slots: `before` renders between the breadcrumb and the h1 (category pill);
 * the default slot renders under the lede (byline, date tile, action pills). */
import { computed } from "vue";

interface Crumb {
  label: string;
  href?: string;
}

const props = withDefaults(
  defineProps<{
    title: string;
    lede?: string;
    crumbs?: Crumb[];
    variant?: "page" | "post";
    wide?: boolean;
    pullUp?: boolean;
  }>(),
  {
    lede: "",
    crumbs: () => [{ label: "Home", href: "/" }],
    variant: "page",
    wide: false,
    pullUp: false,
  },
);

const isPost = computed(() => props.variant === "post");
const bandClass = computed(() =>
  isPost.value
    ? props.pullUp
      ? "pb-[96px] pt-8 md:pb-[150px] md:pt-12"
      : "pb-10 pt-8 md:pb-12 md:pt-12"
    : "pb-10 pt-9 md:px-10 md:pb-[52px] md:pt-11 xl:px-6 xl:pb-14 xl:pt-12",
);
const columnClass = computed(() =>
  isPost.value ? "max-w-[880px] gap-4 md:gap-5" : props.wide ? "max-w-[1200px]" : "max-w-[1140px]",
);
const titleClass = computed(() =>
  isPost.value
    ? "text-[1.5rem] leading-[1.25] [text-wrap:balance] md:text-[clamp(2rem,3.8vw,3rem)] md:leading-[1.12]"
    : "headline-shadow uppercase text-[1.9rem] leading-[1.12] md:text-[2.3rem] md:leading-[1.1] xl:text-[clamp(2.2rem,4.2vw,3.4rem)] xl:leading-[1.08]",
);
</script>

<template>
  <section class="page-header bg-brand px-6 text-white" :class="bandClass" data-tone="blue">
    <div class="mx-auto flex flex-col items-start gap-3.5 md:gap-4 xl:gap-[18px]" :class="columnClass">
      <nav aria-label="Breadcrumb" class="hidden md:block">
        <ol class="m-0 flex list-none flex-wrap items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[0.85rem] font-bold">
          <li v-for="crumb in crumbs" :key="crumb.label" class="flex items-center gap-2">
            <a v-if="crumb.href" :href="crumb.href" class="text-brand no-underline hover:underline hover:underline-offset-4">{{ crumb.label }}</a>
            <span v-else class="text-ink">{{ crumb.label }}</span>
            <span aria-hidden="true" class="text-muted">/</span>
          </li>
          <li aria-current="page" class="text-ink">{{ title }}</li>
        </ol>
      </nav>
      <slot name="before" />
      <h1 class="m-0 font-display font-normal" :class="titleClass">
        {{ title }}
      </h1>
      <p v-if="lede" class="m-0 max-w-[56ch] text-[1.05rem] font-semibold leading-[1.5] md:text-[1.12rem] xl:text-[1.25rem]">
        {{ lede }}
      </p>
      <slot />
    </div>
  </section>
</template>
