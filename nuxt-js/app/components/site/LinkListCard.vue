<script setup lang="ts">
/* Sidebar link-list card (openspec progress-now-v4-blog D2 / -interior-404
 * D1): white radius-20 card, uppercase 800 heading, accent 700 links. The
 * `rows` variant renders label/value pairs instead of links. Rendered as a
 * <nav> when `links` are given. Twin of views/partials/link-list-card.twig. */
interface Link {
  label: string;
  href: string;
  external?: boolean;
}
interface Row {
  label: string;
  value: string;
}

withDefaults(
  defineProps<{
    heading: string;
    links?: Link[];
    rows?: Row[];
    id?: string;
    ariaLabel?: string;
  }>(),
  { links: () => [], rows: () => [], id: undefined, ariaLabel: undefined },
);
</script>

<template>
  <component
    :is="links.length ? 'nav' : 'div'"
    :id="id"
    :aria-label="links.length ? ariaLabel || heading : undefined"
    class="link-list-card flex flex-col gap-[9px] rounded-[16px] bg-white px-[22px] py-5 shadow-card lg:gap-2.5 lg:rounded-[20px] lg:px-[26px] lg:py-6"
  >
    <div class="mb-0.5 text-[0.95rem] font-extrabold uppercase tracking-[0.04em] text-ink lg:mb-1 lg:text-base">{{ heading }}</div>
    <a
      v-for="link in links"
      :key="link.href + link.label"
      :href="link.href"
      :target="link.external ? '_blank' : undefined"
      :rel="link.external ? 'noopener' : undefined"
      class="text-[0.95rem] font-bold text-accent no-underline hover:underline hover:underline-offset-4 lg:text-[0.98rem]"
      >{{ link.label }}</a
    >
    <div v-for="row in rows" :key="row.label" class="flex flex-col gap-0.5">
      <span class="row-label text-[0.78rem] font-extrabold uppercase tracking-[0.06em] text-muted">{{ row.label }}</span>
      <span class="text-[0.98rem] font-semibold text-ink">{{ row.value }}</span>
    </div>
  </component>
</template>
