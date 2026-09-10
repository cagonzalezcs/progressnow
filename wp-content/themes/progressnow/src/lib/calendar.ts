import {
  MONTH_NAMES,
  MONTH_SHORTS,
  parseISODate,
  WEEKDAYS,
} from "@/lib/events";
import type { ChapterEvent } from "@/lib/schemas";

/* Pure calendar helpers for the EventCalendar island (twin of next-js
 * lib/calendar.ts; openspec calendar-mobile-day-agenda → events-presentation
 * § Month grid (v4), § Day agenda (compact), § Event list rows). Month math is
 * local-time and framework-free. The island has no server "today": todayISO()
 * reads the clock once per mount so the grid, the agenda and the list agree. */

export interface YearMonth {
  year: number;
  /** 0-based */
  month: number;
}

export const WEEKDAYS_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** Local date → ISO yyyy-mm-dd (inverse of parseISODate). */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** The island's "today" (local clock), read once per mount. */
export function todayISO(): string {
  return toISODate(new Date());
}

function byDateTime(a: ChapterEvent, b: ChapterEvent): number {
  return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
}

/** "Tuesday, September 8" */
function dayLabel(d: Date): string {
  return `${WEEKDAYS_LONG[d.getDay()] ?? ""}, ${MONTH_NAMES[d.getMonth()] ?? ""} ${d.getDate()}`;
}

export interface DayCell {
  /** ISO yyyy-mm-dd */
  key: string;
  num: number;
  inMonth: boolean;
  isToday: boolean;
  /** "Tuesday, September 8" */
  label: string;
  /** in-month days only — padding cells never carry events */
  events: ChapterEvent[];
}

/** The 5–6 week grid, Sunday-first, padded with out-of-month days. */
export function monthCells(
  ym: YearMonth,
  events: ChapterEvent[],
  today: string,
): DayCell[] {
  const byDate = new Map<string, ChapterEvent[]>();
  for (const ev of events)
    byDate.set(ev.date, [...(byDate.get(ev.date) ?? []), ev]);
  const firstDow = new Date(ym.year, ym.month, 1).getDay();
  const daysInMonth = new Date(ym.year, ym.month + 1, 0).getDate();
  const total = Math.ceil((firstDow + daysInMonth) / 7) * 7;
  const out: DayCell[] = [];
  for (let i = 0; i < total; i++) {
    const d = new Date(ym.year, ym.month, i - firstDow + 1);
    const key = toISODate(d);
    const inMonth = d.getMonth() === ym.month;
    out.push({
      key,
      num: d.getDate(),
      inMonth,
      isToday: key === today,
      label: dayLabel(d),
      events: inMonth ? [...(byDate.get(key) ?? [])].sort(byDateTime) : [],
    });
  }
  return out;
}

/** Compact default day: today when the visible month is the current month, else the
 * first in-month day with an event, else the 1st; null only for an empty grid. */
export function defaultSelectedDay(
  cells: DayCell[],
  today: string,
): string | null {
  const inMonth = cells.filter((c) => c.inMonth);
  const todayCell = inMonth.find((c) => c.key === today);
  if (todayCell) return todayCell.key;
  return (inMonth.find((c) => c.events.length > 0) ?? inMonth[0])?.key ?? null;
}

/** First in-month event day after `afterKey`, wrapping to the month's first event day;
 * null when the month has no events. */
export function nextEventDay(
  cells: DayCell[],
  afterKey: string,
): string | null {
  const days = cells
    .filter((c) => c.inMonth && c.events.length > 0)
    .map((c) => c.key);
  if (days.length === 0) return null;
  return days.find((k) => k > afterKey) ?? days[0] ?? null;
}

export interface DayGroup {
  /** ISO yyyy-mm-dd */
  key: string;
  /** "Saturday, September 12" */
  label: string;
  /** "SAT" */
  dow: string;
  num: number;
  isToday: boolean;
  /** strictly before today */
  isPast: boolean;
  events: ChapterEvent[];
}

/** Events → one group per day, date-sorted, for the day-grouped list view. */
export function groupByDay(events: ChapterEvent[], today: string): DayGroup[] {
  const groups = new Map<string, DayGroup>();
  for (const ev of [...events].sort(byDateTime)) {
    let group = groups.get(ev.date);
    if (!group) {
      const d = parseISODate(ev.date);
      group = {
        key: ev.date,
        label: dayLabel(d),
        dow: (WEEKDAYS[d.getDay()] ?? "").toUpperCase(),
        num: d.getDate(),
        isToday: ev.date === today,
        isPast: ev.date < today,
        events: [],
      };
      groups.set(ev.date, group);
    }
    group.events.push(ev);
  }
  return [...groups.values()];
}

/** "Saturday, Sep 12" (day agenda heading) */
export function dayHeading(iso: string): string {
  const d = parseISODate(iso);
  return `${WEEKDAYS_LONG[d.getDay()] ?? ""}, ${MONTH_SHORTS[d.getMonth()] ?? ""} ${d.getDate()}`;
}

/** "Sep 8" (jump-to-next-event pill) */
export function shortDate(iso: string): string {
  const d = parseISODate(iso);
  return `${MONTH_SHORTS[d.getMonth()] ?? ""} ${d.getDate()}`;
}

/** `{name}` placeholder substitution for translated labels ("{n} events in {month}"). */
export function formatLabel(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}
