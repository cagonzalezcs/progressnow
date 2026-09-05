<script setup lang="ts">
/* Interior subscribe strip (openspec progress-now-v4-interior-404, spec
 * "Interior subscribe strip"): ink band, Bowlby title, muted lede, white pill
 * to the chapter newsletter URL. Renders nothing without a URL. Twin of
 * views/partials/subscribe-strip.twig. */
withDefaults(
  defineProps<{
    href: string;
    title: string;
    lede?: string;
    label: string;
  }>(),
  { lede: "" },
);
</script>

<template>
  <section v-if="href" class="subscribe-strip bg-ink px-6 py-10 text-white lg:py-14" data-tone="ink">
    <div class="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-6 lg:gap-8">
      <div class="flex max-w-[52ch] flex-col gap-2">
        <h2 class="m-0 font-display text-[1.2rem] font-normal lg:text-[1.4rem]">{{ title }}</h2>
        <p v-if="lede" class="m-0 text-base leading-[1.55] text-muted-on-ink lg:text-[1.05rem]">{{ lede }}</p>
      </div>
      <a
        :href="href"
        target="_blank"
        rel="noopener"
        class="rounded-full bg-white px-8 py-3.5 font-display text-[0.95rem] font-normal tracking-[0.04em] text-ink no-underline transition-colors hover:bg-brand-deep hover:text-white lg:px-[34px] lg:text-base"
        >{{ label }}</a
      >
    </div>
  </section>
</template>
