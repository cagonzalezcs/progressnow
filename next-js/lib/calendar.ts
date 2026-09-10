import { MONTH_NAMES, MONTH_SHORTS, parseISODate, toISODate, WEEKDAYS } from "@/lib/events";
import type { ChapterEvent } from "@/lib/schemas";

/* Pure calendar helpers (openspec next-headless-site § Interactive archive and
 * calendar; twin of the computed values in the Nuxt EventCalendar/MonthGrid).
 * Month math is local-time and framework-free so the server can render the
 * requested month and the client can page through it without re-deriving.
 * The compact day picker / day agenda / grouped list (openspec
 * calendar-mobile-day-agenda) add `defaultSelectedDay`, `nextEventDay`,
 * `groupByDay` and the label formatters below. */

export interface YearMonth {
  year: number;
  /** 0-based */
  month: number;
}

export interface EventWindow {
  /** inclusive ISO yyyy-mm-dd */
  from: string;
  /** inclusive ISO yyyy-mm-dd */
  to: string;
}

export interface CalendarState {
  view: "month" | "list";
  /** yyyy-mm; omitted when it is the current month */
  month?: string;
  category?: string;
}

export const WEEKDAYS_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function monthKey({ year, month }: YearMonth): string {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

/** `?month=yyyy-mm` → YearMonth, or null when malformed. */
export function parseMonthParam(value: string | undefined | null): YearMonth | null {
  const m = /^(\d{4})-(\d{2})$/.exec(value ?? "");
  if (!m) return null;
  const month = Number(m[2]) - 1;
  if (month < 0 || month > 11) return null;
  return { year: Number(m[1]), month };
}

export function monthOf(iso: string): YearMonth {
  const d = parseISODate(iso);
  return { year: d.getFullYear(), month: d.getMonth() };
}

export function addMonths({ year, month }: YearMonth, delta: number): YearMonth {
  const d = new Date(year, month + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}

export function monthLabel({ year, month }: YearMonth): string {
  return `${MONTH_NAMES[month]} ${year}`;
}

/** First and last day of the month as an inclusive ISO window. */
export function monthBounds({ year, month }: YearMonth): EventWindow {
  return {
    from: toISODate(new Date(year, month, 1)),
    to: toISODate(new Date(year, month + 1, 0)),
  };
}

/** The REST default window (inc/rest.php): today −1 month → +12 months. */
export function defaultWindow(todayISO: string): EventWindow {
  const t = parseISODate(todayISO);
  return {
    from: toISODate(new Date(t.getFullYear(), t.getMonth() - 1, t.getDate())),
    to: toISODate(new Date(t.getFullYear(), t.getMonth() + 12, t.getDate())),
  };
}

/** True when every day of the month lies inside the fetched window. */
export function monthInWindow(ym: YearMonth, window: EventWindow): boolean {
  const b = monthBounds(ym);
  return b.from >= window.from && b.to <= window.to;
}

function byDateTime(a: ChapterEvent, b: ChapterEvent): number {
  return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
}

export function eventsInMonth(events: ChapterEvent[], ym: YearMonth): ChapterEvent[] {
  const key = monthKey(ym);
  return events.filter((e) => e.date.startsWith(key)).sort(byDateTime);
}

export function filterByCategory(events: ChapterEvent[], category: string): ChapterEvent[] {
  return category === "all" || !category ? events : events.filter((e) => e.cat === category);
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

/** "Tuesday, September 8" */
function dayLabel(d: Date): string {
  return `${WEEKDAYS_LONG[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

/** The 5–6 week grid, Sunday-first, padded with out-of-month days. */
export function monthCells(ym: YearMonth, events: ChapterEvent[], todayISO: string): DayCell[] {
  const byDate = new Map<string, ChapterEvent[]>();
  for (const ev of events) byDate.set(ev.date, [...(byDate.get(ev.date) ?? []), ev]);
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
      isToday: key === todayISO,
      label: dayLabel(d),
      events: inMonth ? [...(byDate.get(key) ?? [])].sort(byDateTime) : [],
    });
  }
  return out;
}

/** Compact default day: today when the visible month is the current month, else the
 * first in-month day with an event, else the 1st; null only for an empty grid. */
export function defaultSelectedDay(cells: DayCell[], todayISO: string): string | null {
  const inMonth = cells.filter((c) => c.inMonth);
  const today = inMonth.find((c) => c.key === todayISO);
  if (today) return today.key;
  return (inMonth.find((c) => c.events.length > 0) ?? inMonth[0])?.key ?? null;
}

/** First in-month event day after `afterKey`, wrapping to the month's first event day;
 * null when the month has no events. */
export function nextEventDay(cells: DayCell[], afterKey: string): string | null {
  const days = cells.filter((c) => c.inMonth && c.events.length > 0).map((c) => c.key);
  if (days.length === 0) return null;
  return days.find((k) => k > afterKey) ?? days[0]!;
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
export function groupByDay(events: ChapterEvent[], todayISO: string): DayGroup[] {
  const groups = new Map<string, DayGroup>();
  for (const ev of [...events].sort(byDateTime)) {
    let group = groups.get(ev.date);
    if (!group) {
      const d = parseISODate(ev.date);
      group = {
        key: ev.date,
        label: dayLabel(d),
        dow: WEEKDAYS[d.getDay()]!.toUpperCase(),
        num: d.getDate(),
        isToday: ev.date === todayISO,
        isPast: ev.date < todayISO,
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
  return `${WEEKDAYS_LONG[d.getDay()]}, ${MONTH_SHORTS[d.getMonth()]} ${d.getDate()}`;
}

/** "Sep 8" (jump-to-next-event pill) */
export function shortDate(iso: string): string {
  const d = parseISODate(iso);
  return `${MONTH_SHORTS[d.getMonth()]} ${d.getDate()}`;
}

/** `{name}` placeholder substitution for translated labels ("{n} events in {month}"). */
export function formatLabel(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

/** "Tuesday, September 8 · 7:00–8:30 PM" */
export function eventWhen(event: Pick<ChapterEvent, "date" | "time">): string {
  const base = dayLabel(parseISODate(event.date));
  return event.time ? `${base} · ${event.time}` : base;
}

/** "Sat, July 4, 2026 · 6:00–8:00 PM" (dialog) */
export function eventDateLine(event: Pick<ChapterEvent, "date" | "time">): string {
  const d = parseISODate(event.date);
  return `${WEEKDAYS[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} · ${event.time}`;
}

export function dateTile(iso: string): { day: string; month: string } {
  const d = parseISODate(iso);
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: MONTH_SHORTS[d.getMonth()]!.toUpperCase(),
  };
}

/** The calendar URL for a state; defaults (month view, current month, all) drop their params. */
export function calendarHref(
  base: string,
  state: CalendarState,
  defaults: { view: "month" | "list"; month: string },
): string {
  const params = new URLSearchParams();
  if (state.view !== defaults.view) params.set("view", state.view);
  if (state.month && state.month !== defaults.month) params.set("month", state.month);
  if (state.category && state.category !== "all") params.set("category", state.category);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}
