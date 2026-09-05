<script setup lang="ts">
/* v4 wordmark lockup (openspec progress-now-v4-foundation-chrome, design D5):
 * a decorative yellow diamond followed by the chapter name in Bowlby One
 * uppercase white. Rendered by the header and footer while no logo is
 * uploaded (`identity.logo_*.is_default`). views/base.twig repeats these exact
 * class recipes in its static header shell so the PHP first paint matches. */
withDefaults(
  defineProps<{
    name: string;
    /** header ≥ lg (20px / 1.35rem) · tablet md→lg (18px / 1.2rem) · footer (18px / 1.25rem) · mobile (16px / 1.1rem) */
    size?: "header" | "tablet" | "footer" | "mobile";
  }>(),
  { size: "header" },
);

const DIAMOND = {
  header: "size-5 rounded-[4px]",
  tablet: "size-[18px] rounded-[4px]",
  footer: "size-[18px] rounded-[4px]",
  mobile: "size-4 rounded-[3px]",
} as const;

const NAME = {
  header: "text-[1.35rem] tracking-[0.01em]",
  tablet: "text-[1.2rem] tracking-[0.01em]",
  footer: "text-[1.25rem]",
  mobile: "text-[clamp(0.9rem,4.5vw,1.1rem)]",
} as const;

const GAP = {
  header: "gap-[13px]",
  tablet: "gap-3",
  footer: "gap-3",
  mobile: "gap-2.5",
} as const;
</script>

<template>
  <span :class="['inline-flex min-w-0 items-center', GAP[size]]">
    <span
      aria-hidden="true"
      :class="['block flex-none rotate-45 bg-yellow', DIAMOND[size]]"
    />
    <span
      :class="[
        'font-display font-normal uppercase leading-[1.05] text-white',
        NAME[size],
      ]"
      >{{ name }}</span
    >
  </span>
</template>
