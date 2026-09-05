<script setup lang="ts">
import ImageSlot from "@/components/site/blog/ImageSlot.vue";
import type { PostImage } from "@/lib/posts";

withDefaults(
  defineProps<{
    image: PostImage;
    /** widen past the article measure at lg+ (v4: the 880px column → the 1140px wrapper) */
    breakout?: boolean;
  }>(),
  { breakout: false },
);
</script>

<template>
  <!-- breakout: negative margins push 80px past the article on each side at
       lg+, capped so it never overflows the viewport's 24px page gutters. -->
  <figure
    class="block-image m-0 flex w-full flex-col"
    :class="
      breakout
        ? 'lg:-mx-20 lg:w-[calc(100%+10rem)] lg:max-w-[calc(100vw-3rem)]'
        : ''
    "
  >
    <div class="h-[clamp(240px,38vw,440px)] overflow-hidden rounded-[20px] bg-white">
      <ImageSlot :src="image.src" :alt="image.alt" :opacity="0.25" loading="lazy" label="Photo" />
    </div>
    <figcaption v-if="image.caption || image.credit" class="pt-3 text-[0.9rem] leading-[1.5] text-muted">
      {{ image.caption }}
      <span v-if="image.credit">{{ image.credit }}</span>
    </figcaption>
  </figure>
</template>
