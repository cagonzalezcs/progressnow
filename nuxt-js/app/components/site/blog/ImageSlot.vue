<script setup lang="ts">
/* Post/event photo slot (openspec progress-now-v4-blog task 3.2). A real image
 * renders full-color inside the shared DuotoneImage wrapper (the v4 duotone
 * treatment was retired 2026-09-05; `opacity` is markup parity only). A null
 * src draws the striped v4 placeholder. */
import DuotoneImage from "@/components/site/DuotoneImage.vue";

withDefaults(
  defineProps<{
    src?: string | null;
    alt?: string;
    /** mono label shown on the striped placeholder */
    label?: string;
    /** legacy slot opacity (no visual effect) */
    opacity?: number;
    loading?: "lazy" | "eager";
  }>(),
  { src: null, alt: "", label: "", opacity: 0, loading: undefined },
);
</script>

<template>
  <DuotoneImage
    v-if="src"
    :src="src"
    :alt="alt"
    :opacity="opacity"
    :loading="loading"
    class="image-slot size-full"
    img-class="block size-full object-cover"
  />
  <div
    v-else
    aria-hidden="true"
    class="image-slot flex size-full items-center justify-center bg-[repeating-linear-gradient(45deg,var(--color-alt)_0_14px,var(--color-control-faint)_14px_28px)]"
  >
    <span v-if="label" class="font-mono text-[0.78rem] text-muted">{{ label }}</span>
  </div>
</template>
