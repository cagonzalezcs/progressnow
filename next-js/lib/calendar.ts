import { MONTH_NAMES, MONTH_SHORTS, parseISODate, toISODate, WEEKDAYS } from "@/lib/events";
import type { ChapterEvent } from "@/lib/schemas";

/* Pure calendar helpers (openspec next-headless-site § Interactive archive and
 * calendar; twin of the computed values in the Nuxt EventCalendar/MonthGrid).
 * Month math is local-time and framework-free so the server can render the
 * requested month and the client can page through it without re-deriving. */

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

export function eventsInMonth(events: ChapterEvent[], ym: YearMonth): ChapterEvent[] {
  const key = monthKey(ym);
  return events
    .filter((e) => e.date.startsWith(key))
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
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
  events: ChapterEvent[];
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
    out.push({
      key,
      num: d.getDate(),
      inMonth: d.getMonth() === ym.month,
      isToday: key === todayISO,
      label: `${WEEKDAYS_LONG[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`,
      events: byDate.get(key) ?? [],
    });
  }
  return out;
}

/** "Tuesday, September 8 · 7:00–8:30 PM" */
export function eventWhen(event: Pick<ChapterEvent, "date" | "time">): string {
  const d = parseISODate(event.date);
  const base = `${WEEKDAYS_LONG[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
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
