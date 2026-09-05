<script setup lang="ts">
/* Blog subscribe strip (openspec progress-now-v4-blog D5 / spec "Blog
 * subscribe strip"): the shared ink SubscribeStrip with the blog's default
 * copy. No form — the pill hands off to the chapter's newsletter URL
 * (Chapter Settings → Newsletter URL); renders nothing without one. */
import SubscribeStrip from "@/components/site/SubscribeStrip.vue";

withDefaults(
  defineProps<{
    newsletterUrl?: string;
    title?: string;
    lede?: string;
    label?: string;
  }>(),
  {
    newsletterUrl: "",
    title: "Never miss a post",
    lede: "One email when we publish. No spam, no lists sold — ever.",
    label: "Subscribe",
  },
);
</script>

<template>
  <SubscribeStrip id="subscribe" class="email-subscribe-strip" :href="newsletterUrl" :title="title" :lede="lede" :label="label" />
</template>
