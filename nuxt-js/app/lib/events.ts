import { reactive } from "vue";
import categoriesJson from "../../categories.json";
import type { EventCategory } from "@/lib/schemas";

/* Contract types live in lib/schemas.ts (zod, one definition point). */
export type {
  ChapterEvent,
  EventBlock,
  EventCategory,
  EventContact,
  RelatedEvent,
  SingleEventData,
} from "@/lib/schemas";

/* Default categories come from the canonical registry (categories.json at
 * the theme root — shared with PHP and drift-tested against the
 * --color-cat-* tokens in tailwind.css); WP term meta overrides them at
 * island mount via setCategories(). */
const DEFAULT_CATEGORIES: EventCategory[] = categoriesJson;

/* Reactive category store. Index 0 is always the "All events" pseudo-category
 * (owned by the store); the rest default to the registry palette until an
 * island passes WP-driven categories. */
export const EVENT_CATEGORIES: EventCategory[] = reactive([
  { id: "all", label: "All events", color: null },
  ...DEFAULT_CATEGORIES,
]);

/** Replace the six real categories (the store keeps its own "all" pseudo). */
export function setCategories(cats: EventCategory[]): void {
  const real = cats.filter((c) => c.id !== "all");
  if (real.length === 0) return;
  EVENT_CATEGORIES.splice(1, EVENT_CATEGORIES.length - 1, ...real);
}

export function categoryById(id: string): EventCategory {
  return EVENT_CATEGORIES.find((c) => c.id === id) ?? EVENT_CATEGORIES[0];
}

/** #RRGGBB → rgba() with the given alpha; passes non-hex strings through. */
export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Local-time date from ISO yyyy-mm-dd (avoids UTC shift of new Date(iso)). */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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
