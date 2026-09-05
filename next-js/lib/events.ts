/* Calendar date helpers (openspec fix-calendar-page-layout D3). Framework-
 * free twin of nuxt-js/app/lib/events.ts minus the reactive category store —
 * categories live in lib/categories.ts and travel as props. Contract types
 * stay in lib/schemas.ts. */
import type { EventCategory } from "@/lib/schemas";

export type { ChapterEvent, EventCategory } from "@/lib/schemas";

export type CalendarView = "month" | "list";

/** `?view=` → a view, else the default. */
export function normalizeView(value: unknown, fallback: CalendarView): CalendarView {
  return value === "month" || value === "list" ? value : fallback;
}

/** `?category=` → a real category id from the list, else "all". */
export function normalizeCategory(value: unknown, categories: EventCategory[]): string {
  return typeof value === "string" && categories.some((c) => c.id === value && c.id !== "all")
    ? value
    : "all";
}

/** Local-time date from ISO yyyy-mm-dd (avoids the UTC shift of new Date(iso)). */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y!, m! - 1, d!);
}

/** yyyy-mm-dd in local time. */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** "yyyy-mm" cache key for a month (0-based). */
export function monthKey(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

/** First and last day of a month (0-based) as ISO dates. */
export function monthRange(year: number, month: number): { from: string; to: string } {
  return {
    from: toISODate(new Date(year, month, 1)),
    to: toISODate(new Date(year, month + 1, 0)),
  };
}

/** Month `offset` months away from `base` (normalizes overflow). */
export function shiftMonth(
  base: { year: number; month: number },
  offset: number,
): { year: number; month: number } {
  const d = new Date(base.year, base.month + offset, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}

/* The server-rendered envelope has no explicit range; treat it as covering
 * [today − 1 month, today + CALENDAR_WINDOW_MONTHS]. Months outside are fetched
 * from the same-origin /api/events proxy. */
export const CALENDAR_WINDOW_MONTHS = 3;

/** Whether the server-loaded window covers a month (0-based). */
export function windowCovers(
  today: string,
  year: number,
  month: number,
  ahead = CALENDAR_WINDOW_MONTHS,
): boolean {
  const t = parseISODate(today);
  const index = year * 12 + month;
  const now = t.getFullYear() * 12 + t.getMonth();
  return index >= now - 1 && index <= now + ahead;
}

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const WEEKDAYS_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export const MONTH_SHORTS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
