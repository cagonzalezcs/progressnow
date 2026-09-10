<script setup lang="ts">
/* Calendar list view (openspec progress-now-v4-events spec "Event list rows",
 * regrouped by openspec calendar-mobile-day-agenda): the visible month's
 * events as day groups (max-width 900px) — a summary row ("9 events in
 * September", counting hidden past days too) with the "Show N past" / "Hide
 * past events" toggle, then per day a sticky decorative date badge (brand /
 * ink + TODAY tag / alt for past) beside an h3 date heading and agenda cards.
 * Days before today stay hidden until toggled and render faded. The dashed v4
 * empty-month state is unchanged. Twin of the next-js EventListView.tsx. */
import { computed } from "vue";
import EventCard from "@/components/site/EventCard.vue";
import { formatLabel, groupByDay } from "@/lib/calendar";
import { type ChapterEvent, categoryById } from "@/lib/events";

const props = withDefaults(
  defineProps<{
    events: ChapterEvent[]; // filtered to the visible month, date-sorted
    /** yyyy-mm-dd — days before it are "past" */
    today: string;
    /** "September" (summary row) */
    monthName: string;
    showPast?: boolean;
    showCategoryColors?: boolean;
    /** href for events without a permalink */
    fallbackUrl?: string;
    emptyTitle?: string;
    emptyBody?: string;
    viewLabel?: string;
    listSummaryOne?: string;
    listSummaryOther?: string;
    showPastText?: string;
    hidePastText?: string;
    todayTag?: string;
  }>(),
  {
    showPast: false,
    showCategoryColors: true,
    fallbackUrl: "/calendar/",
    emptyTitle: "Nothing scheduled this month",
    emptyBody: "Check the next month or subscribe below and never miss one.",
    viewLabel: "View event",
    listSummaryOne: "{n} event in {month}",
    listSummaryOther: "{n} events in {month}",
    showPastText: "Show {n} past",
    hidePastText: "Hide past events",
    todayTag: "TODAY",
  },
);

const emit = defineEmits<{ togglePast: [] }>();

const groups = computed(() => groupByDay(props.events, props.today));
const pastCount = computed(() =>
  groups.value.filter((g) => g.isPast).reduce((n, g) => n + g.events.length, 0),
);
const visible = computed(() =>
  props.showPast ? groups.value : groups.value.filter((g) => !g.isPast),
);
const summary = computed(() =>
  formatLabel(
    props.events.length === 1 ? props.listSummaryOne : props.listSummaryOther,
    {
      n: props.events.length,
      month: props.monthName,
    },
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
    class="event-list-view flex flex-col gap-3"
    data-calendar-view="list"
    data-testid="event-list-view"
    :data-show-past="showPast"
  >
    <div
      v-if="events.length"
      class="flex items-baseline justify-between gap-3 px-1 pb-1"
      data-testid="event-list-summary-row"
    >
      <p
        class="m-0 text-[0.85rem] font-bold text-muted"
        data-testid="event-list-summary"
      >
        {{ summary }}
      </p>
      <button
        v-if="pastCount > 0"
        type="button"
        :aria-pressed="showPast"
        class="cursor-pointer border-none bg-transparent p-1 text-[0.85rem] font-bold text-accent underline-offset-4 hover:underline"
        data-testid="event-list-past-toggle"
        :data-past-count="pastCount"
        @click="emit('togglePast')"
      >
        {{
          showPast ? hidePastText : formatLabel(showPastText, { n: pastCount })
        }}
      </button>
    </div>
    <div
      v-for="group in visible"
      :key="group.key"
      class="grid grid-cols-[56px_1fr] items-start gap-3.5"
      data-testid="event-list-day"
      :data-date="group.key"
      :data-past="group.isPast"
      :data-today="group.isToday"
    >
      <div
        aria-hidden="true"
        class="sticky top-[76px] flex flex-col items-center gap-0.5 rounded-[12px] px-1 py-2"
        :class="
          group.isToday
            ? 'bg-ink text-white'
            : group.isPast
              ? 'bg-alt text-muted'
              : 'bg-brand text-white'
        "
        data-testid="event-list-day-badge"
      >
        <span
          class="text-[0.66rem] font-extrabold uppercase tracking-[0.1em]"
          >{{ group.dow }}</span
        >
        <span class="font-display text-[1.35rem] font-normal leading-none">{{
          group.num
        }}</span>
        <span
          v-if="group.isToday"
          class="mt-0.5 rounded-full bg-yellow px-1.5 py-0.5 text-[0.58rem] font-extrabold tracking-[0.08em] text-ink"
          data-testid="event-list-today-tag"
        >
          {{ todayTag }}
        </span>
      </div>
      <div class="flex min-w-0 flex-col gap-2.5">
        <h3
          class="m-0 pt-1.5 text-[0.85rem] font-bold uppercase tracking-[0.04em] text-muted"
          data-testid="event-list-day-heading"
        >
          {{ group.label }}
        </h3>
        <EventCard
          v-for="ev in group.events"
          :key="ev.id"
          variant="agenda"
          :event="ev"
          :category="category(ev)"
          :past="group.isPast"
          :fallback-url="fallbackUrl"
          :view-label="viewLabel"
        />
      </div>
    </div>

    <div
      v-if="events.length === 0"
      class="flex flex-col items-center gap-1 rounded-[16px] border-2 border-dashed border-border-muted px-6 py-11 text-center md:rounded-[20px] md:px-8 md:py-16"
      data-calendar-empty=""
      data-testid="event-list-empty"
    >
      <div class="text-[1.05rem] font-extrabold md:text-[1.25rem] md:font-bold">
        {{ emptyTitle }}
      </div>
      <p
        class="m-0 max-w-[44ch] text-base font-medium leading-[1.45] md:text-[1.2rem]"
      >
        {{ emptyBody }}
      </p>
    </div>
  </div>
</template>
