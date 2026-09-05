<script setup lang="ts">
/* Event row-link card (openspec progress-now-v4-events D3, spec "Event list
 * rows"): the one row used by the calendar list view and the single event's
 * "More upcoming events" band — same recipe as the home "Upcoming events" rows
 * (views/front-page.twig / RouteFront.vue). Brand date tile, 700 title,
 * muted "<when> · <where>", and a visual outline "View event" pill at md+;
 * mobile = 60px tile + the when line only. The whole row is the link. */
import { computed } from "vue";
import { MONTH_NAMES, MONTH_SHORTS, parseISODate } from "@/lib/events";

const props = withDefaults(
  defineProps<{
    event: { title: string; date: string; time: string; location: string; url?: string };
    /** fallback href when the event has no permalink (calendar page) */
    fallbackUrl?: string;
    viewLabel?: string;
    /** 1px subtle shadow (more-events band) instead of the card shadow */
    subtle?: boolean;
  }>(),
  { fallbackUrl: "/calendar/", viewLabel: "View event", subtle: false },
);

const WEEKDAYS_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const date = computed(() => parseISODate(props.event.date));
const day = computed(() => String(date.value.getDate()).padStart(2, "0"));
const month = computed(() => MONTH_SHORTS[date.value.getMonth()]!.toUpperCase());
/** "Tuesday, September 8 · 7:00–8:30 PM" */
const when = computed(() => {
  const d = date.value;
  const base = `${WEEKDAYS_LONG[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
  return props.event.time ? `${base} · ${props.event.time}` : base;
});
</script>

<template>
  <a
    :href="event.url || fallbackUrl"
    :aria-label="`${viewLabel}: ${event.title}`"
    class="event-card group grid grid-cols-[60px_1fr] items-center gap-4 rounded-[14px] bg-white p-4 text-ink no-underline transition-shadow hover:shadow-card md:[grid-template-columns:76px_1fr_auto] md:gap-6 md:rounded-[16px] md:px-[22px] md:py-[18px]"
    :class="subtle ? 'shadow-subtle' : 'shadow-card hover:shadow-card-hover'"
  >
    <span aria-hidden="true" class="flex flex-col rounded-[10px] bg-brand px-0.5 py-2 text-center text-white md:rounded-[12px] md:px-1 md:py-2.5">
      <span class="text-[1.2rem] font-extrabold leading-[1.1] md:text-[1.4rem]">{{ day }}</span>
      <span class="text-[0.68rem] font-bold tracking-[0.1em] md:text-[0.75rem]">{{ month }}</span>
    </span>
    <span class="flex min-w-0 flex-col gap-[3px] md:gap-1">
      <span class="text-[1.02rem] font-bold leading-[1.3] md:text-[1.18rem]">{{ event.title }}</span>
      <span class="text-[0.88rem] font-medium text-muted md:text-base">{{ when }}<span v-if="event.location" class="hidden md:inline"> · {{ event.location }}</span></span>
    </span>
    <span
      aria-hidden="true"
      class="hidden whitespace-nowrap rounded-full border-2 border-accent px-5 py-[9px] font-display text-[0.88rem] font-normal uppercase tracking-[0.03em] text-accent transition-colors group-hover:bg-accent group-hover:text-white md:inline-block"
    >
      {{ viewLabel }}
    </span>
  </a>
</template>
