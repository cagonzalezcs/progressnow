<script setup lang="ts">
import ImageSlot from "@/components/site/blog/ImageSlot.vue";
import type { PostImage } from "@/lib/posts";

defineProps<{
  layout: "essay" | "grid";
  images: PostImage[];
}>();
</script>

<template>
  <div class="block-gallery grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
    <figure
      v-for="(img, i) in images"
      :key="i"
      class="m-0 flex flex-col overflow-hidden rounded-[20px] bg-white shadow-gallery"
      :class="layout === 'essay' && i === 0 ? 'sm:col-span-2' : ''"
    >
      <div :class="layout === 'essay' && i === 0 ? 'h-[clamp(220px,34vw,360px)]' : 'h-[clamp(180px,24vw,280px)]'">
        <ImageSlot :src="img.src" :alt="img.alt" :opacity="0.25" loading="lazy" :label="layout === 'essay' && i === 0 ? 'Wide photo' : 'Photo'" />
      </div>
      <figcaption v-if="img.caption" class="bg-white px-4 py-2.5 text-[0.85rem] text-muted">
        {{ img.caption }}
      </figcaption>
    </figure>
  </div>
</template>
