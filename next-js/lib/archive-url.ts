/* URL state of the posts index (openspec next-headless-site § Interactive
 * archive and calendar; blog-presentation § Post grid and pagination,
 * § Filtered results mode). The URL is the state: browse pages are the real
 * WordPress permalinks (`/blog/page/N/`), filtered states use `?s=`,
 * `?category=`, `?paged=`. Pure and unit-tested. */
export interface ArchiveState {
  s?: string;
  category?: string;
  page?: number;
}

/** `/es/blog/page/3/` → `/es/blog/`; `/category/labor/` stays a valid base for filters. */
export function archiveBase(pathname: string): string {
  const base = pathname.replace(/page\/\d+\/?$/, "");
  return base.endsWith("/") ? base : `${base}/`;
}

export function isBrowse(state: ArchiveState): boolean {
  return !(state.s ?? "").trim() && (!state.category || state.category === "all");
}

export function archiveHref(base: string, state: ArchiveState): string {
  const s = (state.s ?? "").trim();
  const category = state.category && state.category !== "all" ? state.category : "";
  const page = state.page && state.page > 1 ? state.page : 1;
  const root = archiveBase(base);
  if (isBrowse(state)) return page > 1 ? `${root}page/${page}/` : root;
  const params = new URLSearchParams();
  if (s) params.set("s", s);
  if (category) params.set("category", category);
  if (page > 1) params.set("paged", String(page));
  return `${root}?${params.toString()}`;
}

/** Numbered pages with a window around the current page (≤ 7 items). */
export function pageItems(total: number, current: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items: (number | "…")[] = [1];
  const lo = Math.max(2, current - 1);
  const hi = Math.min(total - 1, current + 1);
  if (lo > 2) items.push("…");
  for (let i = lo; i <= hi; i++) items.push(i);
  if (hi < total - 1) items.push("…");
  items.push(total);
  return items;
}
