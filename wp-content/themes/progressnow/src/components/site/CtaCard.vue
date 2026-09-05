<script setup lang="ts">
/* Sidebar CTA card (openspec progress-now-v4-blog D2 / -interior-404 D1):
 * brand-blue card, Bowlby title, lede, white pill. `body` is kses'd editor /
 * Chapter Settings HTML (inline markup allowed). Twin of
 * views/partials/cta-card.twig. */
withDefaults(
  defineProps<{
    title: string;
    body?: string;
    href: string;
    label: string;
    external?: boolean;
    id?: string;
  }>(),
  { body: "", external: false, id: undefined },
);
</script>

<template>
  <div :id="id" class="cta-card flex flex-col gap-3 rounded-[16px] bg-brand px-[22px] pb-[26px] pt-[22px] text-white shadow-featured lg:gap-3.5 lg:rounded-[20px] lg:px-[26px] lg:pb-[30px] lg:pt-[26px]" data-tone="blue">
    <div class="font-display text-[1.05rem] font-normal lg:text-[1.15rem]">{{ title }}</div>
    <!-- eslint-disable-next-line vue/no-v-html -- kses'd Chapter Settings / editor copy -->
    <p v-if="body" class="m-0 text-[0.95rem] leading-[1.55] [&_a]:font-bold [&_a]:text-white [&_a]:underline lg:text-base" v-html="body" />
    <a
      :href="href"
      :target="external ? '_blank' : undefined"
      :rel="external ? 'noopener' : undefined"
      class="rounded-full bg-white px-[22px] py-3 text-center font-display text-[0.88rem] font-normal tracking-[0.04em] text-brand no-underline transition-colors hover:bg-brand-deep hover:text-white lg:py-[11px] lg:text-[0.9rem]"
      >{{ label }}</a
    >
  </div>
</template>
