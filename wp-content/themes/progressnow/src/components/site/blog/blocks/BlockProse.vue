<script setup lang="ts">
defineProps<{ html: string }>();
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html — WP wysiwyg content -->
  <div class="block-prose prose-chapter prose-post w-full" v-html="html"></div>
</template>
