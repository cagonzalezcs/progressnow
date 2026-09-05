<script setup lang="ts">
/* Event "Good to know" (openspec progress-now-v4-events spec "Event
 * content"): radius-20 alt panel, brand uppercase heading, bulleted list. */
defineProps<{ items: string[]; heading?: string }>();
</script>

<template>
  <div class="block-good-to-know flex w-full flex-col gap-2.5 rounded-[16px] bg-alt px-[22px] py-5 md:gap-3 md:rounded-[20px] md:px-[30px] md:py-[26px]">
    <div class="text-[0.92rem] font-extrabold uppercase tracking-[0.04em] text-brand md:text-base">{{ heading ?? "Good to know" }}</div>
    <ul class="m-0 flex list-disc flex-col gap-[7px] pl-5 text-[0.98rem] leading-[1.55] text-text-body md:gap-2 md:pl-[22px] md:text-[1.05rem]">
      <li v-for="(item, i) in items" :key="i">{{ item }}</li>
    </ul>
  </div>
</template>
