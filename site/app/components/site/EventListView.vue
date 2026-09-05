<script setup lang="ts">
/* Calendar list view (openspec progress-now-v4-events spec "Event list
 * rows"): the visible month's events as EventCard row links (max-width 900px)
 * and the dashed v4 empty-month state. */
import EventCard from "@/components/site/EventCard.vue";
import type { ChapterEvent } from "@/lib/events";

withDefaults(
  defineProps<{
    events: ChapterEvent[]; // filtered to the visible month, date-sorted
    /** href for events without a permalink */
    fallbackUrl?: string;
    emptyTitle?: string;
    emptyBody?: string;
    viewLabel?: string;
  }>(),
  {
    fallbackUrl: "/calendar/",
    emptyTitle: "Nothing scheduled this month",
    emptyBody: "Check the next month or subscribe below and never miss one.",
    viewLabel: "View event",
  },
);
</script>

<template>
  <div class="event-list-view flex flex-col gap-3">
    <EventCard v-for="ev in events" :key="ev.id" :event="ev" :fallback-url="fallbackUrl" :view-label="viewLabel" />

    <div
      v-if="events.length === 0"
      class="flex flex-col items-center gap-1 rounded-[16px] border-2 border-dashed border-border-muted px-6 py-11 text-center md:rounded-[20px] md:px-8 md:py-16"
    >
      <div class="text-[1.05rem] font-extrabold md:text-[1.25rem] md:font-bold">{{ emptyTitle }}</div>
      <p class="m-0 max-w-[44ch] text-base font-medium leading-[1.45] md:text-[1.2rem]">{{ emptyBody }}</p>
    </div>
  </div>
</template>
