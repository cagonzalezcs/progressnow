<script setup lang="ts">
import ImageSlot from "@/components/site/blog/ImageSlot.vue";

defineProps<{
  photo: string | null;
  alt: string;
  quote: string;
  translation?: string;
  name: string;
  role?: string;
  lang: "en" | "es";
}>();
</script>

<template>
  <div class="block-person-quote flex w-full flex-wrap items-start gap-6 rounded-[20px] bg-alt px-6 py-6 md:px-8 md:py-7">
    <div class="size-24 flex-none overflow-hidden rounded-full bg-white shadow-subtle">
      <ImageSlot :src="photo" :alt="alt" :opacity="0" loading="lazy" />
    </div>
    <div class="flex flex-[1_1_300px] flex-col gap-3">
      <blockquote :lang="lang" class="m-0 font-display text-[1.05rem] font-normal leading-[1.4] text-ink md:text-[1.25rem] md:leading-[1.35]">{{ quote }}</blockquote>
      <div v-if="translation" class="text-base leading-[1.6] text-text-body">{{ translation }}</div>
      <div class="text-[0.85rem] font-bold uppercase tracking-[0.06em]">
        <span class="text-brand">{{ name }}</span><template v-if="role"><span class="text-muted"> · {{ role }}</span></template>
      </div>
    </div>
  </div>
</template>
