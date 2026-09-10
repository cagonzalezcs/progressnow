<script setup lang="ts">
/* Day agenda (openspec calendar-mobile-day-agenda → events-presentation
 * § Day agenda (compact)): the panel under the compact month grid for the
 * selected day — Bowlby date + count, one agenda card per event, or the
 * dashed "Nothing scheduled" note with "Jump to next event" (first event day
 * after the selection, wrapping; absent when the month is empty) — always
 * closed by "See the whole month as a list". Rendered at every width and
 * hidden from 700px by CSS; aria-live announces the day change without moving
 * focus. Twin of the next-js DayAgenda.tsx. */
import { computed } from "vue";
import EventCard from "@/components/site/EventCard.vue";
import {
  dayHeading,
  formatLabel,
  shortDate,
  type DayCell,
} from "@/lib/calendar";
import { type ChapterEvent, categoryById } from "@/lib/events";

const props = withDefaults(
  defineProps<{
    day: DayCell;
    /** target of the jump pill; null when the month has no events */
    jumpTo: string | null;
    showCategoryColors: boolean;
    fallbackUrl?: string;
    viewLabel?: string;
    regionLabel?: string;
    noEventsText?: string;
    eventCountOne?: string;
    eventCountOther?: string;
    emptyBody?: string;
    jumpText?: string;
    seeListText?: string;
  }>(),
  {
    fallbackUrl: "/calendar/",
    viewLabel: "View event",
    regionLabel: "Events on selected day",
    noEventsText: "No events",
    eventCountOne: "{n} event",
    eventCountOther: "{n} events",
    emptyBody: "Nothing scheduled on this day. Days with a ● have events.",
    jumpText: "Jump to next event · {date}",
    seeListText: "See the whole month as a list →",
  },
);

const emit = defineEmits<{ jump: [key: string]; seeList: [] }>();

const count = computed(() => props.day.events.length);
const countText = computed(() =>
  count.value === 0
    ? props.noEventsText
    : formatLabel(
        count.value === 1 ? props.eventCountOne : props.eventCountOther,
        { n: count.value },
      ),
);
function category(ev: ChapterEvent) {
  const cat = categoryById(ev.cat);
  return {
    label: cat.label,
    color: props.showCategoryColors ? cat.color : null,
  };
}
</script>

<template>
  <div
    role="region"
    aria-live="polite"
    :aria-label="regionLabel"
    class="mt-5 flex flex-col gap-3 min-[700px]:hidden"
    data-testid="day-agenda"
    :data-date="day.key"
    :data-event-count="count"
  >
    <div class="flex items-baseline justify-between gap-3 px-1">
      <h3
        class="m-0 font-display text-[1.1rem] font-normal leading-[1.2] text-ink"
        data-testid="day-agenda-heading"
      >
        {{ dayHeading(day.key) }}
      </h3>
      <span
        class="whitespace-nowrap text-[0.85rem] font-bold text-muted"
        data-testid="day-agenda-count"
        >{{ countText }}</span
      >
    </div>
    <template v-if="count">
      <EventCard
        v-for="ev in day.events"
        :key="ev.id"
        variant="agenda"
        :event="ev"
        :category="category(ev)"
        :fallback-url="fallbackUrl"
        :view-label="viewLabel"
      />
    </template>
    <div
      v-else
      class="flex flex-col items-start gap-3 rounded-[16px] border-2 border-dashed border-border-muted p-6"
      data-testid="day-agenda-empty"
    >
      <p class="m-0 text-base font-semibold leading-[1.45]">{{ emptyBody }}</p>
      <button
        v-if="jumpTo"
        type="button"
        class="cursor-pointer rounded-full border-none bg-brand px-5 py-3 font-display text-[0.85rem] font-normal tracking-[0.03em] text-white transition-colors hover:bg-accent"
        data-testid="day-agenda-jump"
        :data-date="jumpTo"
        @click="emit('jump', jumpTo)"
      >
        {{ formatLabel(jumpText, { date: shortDate(jumpTo) }) }}
      </button>
    </div>
    <button
      type="button"
      class="cursor-pointer self-start border-none bg-transparent px-1 py-2 text-[0.92rem] font-bold text-accent underline-offset-4 hover:underline"
      data-testid="day-agenda-see-list"
      @click="emit('seeList')"
    >
      {{ seeListText }}
    </button>
  </div>
</template>
