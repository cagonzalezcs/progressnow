<script setup lang="ts">
import { computed, ref } from "vue";

const props = defineProps<{
  url: string;
  poster?: string | null;
  caption?: string;
  transcriptUrl?: string;
}>();

const playing = ref(false);

/* YouTube / Vimeo oEmbed URLs → embeddable iframe src; anything else stays a placeholder. */
const embedUrl = computed(() => {
  const yt = props.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1`;
  const vimeo = props.url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`;
  return null;
});
</script>

<template>
  <figure class="block-video m-0 flex w-full flex-col">
    <iframe
      v-if="playing && embedUrl"
      :src="embedUrl"
      title="Video"
      class="aspect-video w-full rounded-[20px] shadow-media"
      allow="autoplay; fullscreen; picture-in-picture"
      allowfullscreen
    ></iframe>
    <div
      v-else
      class="relative flex aspect-video items-center justify-center overflow-hidden rounded-[20px] shadow-media"
      :class="poster ? '' : 'bg-[repeating-linear-gradient(45deg,var(--color-alt)_0_14px,var(--color-control-faint)_14px_28px)]'"
    >
      <img v-if="poster" :src="poster" alt="" class="absolute inset-0 size-full object-cover" />
      <button
        type="button"
        aria-label="Play video"
        class="relative flex size-[84px] cursor-pointer items-center justify-center rounded-full border-none bg-brand text-[1.8rem] text-white shadow-[0_8px_24px_rgba(27,27,34,0.3)] transition-transform duration-100 hover:scale-105 hover:bg-brand-deep"
        @click="playing = true"
      >
        ▶
      </button>
      <span
        class="absolute bottom-3.5 right-3.5 rounded-[6px] bg-white px-2 py-1 text-[0.75rem] font-bold tracking-[0.06em] text-ink"
      >CC</span>
    </div>
    <figcaption
      v-if="caption || transcriptUrl"
      class="flex flex-wrap justify-between gap-4 pt-3 text-[0.9rem] leading-[1.5] text-muted"
    >
      <span>{{ caption }}</span>
      <a v-if="transcriptUrl" :href="transcriptUrl" class="font-bold text-accent no-underline hover:underline hover:underline-offset-4">Read transcript</a>
    </figcaption>
  </figure>
</template>
