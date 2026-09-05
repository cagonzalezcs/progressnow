<script setup lang="ts">
/* Category label on v4 tokens (openspec progress-now-v4-blog task 3.2). The
 * per-term color palette is gone: every category reads brand blue.
 *   solid — #1848D8 pill, white text ("Featured" pill, hero category)
 *   white — white pill, brand text (over card images, on the blue post hero)
 *   text  — bare brand uppercase label (row cards, result cards, read next) */
import { computed } from "vue";
import { postCategoryById } from "@/lib/posts";

const props = withDefaults(
  defineProps<{
    catId: string;
    href?: string;
    variant?: "solid" | "white" | "text";
    size?: "sm" | "md";
  }>(),
  { href: "", variant: "solid", size: "md" },
);

const category = computed(() => postCategoryById(props.catId));
const variantClass = computed(
  () =>
    ({
      solid: "rounded-full bg-brand text-white",
      white: "rounded-full bg-white text-brand",
      text: "text-brand",
    })[props.variant],
);
const sizeClass = computed(() => {
  if (props.variant === "text") return props.size === "sm" ? "text-[0.72rem]" : "text-[0.78rem]";
  return props.size === "sm" ? "px-3 py-1 text-[0.72rem]" : "px-3.5 py-[5px] text-[0.78rem]";
});
</script>

<template>
  <component
    :is="href ? 'a' : 'span'"
    :href="href || undefined"
    class="category-tag inline-block self-start font-bold uppercase tracking-[0.06em] no-underline"
    :class="[variantClass, sizeClass, href ? 'hover:underline hover:underline-offset-4' : '']"
  >
    {{ category.label }}
  </component>
</template>
