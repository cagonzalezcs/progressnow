<script setup lang="ts">
import BlockActionCallout from "@/components/site/blog/blocks/BlockActionCallout.vue";
import BlockAudio from "@/components/site/blog/blocks/BlockAudio.vue";
import BlockDocument from "@/components/site/blog/blocks/BlockDocument.vue";
import BlockEventEmbed from "@/components/site/blog/blocks/BlockEventEmbed.vue";
import BlockGallery from "@/components/site/blog/blocks/BlockGallery.vue";
import BlockImage from "@/components/site/blog/blocks/BlockImage.vue";
import BlockPersonQuote from "@/components/site/blog/blocks/BlockPersonQuote.vue";
import BlockProse from "@/components/site/blog/blocks/BlockProse.vue";
import BlockPullQuote from "@/components/site/blog/blocks/BlockPullQuote.vue";
import BlockVideo from "@/components/site/blog/blocks/BlockVideo.vue";
import type { PostBlock } from "@/lib/posts";

/* v4 (openspec progress-now-v4-blog task 4.3): every block reads the brand
 * role tokens — the per-category `accent` color is gone. */
defineProps<{ blocks: PostBlock[] }>();
</script>

<template>
  <template v-for="(block, i) in blocks" :key="i">
    <BlockProse v-if="block.type === 'prose'" :html="block.html" />
    <BlockImage
      v-else-if="block.type === 'image'"
      :image="block.image"
      :breakout="block.breakout"
    />
    <BlockPullQuote
      v-else-if="block.type === 'pull_quote'"
      :quote="block.quote"
      :attribution="block.attribution"
    />
    <BlockGallery v-else-if="block.type === 'gallery'" :layout="block.layout" :images="block.images" />
    <BlockPersonQuote
      v-else-if="block.type === 'person_quote'"
      :photo="block.photo"
      :alt="block.alt"
      :quote="block.quote"
      :translation="block.translation"
      :name="block.name"
      :role="block.role"
      :lang="block.lang"
    />
    <BlockVideo
      v-else-if="block.type === 'video'"
      :url="block.url"
      :poster="block.poster"
      :caption="block.caption"
      :transcript-url="block.transcriptUrl"
    />
    <BlockAudio
      v-else-if="block.type === 'audio'"
      :file="block.file"
      :title="block.title"
      :duration="block.duration"
      :transcript-url="block.transcriptUrl"
    />
    <BlockDocument
      v-else-if="block.type === 'document'"
      :url="block.url"
      :title="block.title"
      :description="block.description"
    />
    <BlockEventEmbed v-else-if="block.type === 'event_embed'" :event="block.event" />
    <BlockActionCallout
      v-else-if="block.type === 'action_callout'"
      :heading="block.heading"
      :body="block.body"
      :buttons="block.buttons"
    />
  </template>
</template>
