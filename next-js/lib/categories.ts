import categoriesJson from "@/categories.json";
import type { EventCategory } from "@/lib/schemas";

/* Category registry (openspec next-design-system § Shared contracts and
 * category registry). Defaults come from the drift-guarded categories.json;
 * `/site.categories` overrides them per request. Framework-free: server
 * components pass the resolved list down as props. */
export const DEFAULT_CATEGORIES: EventCategory[] = categoriesJson;

export const ALL_EVENTS: EventCategory = { id: "all", label: "All events", color: null };
export const ALL_POSTS: EventCategory = { id: "all", label: "All posts", color: null };

/** Six real categories: WordPress overrides when present, else the registry. */
export function resolveCategories(fromSite?: EventCategory[] | null): EventCategory[] {
  const real = (fromSite ?? []).filter((c) => c.id !== "all");
  return real.length ? real : DEFAULT_CATEGORIES;
}

export function eventCategories(fromSite?: EventCategory[] | null): EventCategory[] {
  return [ALL_EVENTS, ...resolveCategories(fromSite)];
}

export function postCategories(fromSite?: EventCategory[] | null): EventCategory[] {
  return [ALL_POSTS, ...resolveCategories(fromSite)];
}

export function categoryById(id: string, list: EventCategory[]): EventCategory {
  return list.find((c) => c.id === id) ?? list[0]!;
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
