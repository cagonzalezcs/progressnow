<script setup lang="ts">
/* Calendar island (openspec progress-now-v4-events D1/D2/D5, specs "Calendar
 * toolbar" … "Calendar subscribe strip"; calendar-mobile-day-agenda).
 * Month/list state, URL state and the windowed REST fetch are unchanged
 * (island-data-fetch); the skin is v4: round month buttons + Bowlby label +
 * segmented Month/List on an alt pill, the v4 MonthGrid (tappable days + dots
 * under 700px, chips above), the day agenda panel for the selected day, the
 * day-grouped EventListView with its past toggle, the dashed empty month, and
 * the ink subscribe strip with Google / iCal pills. The category filter row
 * (FILTER: + "All events" / term chips with swatch dots) sits under the
 * toolbar as on the reference site; `?category=` keeps the active chip across
 * reloads. The selected day and the past toggle are not URL state: both reset
 * on month change, the selection also on category change. Every label is a
 * prop (Twig `calendar_props` / nuxt RouteCalendar feed the `/site` strings). */
import { computed, onMounted, ref, watch } from "vue";
import DayAgenda from "@/components/site/DayAgenda.vue";
import EventDetailDialog from "@/components/site/EventDetailDialog.vue";
import EventListView from "@/components/site/EventListView.vue";
import MonthGrid from "@/components/site/MonthGrid.vue";
import { fetchEvents, isAbortError } from "@/lib/api";
import {
  defaultSelectedDay,
  monthCells,
  nextEventDay,
  todayISO,
} from "@/lib/calendar";
import { currentSearch, replaceSearch } from "@/lib/url-state";
import {
  type ChapterEvent,
  EVENT_CATEGORIES,
  MONTH_NAMES,
  parseISODate,
  setCategories,
} from "@/lib/events";

const props = withDefaults(
  defineProps<{
    /** progressnow/v1 base URL — the island fetches its window on mount */
    apiBase: string;
    /** Polylang language slug of the page; scopes the fetched events to it */
    lang?: string;
    defaultView?: "month" | "list";
    showCategoryColors?: boolean;
    showSubscribe?: boolean;
    googleCalUrl?: string;
    icsUrl?: string;
    /** translated copy */
    subscribeTitle?: string;
    subscribeLede?: string;
    googleLabel?: string;
    icsLabel?: string;
    monthLabelText?: string;
    listLabelText?: string;
    filterLabelText?: string;
    allEventsText?: string;
    viewLabel?: string;
    emptyTitle?: string;
    emptyBody?: string;
    prevLabel?: string;
    nextLabel?: string;
    loadingText?: string;
    retryText?: string;
    tapDayHint?: string;
    dayRegionLabel?: string;
    noEventsText?: string;
    eventCountOne?: string;
    eventCountOther?: string;
    dayEmptyBody?: string;
    jumpToNextText?: string;
    seeMonthListText?: string;
    listSummaryOne?: string;
    listSummaryOther?: string;
    showPastText?: string;
    hidePastText?: string;
    todayTag?: string;
  }>(),
  {
    defaultView: "month",
    showCategoryColors: true,
    showSubscribe: true,
    googleCalUrl: "#",
    icsUrl: "#",
    subscribeTitle: "Subscribe to the calendar",
    subscribeLede:
      "Add every meeting and action to your own calendar automatically.",
    googleLabel: "Google Calendar",
    icsLabel: "iCal / .ics",
    monthLabelText: "Month",
    listLabelText: "List",
    filterLabelText: "Filter:",
    allEventsText: "All events",
    viewLabel: "View event",
    emptyTitle: "Nothing scheduled this month",
    emptyBody: "Check the next month or subscribe below and never miss one.",
    prevLabel: "Previous month",
    nextLabel: "Next month",
    loadingText: "Loading events…",
    retryText: "Retry",
    tapDayHint: "Tap a day to see what’s happening.",
    dayRegionLabel: "Events on selected day",
    noEventsText: "No events",
    eventCountOne: "{n} event",
    eventCountOther: "{n} events",
    dayEmptyBody: "Nothing scheduled on this day. Days with a ● have events.",
    jumpToNextText: "Jump to next event · {date}",
    seeMonthListText: "See the whole month as a list →",
    listSummaryOne: "{n} event in {month}",
    listSummaryOther: "{n} events in {month}",
    showPastText: "Show {n} past",
    hidePastText: "Hide past events",
    todayTag: "TODAY",
  },
);

/* ---- windowed fetch (island-data-fetch): skeleton until events land ---- */
const events = ref<ChapterEvent[]>([]);
const loading = ref(true);
const failed = ref(false);

async function loadEvents() {
  loading.value = true;
  failed.value = false;
  try {
    const envelope = await fetchEvents(props.apiBase, { lang: props.lang });
    events.value = envelope.events;
    if (envelope.categories.length > 0) setCategories(envelope.categories);
  } catch (err) {
    if (isAbortError(err)) return;
    failed.value = true;
  } finally {
    loading.value = false;
  }
}

onMounted(loadEvents);

/* ---- state (view + filter survive reload via URL params) ---- */
const initialParams = new URLSearchParams(currentSearch());
const initialView = initialParams.get("view");
const initialCat = initialParams.get("category");

const view = ref<"month" | "list">(
  initialView === "month" || initialView === "list"
    ? initialView
    : props.defaultView,
);
const activeCat = ref(
  EVENT_CATEGORIES.some((c) => c.id === initialCat && c.id !== "all")
    ? (initialCat as string)
    : "all",
);
const monthOffset = ref(0);
const selectedId = ref<string | null>(null);
/** compact day selection; null = the default day (today → first event day → the 1st) */
const selectedDay = ref<string | null>(null);
const showPast = ref(false);

watch([view, activeCat], () => {
  const params = new URLSearchParams(currentSearch());
  if (view.value === props.defaultView) params.delete("view");
  else params.set("view", view.value);
  if (activeCat.value === "all") params.delete("category");
  else params.set("category", activeCat.value);
  replaceSearch(params);
});
watch(monthOffset, () => {
  selectedDay.value = null;
  showPast.value = false;
});
watch(activeCat, () => {
  selectedDay.value = null;
});

/* ---- month math (one clock read per mount) ---- */
const today = todayISO();
const now = parseISODate(today);
const visibleMonth = computed(() => {
  const base = new Date(
    now.getFullYear(),
    now.getMonth() + monthOffset.value,
    1,
  );
  return { year: base.getFullYear(), month: base.getMonth() };
});
const monthName = computed(() => MONTH_NAMES[visibleMonth.value.month] ?? "");
const monthLabel = computed(
  () => `${monthName.value} ${visibleMonth.value.year}`,
);

/* ---- filtering ---- */
const filtered = computed(() =>
  events.value.filter(
    (e) => activeCat.value === "all" || e.cat === activeCat.value,
  ),
);
const monthEvents = computed(() =>
  filtered.value
    .filter((e) => {
      const d = parseISODate(e.date);
      return (
        d.getFullYear() === visibleMonth.value.year &&
        d.getMonth() === visibleMonth.value.month
      );
    })
    .sort((a, b) => a.date.localeCompare(b.date)),
);

/* ---- compact day agenda: the selected (or default) day of the visible grid ---- */
const cells = computed(() =>
  monthCells(visibleMonth.value, filtered.value, today),
);
const agendaDay = computed(
  () => selectedDay.value ?? defaultSelectedDay(cells.value, today),
);
const agendaCell = computed(
  () => cells.value.find((c) => c.inMonth && c.key === agendaDay.value) ?? null,
);
const jumpTo = computed(() =>
  agendaCell.value ? nextEventDay(cells.value, agendaCell.value.key) : null,
);

const selectedEvent = computed(
  () => events.value.find((e) => e.id === selectedId.value) ?? null,
);

const NAV_BTN =
  "inline-flex size-11 flex-none cursor-pointer items-center justify-center rounded-full border-2 border-control bg-white p-0 text-[1.1rem] font-extrabold text-ink transition-colors hover:border-accent hover:bg-accent hover:text-white";
const SEG_BTN =
  "cursor-pointer rounded-full border-none px-[22px] py-[9px] font-display text-[0.9rem] font-normal tracking-[0.03em] transition-colors";
const CHIP =
  "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-[0.85rem] font-bold leading-[1.5] transition-colors";
</script>

<template>
  <div class="event-calendar" data-testid="event-calendar" :data-view="view">
    <!-- Toolbar: month nav + Month/List segmented control -->
    <section class="bg-white px-6 pt-7 md:pt-10" data-tone="white">
      <div class="mx-auto flex max-w-[1200px] flex-col gap-5">
        <div
          class="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-5"
        >
          <div
            class="flex items-center justify-between gap-2.5 md:justify-start md:gap-3.5"
          >
            <button
              type="button"
              :aria-label="prevLabel"
              :class="NAV_BTN"
              data-testid="event-calendar-prev-month"
              @click="monthOffset--"
            >
              <span aria-hidden="true">←</span>
            </button>
            <h2
              aria-live="polite"
              class="m-0 text-center font-display text-[1.25rem] font-normal md:min-w-[280px] md:text-[clamp(1.3rem,2.4vw,1.8rem)]"
              data-testid="event-calendar-month-label"
            >
              {{ monthLabel }}
            </h2>
            <button
              type="button"
              :aria-label="nextLabel"
              :class="NAV_BTN"
              data-testid="event-calendar-next-month"
              @click="monthOffset++"
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>

          <div
            role="group"
            aria-label="View"
            class="flex items-center gap-0.5 self-center rounded-full bg-alt p-1 md:self-auto"
          >
            <button
              type="button"
              :aria-pressed="view === 'month'"
              :class="[
                SEG_BTN,
                view === 'month'
                  ? 'bg-brand text-white'
                  : 'bg-transparent text-ink hover:bg-control-faint',
              ]"
              data-testid="event-calendar-view-option"
              data-view="month"
              @click="view = 'month'"
            >
              {{ monthLabelText }}
            </button>
            <button
              type="button"
              :aria-pressed="view === 'list'"
              :class="[
                SEG_BTN,
                view === 'list'
                  ? 'bg-brand text-white'
                  : 'bg-transparent text-ink hover:bg-control-faint',
              ]"
              data-testid="event-calendar-view-option"
              data-view="list"
              @click="view = 'list'"
            >
              {{ listLabelText }}
            </button>
          </div>
        </div>

        <!-- Category filter chips: "All events" + one per term, swatch dot in term color -->
        <div
          role="group"
          :aria-label="filterLabelText"
          class="flex flex-wrap items-center gap-2"
        >
          <span
            class="mr-1.5 font-display text-[0.82rem] font-bold uppercase tracking-[0.06em] text-muted"
            >{{ filterLabelText }}</span
          >
          <button
            v-for="cat in EVENT_CATEGORIES"
            :key="cat.id"
            type="button"
            :aria-pressed="activeCat === cat.id"
            :class="[
              CHIP,
              activeCat === cat.id
                ? 'border-ink bg-ink text-white'
                : 'border-control bg-white text-ink hover:border-ink',
            ]"
            data-testid="event-calendar-filter-option"
            :data-category="cat.id"
            @click="activeCat = cat.id"
          >
            <span
              v-if="showCategoryColors && cat.color"
              aria-hidden="true"
              class="inline-block size-2.5 flex-none rounded-full"
              :style="{ backgroundColor: cat.color }"
            ></span>
            {{ cat.id === "all" ? allEventsText : cat.label }}
          </button>
        </div>
      </div>
    </section>

    <!-- Skeleton while the window loads -->
    <section
      v-if="loading"
      class="bg-white px-4 pb-8 pt-5 min-[700px]:px-6 md:pb-14 md:pt-7"
      data-tone="white"
    >
      <div
        aria-hidden="true"
        class="mx-auto max-w-[1200px] overflow-hidden rounded-[20px] shadow-gallery"
      >
        <div class="h-11 animate-pulse bg-brand/30"></div>
        <div class="grid grid-cols-7 gap-px bg-line pt-px">
          <div
            v-for="n in 35"
            :key="`g${n}`"
            class="h-11 animate-pulse bg-alt min-[700px]:h-24"
          ></div>
        </div>
      </div>
      <p
        role="status"
        class="mx-auto mt-3.5 max-w-[1200px] text-[0.9rem] font-medium text-muted"
      >
        {{ loadingText }}
      </p>
    </section>

    <!-- Error state: the calendar feed keeps working even when the API doesn't -->
    <section
      v-else-if="failed"
      class="bg-white px-6 pb-10 pt-5 md:pb-14 md:pt-7"
      data-tone="white"
    >
      <div class="mx-auto max-w-[900px]">
        <div
          class="flex flex-col items-center gap-1 rounded-[16px] border-2 border-dashed border-border-muted px-6 py-11 text-center md:rounded-[20px] md:px-8 md:py-16"
        >
          <div
            class="text-[1.05rem] font-extrabold md:text-[1.25rem] md:font-bold"
          >
            We couldn&rsquo;t load the calendar
          </div>
          <p
            class="m-0 max-w-[44ch] text-base font-medium leading-[1.45] md:text-[1.2rem]"
          >
            Try again in a moment — or subscribe with
            <a
              :href="icsUrl"
              class="font-bold text-accent underline underline-offset-4 hover:text-brand-deep"
              >{{ icsLabel }}</a
            >
            and get every event straight in your own calendar.
          </p>
          <button
            type="button"
            class="mt-4 cursor-pointer rounded-full border-2 border-accent bg-transparent px-6 py-2.5 text-[0.92rem] font-bold text-accent transition-colors hover:bg-accent hover:text-white"
            @click="loadEvents"
          >
            {{ retryText }}
          </button>
        </div>
      </div>
    </section>

    <template v-else>
      <!-- Month view: v4 grid (tappable days + dots under 700px) and the day agenda -->
      <section
        v-if="view === 'month'"
        class="bg-white px-4 pb-8 pt-5 min-[700px]:px-6 md:pb-14 md:pt-7"
        data-tone="white"
      >
        <div class="mx-auto max-w-[1200px]">
          <MonthGrid
            :year="visibleMonth.year"
            :month="visibleMonth.month"
            :events="filtered"
            :today="today"
            :show-category-colors="showCategoryColors"
            :grid-label="monthLabel"
            :selected-day="agendaDay"
            :hint-compact="tapDayHint"
            @select="selectedId = $event"
            @day-select="selectedDay = $event"
            @month-change="monthOffset += $event"
          />
          <DayAgenda
            v-if="agendaCell"
            :day="agendaCell"
            :jump-to="jumpTo"
            :show-category-colors="showCategoryColors"
            :view-label="viewLabel"
            :region-label="dayRegionLabel"
            :no-events-text="noEventsText"
            :event-count-one="eventCountOne"
            :event-count-other="eventCountOther"
            :empty-body="dayEmptyBody"
            :jump-text="jumpToNextText"
            :see-list-text="seeMonthListText"
            @jump="selectedDay = $event"
            @see-list="view = 'list'"
          />
        </div>
      </section>

      <!-- List view: day groups of agenda cards + dashed empty month -->
      <section
        v-else
        class="bg-white px-6 pb-10 pt-5 md:pb-14 md:pt-7"
        data-tone="white"
      >
        <div class="mx-auto max-w-[900px]">
          <EventListView
            :events="monthEvents"
            :today="today"
            :month-name="monthName"
            :show-past="showPast"
            :show-category-colors="showCategoryColors"
            :view-label="viewLabel"
            :empty-title="emptyTitle"
            :empty-body="emptyBody"
            :list-summary-one="listSummaryOne"
            :list-summary-other="listSummaryOther"
            :show-past-text="showPastText"
            :hide-past-text="hidePastText"
            :today-tag="todayTag"
            @toggle-past="showPast = !showPast"
          />
        </div>
      </section>
    </template>

    <EventDetailDialog
      :event="selectedEvent"
      :show-category-colors="showCategoryColors"
      :view-label="viewLabel"
      @close="selectedId = null"
    />

    <!-- Subscribe strip: Google Calendar + iCal pills -->
    <section
      v-if="showSubscribe"
      id="subscribe"
      class="calendar-subscribe bg-ink px-6 py-10 text-white md:py-14"
      data-tone="ink"
    >
      <div
        class="mx-auto flex max-w-[1200px] flex-col items-start gap-4 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-8"
      >
        <div class="flex max-w-[56ch] flex-col gap-2">
          <h2
            class="m-0 font-display text-[1.2rem] font-normal md:text-[1.4rem]"
          >
            {{ subscribeTitle }}
          </h2>
          <p
            class="m-0 text-[0.98rem] leading-[1.55] text-muted-on-ink md:text-[1.05rem]"
          >
            {{ subscribeLede }}
          </p>
        </div>
        <div class="flex flex-wrap gap-2.5 md:gap-3">
          <a
            :href="googleCalUrl"
            target="_blank"
            rel="noopener"
            class="rounded-full bg-white px-6 py-[13px] font-display text-[0.9rem] font-normal tracking-[0.04em] text-ink no-underline transition-colors hover:bg-brand-deep hover:text-white md:px-[34px] md:py-3.5 md:text-base"
          >
            {{ googleLabel }}
          </a>
          <a
            :href="icsUrl"
            class="rounded-full border-2 border-white bg-transparent px-[22px] py-[11px] font-display text-[0.9rem] font-normal tracking-[0.04em] text-white no-underline transition-colors hover:bg-brand-deep hover:border-brand-deep md:px-8 md:py-3 md:text-base"
          >
            {{ icsLabel }}
          </a>
        </div>
      </div>
    </section>
  </div>
</template>
