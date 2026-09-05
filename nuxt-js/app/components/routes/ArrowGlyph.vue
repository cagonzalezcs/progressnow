<script setup lang="ts">
/* views/partials/arrow.twig — the one arrow reused by every arrow link. */
withDefaults(defineProps<{ class?: string }>(), { class: "h-5 w-10 flex-none fill-accent" });
</script>

<template>
  <svg aria-hidden="true" focusable="false" viewBox="0 0 40 20" :class="$props.class">
    <path d="M0 8.4h26v3.2H0z" />
    <path d="M24 1.5 38.5 10 24 18.5Z" />
  </svg>
</template>
