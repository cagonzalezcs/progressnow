<script setup lang="ts">
/* Dashed sidebar note (openspec progress-now-v4-blog D2 / -interior-404 D1):
 * 2px dashed border-muted box, uppercase heading, prose slot. Twin of
 * views/partials/dashed-note.twig. */
withDefaults(defineProps<{ heading: string; id?: string }>(), { id: undefined });
</script>

<template>
  <div :id="id" class="dashed-note flex flex-col gap-1.5 rounded-[16px] border-2 border-dashed border-border-muted px-[22px] py-5 lg:gap-2 lg:rounded-[20px] lg:px-[26px] lg:py-6">
    <div class="text-[0.95rem] font-extrabold uppercase tracking-[0.04em] text-ink lg:text-base">{{ heading }}</div>
    <div class="text-[0.95rem] leading-[1.55] text-text-body [&_a]:font-bold [&_a]:text-accent [&_a]:no-underline hover:[&_a]:underline hover:[&_a]:underline-offset-4 [&_p]:m-0 lg:text-[0.98rem]">
      <slot />
    </div>
  </div>
</template>
