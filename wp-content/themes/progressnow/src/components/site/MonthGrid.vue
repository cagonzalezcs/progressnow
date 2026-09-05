<script setup lang="ts">
/* Month grid (openspec progress-now-v4-events D2, spec "Month grid (v4)"):
 * radius-20 card with --color-line 1px gaps, brand weekday header (single
 * letters under 700px), white in-month / alt out-of-month cells, 28px numeral
 * circle (yellow for today). Events are brand chips from 700px — the term
 * color survives as a left accent stripe — and 7px dots below; the legend
 * under the grid points at the list view for details. */
import { computed } from "vue";
import { type ChapterEvent, categoryById, WEEKDAYS } from "@/lib/events";

const props = defineProps<{
  year: number;
  month: number; // 0-based
  events: ChapterEvent[]; // already category-filtered
  showCategoryColors: boolean;
}>();

const emit = defineEmits<{ select: [id: string] }>();

interface DayCell {
  key: string;
  num: number;
  inMonth: boolean;
  isToday: boolean;
  events: ChapterEvent[];
}

const cells = computed<DayCell[]>(() => {
  const byDate: Record<string, ChapterEvent[]> = {};
  for (const ev of props.events) (byDate[ev.date] ??= []).push(ev);

  const firstDow = new Date(props.year, props.month, 1).getDay();
  const daysInMonth = new Date(props.year, props.month + 1, 0).getDate();
  const total = Math.ceil((firstDow + daysInMonth) / 7) * 7;
  const today = new Date();

  const out: DayCell[] = [];
  for (let i = 0; i < total; i++) {
    const d = new Date(props.year, props.month, i - firstDow + 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    out.push({
      key,
      num: d.getDate(),
      inMonth: d.getMonth() === props.month,
      isToday:
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate(),
      events: byDate[key] ?? [],
    });
  }
  return out;
});

/** Term color as the chip's left accent (null → plain brand chip). */
function accent(ev: ChapterEvent): string | undefined {
  return props.showCategoryColors ? (categoryById(ev.cat).color ?? undefined) : undefined;
}
</script>

<template>
  <div class="month-grid">
    <div class="overflow-hidden rounded-[16px] bg-line shadow-gallery min-[700px]:rounded-[20px]">
      <div class="grid grid-cols-7 gap-px bg-brand">
        <div
          v-for="wd in WEEKDAYS"
          :key="wd"
          class="bg-brand px-0.5 py-[9px] text-center text-[0.7rem] font-extrabold uppercase tracking-[0.06em] text-white min-[700px]:px-1 min-[700px]:py-3 min-[700px]:text-[0.85rem] min-[700px]:tracking-[0.08em]"
        >
          <span class="min-[700px]:hidden">{{ wd[0] }}</span>
          <span class="hidden min-[700px]:inline">{{ wd }}</span>
        </div>
      </div>
      <div class="grid grid-cols-7 gap-px bg-line">
        <div
          v-for="day in cells"
          :key="day.key"
          class="flex min-h-11 min-w-0 flex-col items-start gap-1 px-1 py-1.5 min-[700px]:min-h-[96px] min-[700px]:gap-1.5 min-[700px]:px-2.5 min-[700px]:pb-3 min-[700px]:pt-2.5"
          :class="day.inMonth ? 'bg-white' : 'bg-alt'"
        >
          <span
            class="inline-flex size-6 items-center justify-center rounded-full text-[0.78rem] font-extrabold min-[700px]:size-7 min-[700px]:text-[0.9rem]"
            :class="[day.isToday ? 'bg-yellow text-ink' : '', day.inMonth ? 'text-ink' : 'text-border-muted']"
          >
            {{ day.num }}
          </span>
          <!-- < 700px: one dot per event day -->
          <span v-if="day.events.length" aria-hidden="true" class="block size-[7px] rounded-full bg-brand min-[700px]:hidden"></span>
          <!-- ≥ 700px: brand chips (term color as the left accent) -->
          <div class="hidden w-full flex-col gap-1 min-[700px]:flex">
            <button
              v-for="ev in day.events"
              :key="ev.id"
              type="button"
              :title="`${ev.title} — ${ev.time}`"
              :style="accent(ev) ? { boxShadow: `inset 4px 0 0 ${accent(ev)}` } : undefined"
              class="block w-full cursor-pointer truncate rounded-[8px] border-none bg-brand px-2 py-[5px] text-left text-[0.72rem] font-bold leading-[1.25] text-white transition-colors hover:bg-brand-deep"
              @click="emit('select', ev.id)"
            >
              {{ ev.title }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <p class="m-0 mt-3 px-1 text-[0.85rem] font-semibold text-muted min-[700px]:hidden">● = event day — switch to List for details.</p>
    <p class="m-0 mt-3.5 hidden text-[0.9rem] font-medium text-muted min-[700px]:block">Select an event for details, location, and how to RSVP.</p>
  </div>
</template>
