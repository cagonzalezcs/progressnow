<script setup lang="ts">
/* Event agenda (openspec progress-now-v4-events spec "Event content"): Bowlby
 * "Agenda" h2 + `110px 1fr` bordered rows — the item title reads as the time
 * (800 brand) when it looks like one, the description as the 600 label. */
defineProps<{ items: { title: string; desc?: string }[]; heading?: string }>();
</script>

<template>
  <div class="block-agenda flex w-full flex-col gap-2.5 md:gap-3">
    <h2 class="m-0 mt-3 scroll-mt-[108px] font-display text-[1.25rem] font-normal leading-[1.25] md:mt-[18px] md:text-[clamp(1.4rem,2.4vw,1.9rem)] md:leading-[1.15]">{{ heading ?? "Agenda" }}</h2>
    <ol class="m-0 flex list-none flex-col gap-[9px] p-0 md:gap-2.5">
      <li
        v-for="(item, i) in items"
        :key="i"
        class="grid items-baseline gap-3.5 rounded-[12px] border border-line px-4 py-3 [grid-template-columns:90px_1fr] md:gap-[18px] md:rounded-[14px] md:px-[18px] md:py-3.5 md:[grid-template-columns:110px_1fr]"
      >
        <span class="text-[0.95rem] font-extrabold text-brand md:text-base">{{ item.title }}</span>
        <span class="text-[0.95rem] font-semibold md:text-base">{{ item.desc ?? "" }}</span>
      </li>
    </ol>
  </div>
</template>
