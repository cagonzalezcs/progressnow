<script setup lang="ts">
/* Same anatomy as the Interior template's document row (views/page.twig). */
defineProps<{
  url: string;
  title: string;
  description?: string;
}>();
</script>

<template>
  <div class="block-document flex w-full flex-wrap items-center justify-between gap-5 rounded-[16px] bg-white px-[22px] py-[18px] shadow-card">
    <div class="flex items-center gap-4">
      <span aria-hidden="true" class="rounded-[10px] border-2 border-accent px-2.5 py-2 font-mono text-[0.8rem] font-bold text-accent">PDF</span>
      <div class="flex flex-col gap-[3px]">
        <span class="text-[1.05rem] font-bold">{{ title }}</span>
        <span v-if="description" class="text-[0.85rem] text-muted">{{ description }}</span>
      </div>
    </div>
    <a
      :href="url"
      class="whitespace-nowrap rounded-full border-2 border-accent px-5 py-2 text-[0.9rem] font-bold text-accent no-underline transition-colors hover:bg-accent hover:text-white"
    >
      Download
    </a>
  </div>
</template>
