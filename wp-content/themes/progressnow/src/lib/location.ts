import { reactive } from "vue";

/* Reactive current-location store (mirrors the lib/events.ts reactive pattern —
 * no Pinia). The client navigation layer (ts/navigation.ts) updates this on every
 * committed navigation so long-lived islands like SiteHeader (which stays mounted
 * across client navs) can react — e.g. active nav state and closing the mobile
 * menu. Seeded synchronously from window.location so the first paint is correct. */
export const location = reactive({
  path: window.location.pathname,
  search: window.location.search,
});

export function setLocation(path: string, search = ""): void {
  location.path = path;
  location.search = search;
}
