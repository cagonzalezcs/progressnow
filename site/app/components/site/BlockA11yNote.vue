<script setup lang="ts">
/* Event accessibility / childcare note (openspec progress-now-v4-events task
 * 3.2): the same alt panel + brand rule as the v4 blockquote. */
defineProps<{ html: string; heading?: string }>();
</script>

<template>
  <aside class="block-a11y-note flex w-full flex-col gap-2 rounded-[16px] border-l-[5px] border-brand bg-alt px-[22px] py-5 md:rounded-[20px] md:border-l-[6px] md:px-[30px] md:py-[26px]">
    <div class="text-[0.92rem] font-extrabold uppercase tracking-[0.04em] text-brand md:text-base">{{ heading ?? "Accessibility & childcare" }}</div>
    <!-- eslint-disable-next-line vue/no-v-html — WP wysiwyg content, kses-sanitized server-side -->
    <div class="prose-chapter text-base leading-[1.65] text-text-body [&>*+*]:mt-3" v-html="html"></div>
  </aside>
</template>
