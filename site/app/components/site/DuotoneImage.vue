<script setup lang="ts">
/* Photo slot (openspec progress-now-v4-foundation-chrome D4 — treatment
 * retired 2026-09-05: photos render in full color; the `.duotone` wrapper in
 * src/css/tailwind.css only clips to the slot's radius now). The `opacity`
 * prop is kept for markup parity with views/partials/duotone.twig, which
 * emits the identical markup so the PHP first paint and the hydrated app are
 * pixel-equal. The wrapper inherits the slot's radius via `class`; pass the
 * <img>'s own sizing/fit classes through `imgClass`. */
withDefaults(
  defineProps<{
    src: string;
    alt?: string;
    width?: number | string;
    height?: number | string;
    srcset?: string;
    sizes?: string;
    loading?: "lazy" | "eager";
    fetchpriority?: "high" | "low" | "auto";
    /** Legacy slot opacity — no visual effect since the treatment was retired. */
    opacity?: number;
    /** Classes for the inner <img> (object-fit, sizing). */
    imgClass?: string;
  }>(),
  {
    alt: "",
    width: undefined,
    height: undefined,
    srcset: undefined,
    sizes: undefined,
    loading: undefined,
    fetchpriority: undefined,
    opacity: 0.3,
    imgClass: "block h-auto w-full",
  },
);
</script>

<template>
  <span class="duotone" :style="`--duotone-opacity: ${opacity}`">
    <img
      :src="src"
      :alt="alt"
      :width="width"
      :height="height"
      :srcset="srcset"
      :sizes="sizes"
      :loading="loading"
      :fetchpriority="fetchpriority"
      :class="imgClass"
    />
  </span>
</template>
