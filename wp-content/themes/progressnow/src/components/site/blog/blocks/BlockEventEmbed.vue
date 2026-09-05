<script setup lang="ts">
import { computed } from "vue";
import { type ChapterEvent, categoryById, MONTH_SHORTS, parseISODate, WEEKDAYS } from "@/lib/events";

const props = defineProps<{ event: ChapterEvent | null }>();

const date = computed(() => (props.event ? parseISODate(props.event.date) : null));
const category = computed(() => (props.event ? categoryById(props.event.cat) : null));
</script>

<template>
  <div
    v-if="event && date && category"
    class="block-event-embed grid w-full items-center gap-5 rounded-[16px] bg-white px-6 py-5 shadow-card [grid-template-columns:auto_1fr] md:[grid-template-columns:72px_1fr_auto]"
  >
    <div
      aria-hidden="true"
      class="flex flex-col items-center rounded-[12px] bg-brand px-1 py-2 text-center text-white"
    >
      <span class="text-[0.7rem] font-bold tracking-[0.1em]">{{ WEEKDAYS[date.getDay()].toUpperCase() }}</span>
      <span class="text-[1.4rem] font-extrabold leading-[1.1]">{{ date.getDate() }}</span>
      <span class="text-[0.7rem] font-bold tracking-[0.1em]">{{ MONTH_SHORTS[date.getMonth()].toUpperCase() }}</span>
    </div>
    <div class="flex min-w-0 flex-col gap-1">
      <span class="text-[0.75rem] font-bold uppercase tracking-[0.06em] text-brand">
        Upcoming event · {{ category.label }}
      </span>
      <span class="text-[1.1rem] font-bold">{{ event.title }}</span>
      <span class="text-[0.9rem] font-medium text-muted">{{ event.time }} · {{ event.location }}</span>
    </div>
    <a
      :href="event.rsvpUrl ?? '/calendar/'"
      class="col-span-2 justify-self-start whitespace-nowrap rounded-full border-2 border-accent px-5 py-2 text-[0.9rem] font-bold text-accent no-underline transition-colors hover:bg-accent hover:text-white md:col-span-1 md:justify-self-auto"
    >
      RSVP
    </a>
  </div>
  <div
    v-else
    class="block-event-embed grid w-full items-center gap-5 rounded-[16px] bg-alt px-6 py-5 [grid-template-columns:1fr_auto]"
  >
    <div class="flex min-w-0 flex-col gap-1">
      <span class="text-[0.75rem] font-bold uppercase tracking-[0.06em] text-muted">Event</span>
      <span class="text-[1.05rem] font-bold text-muted">This event is no longer scheduled.</span>
    </div>
    <a
      href="/calendar/"
      class="whitespace-nowrap rounded-full border-2 border-accent px-5 py-2 text-[0.9rem] font-bold text-accent no-underline transition-colors hover:bg-accent hover:text-white"
    >
      See the calendar
    </a>
  </div>
</template>
