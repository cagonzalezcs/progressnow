<script setup lang="ts">
/* Month grid (openspec progress-now-v4-events D2, spec "Month grid (v4)";
 * calendar-mobile-day-agenda): radius-20 card with --color-line 1px gaps,
 * brand weekday header (single letters under 700px), white in-month / alt
 * out-of-month cells, 28px numeral circle (yellow for today). Events are solid
 * chips from 700px, filled with the category term color (brand blue when
 * colors are off / unset), and 7px dots in the same color below.
 * Every cell is role="gridcell" → a real day <button> (the roving tab stop:
 * arrows move between days, Home/End = week edges, PageUp/PageDown = previous/
 * next month) → the chips. Activating the day button opens its event (or
 * focuses its chips) from 700px and, on compact viewports, selects the day for
 * the agenda panel (aria-pressed); the selected cell fills brand blue. Padding
 * cells are inert (aria-disabled) but stay in the arrow path. Twin of the
 * next-js MonthGrid.tsx. */
import { useMediaQuery } from "@vueuse/core";
import { computed, nextTick, ref, watch } from "vue";
import { monthCells, WEEKDAYS_LONG, type DayCell } from "@/lib/calendar";
import { type ChapterEvent, categoryById, WEEKDAYS } from "@/lib/events";

const props = withDefaults(
  defineProps<{
    year: number;
    month: number; // 0-based
    events: ChapterEvent[]; // already category-filtered
    /** yyyy-mm-dd — the island's clock, read once per mount */
    today: string;
    showCategoryColors: boolean;
    /** accessible name of the grid ("September 2026") */
    gridLabel: string;
    /** the agenda day (compact selection); null = none */
    selectedDay?: string | null;
    hintCompact?: string;
    hintDesktop?: string;
  }>(),
  {
    selectedDay: null,
    hintCompact: "Tap a day to see what’s happening.",
    hintDesktop:
      "Select an event for details, location, and how to RSVP. Arrow keys move between days.",
  },
);

const emit = defineEmits<{
  select: [id: string];
  daySelect: [key: string];
  monthChange: [delta: number];
}>();

const cells = computed(() =>
  monthCells(
    { year: props.year, month: props.month },
    props.events,
    props.today,
  ),
);
const weeks = computed(() =>
  Array.from({ length: cells.value.length / 7 }, (_, r) =>
    cells.value.slice(r * 7, r * 7 + 7),
  ),
);
const monthKey = computed(
  () => `${props.year}-${String(props.month + 1).padStart(2, "0")}`,
);
/** Under 700px a day control selects the day instead of opening its event. */
const compact = useMediaQuery("(max-width: 699.98px)");

function initialActive(): number {
  const today = cells.value.findIndex((c) => c.isToday && c.inMonth);
  return today >= 0 ? today : cells.value.findIndex((c) => c.inMonth);
}
/** roving tabindex: the index of the one focusable day button */
const active = ref(initialActive());
const dayRefs: (HTMLButtonElement | null)[] = [];
const chipRefs = new Map<string, HTMLButtonElement>();
let pendingFocus = false;

function setDayRef(index: number, el: unknown) {
  dayRefs[index] = (el as HTMLButtonElement | null) ?? null;
}
function setChipRef(id: string, el: unknown) {
  if (el) chipRefs.set(id, el as HTMLButtonElement);
  else chipRefs.delete(id);
}

async function focusActive() {
  if (!pendingFocus) return;
  pendingFocus = false;
  await nextTick();
  dayRefs[active.value]?.focus();
}

// New month → active day resets (today when visible, else the 1st); keep focus in the grid.
watch(monthKey, () => {
  active.value = initialActive();
  void focusActive();
});

function move(next: number) {
  if (next < 0 || next >= cells.value.length) return;
  pendingFocus = true;
  active.value = next;
  void focusActive();
}

function onDayKey(e: KeyboardEvent) {
  const row = Math.floor(active.value / 7) * 7;
  const handlers: Record<string, () => void> = {
    ArrowRight: () => move(active.value + 1),
    ArrowLeft: () => move(active.value - 1),
    ArrowDown: () => move(active.value + 7),
    ArrowUp: () => move(active.value - 7),
    Home: () => move(row),
    End: () => move(row + 6),
    PageUp: () => {
      pendingFocus = true;
      emit("monthChange", -1);
    },
    PageDown: () => {
      pendingFocus = true;
      emit("monthChange", 1);
    },
  };
  const handler = handlers[e.key];
  if (!handler) return;
  e.preventDefault();
  handler();
}

/** Day button activation (click, Enter, Space): select on compact, open from 700px. */
function activate(index: number) {
  const day = cells.value[index];
  if (!day || !day.inMonth) return;
  if (compact.value) {
    emit("daySelect", day.key);
    return;
  }
  const first = day.events[0];
  if (!first) return;
  if (day.events.length === 1) emit("select", first.id);
  else chipRefs.get(first.id)?.focus();
}

function onChipKey(e: KeyboardEvent, day: DayCell, i: number) {
  const cellIndex = cells.value.indexOf(day);
  if (e.key === "Escape") {
    e.preventDefault();
    e.stopPropagation();
    dayRefs[cellIndex]?.focus();
  } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    const next = day.events[i + (e.key === "ArrowDown" ? 1 : -1)];
    if (next) chipRefs.get(next.id)?.focus();
  }
}

const isSelected = (day: DayCell) =>
  day.inMonth && day.key === props.selectedDay;
const dayName = (day: DayCell) =>
  `${day.label}, ${day.events.length ? `${day.events.length} event${day.events.length === 1 ? "" : "s"}` : "no events"}${day.isToday ? ", today" : ""}`;

/** Term color as the chip / dot fill (null → plain brand chip). */
function fill(ev: ChapterEvent): string | undefined {
  return props.showCategoryColors
    ? (categoryById(ev.cat).color ?? undefined)
    : undefined;
}

function numeralClass(day: DayCell): string[] {
  const selected = isSelected(day);
  return [
    "inline-flex size-[26px] items-center justify-center rounded-full text-[0.82rem] font-extrabold min-[700px]:size-7 min-[700px]:text-[0.9rem]",
    // 7.5:1 on alt for padding days; border-muted fails 4.5:1
    !day.inMonth
      ? "text-muted"
      : selected
        ? "text-white min-[700px]:text-ink"
        : "text-ink",
    day.isToday
      ? selected
        ? "border-2 border-yellow min-[700px]:border-0 min-[700px]:bg-yellow"
        : "bg-yellow"
      : "",
  ];
}

const CELL =
  "flex min-h-[52px] min-w-0 flex-col outline-offset-[-3px] transition-colors has-[>button:focus-visible]:outline has-[>button:focus-visible]:outline-[3px] has-[>button:focus-visible]:outline-accent min-[700px]:min-h-[96px] min-[700px]:gap-1.5 min-[700px]:px-2.5 min-[700px]:pb-3 min-[700px]:pt-2.5";
const DAY_BTN =
  "flex w-full flex-1 flex-col items-center gap-1 border-none bg-transparent px-1 py-1.5 text-left outline-none min-[700px]:flex-none min-[700px]:items-start min-[700px]:p-0";
</script>

<template>
  <div
    class="month-grid"
    data-calendar-view="month"
    :data-month="monthKey"
    data-testid="month-grid"
  >
    <div
      role="grid"
      :aria-label="gridLabel"
      class="overflow-hidden rounded-[16px] bg-line shadow-gallery min-[700px]:rounded-[20px]"
      data-testid="month-grid-card"
    >
      <div
        role="row"
        class="grid grid-cols-7 gap-px bg-brand"
        data-testid="month-grid-weekdays"
      >
        <div
          v-for="(wd, i) in WEEKDAYS"
          :key="wd"
          role="columnheader"
          :data-weekday="wd"
          class="bg-brand px-0.5 py-[9px] text-center text-[0.7rem] font-extrabold uppercase tracking-[0.06em] text-white min-[700px]:px-1 min-[700px]:py-3 min-[700px]:text-[0.85rem] min-[700px]:tracking-[0.08em]"
        >
          <span aria-hidden="true" class="min-[700px]:hidden">{{ wd[0] }}</span>
          <span aria-hidden="true" class="hidden min-[700px]:inline">{{
            wd
          }}</span>
          <span class="sr-only">{{ WEEKDAYS_LONG[i] }}</span>
        </div>
      </div>
      <div
        v-for="(week, r) in weeks"
        :key="r"
        role="row"
        class="grid grid-cols-7 gap-px bg-line"
        data-testid="month-grid-week"
        :data-week-index="r"
      >
        <div
          v-for="(day, c) in week"
          :key="day.key"
          role="gridcell"
          :aria-current="day.isToday ? 'date' : undefined"
          :data-date="day.key"
          data-testid="month-grid-day"
          :data-in-month="day.inMonth"
          :data-today="day.isToday"
          :data-selected="isSelected(day)"
          :data-event-count="day.events.length"
          :class="[
            CELL,
            isSelected(day)
              ? 'bg-brand min-[700px]:bg-white'
              : day.inMonth
                ? 'bg-white'
                : 'bg-alt',
          ]"
        >
          <button
            :ref="(el) => setDayRef(r * 7 + c, el)"
            type="button"
            :tabindex="r * 7 + c === active ? 0 : -1"
            :aria-label="dayName(day)"
            :aria-pressed="compact && day.inMonth ? isSelected(day) : undefined"
            :aria-disabled="day.inMonth ? undefined : 'true'"
            data-testid="month-grid-day-button"
            :data-date="day.key"
            :class="[
              DAY_BTN,
              day.inMonth ? 'cursor-pointer' : 'cursor-default',
            ]"
            @focus="active = r * 7 + c"
            @keydown="onDayKey"
            @click="activate(r * 7 + c)"
          >
            <span
              aria-hidden="true"
              :class="numeralClass(day)"
              data-testid="month-grid-day-number"
              >{{ day.num }}</span
            >
            <!-- < 700px: one category-colored dot per event (white on the selected day) -->
            <span
              v-if="day.events.length"
              aria-hidden="true"
              class="flex min-h-[7px] flex-wrap justify-center gap-[3px] min-[700px]:hidden"
              data-testid="month-grid-day-dots"
            >
              <span
                v-for="ev in day.events"
                :key="ev.id"
                class="block size-[7px] rounded-full"
                :class="isSelected(day) ? 'bg-white' : 'bg-brand'"
                :style="
                  !isSelected(day) && fill(ev)
                    ? { backgroundColor: fill(ev) }
                    : undefined
                "
                data-testid="month-grid-day-dot"
                :data-event-id="ev.id"
              ></span>
            </span>
          </button>
          <!-- ≥ 700px: solid chips filled with the term color -->
          <div
            v-if="day.events.length"
            class="hidden w-full flex-col gap-1 min-[700px]:flex"
            data-testid="month-grid-day-chips"
          >
            <button
              v-for="(ev, i) in day.events"
              :key="ev.id"
              :ref="(el) => setChipRef(ev.id, el)"
              type="button"
              tabindex="-1"
              :aria-label="`${ev.title} — ${ev.time}`"
              data-testid="month-grid-event-chip"
              :data-event-id="ev.id"
              :data-event-date="day.key"
              :style="fill(ev) ? { backgroundColor: fill(ev) } : undefined"
              class="block w-full cursor-pointer truncate rounded-[8px] border-none bg-brand px-2 py-[5px] text-left text-[0.72rem] font-bold leading-[1.25] text-white transition-[filter,background-color] hover:brightness-[.85]"
              @click="emit('select', ev.id)"
              @keydown="onChipKey($event, day, i)"
            >
              {{ ev.title }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <p
      class="m-0 mt-3 px-1 text-[0.85rem] font-semibold text-muted min-[700px]:hidden"
      data-testid="month-grid-hint-compact"
    >
      {{ hintCompact }}
    </p>
    <p
      class="m-0 mt-3.5 hidden text-[0.9rem] font-medium text-muted min-[700px]:block"
      data-testid="month-grid-hint"
    >
      {{ hintDesktop }}
    </p>
  </div>
</template>
