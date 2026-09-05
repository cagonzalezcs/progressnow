import type { Router } from "vue-router";
import { location } from "@/lib/location";

/* URL-state adapter for the interactive islands (BlogArchive, EventCalendar):
 * they read their initial search/filter/page from the URL and write it back
 * as the user interacts. The theme's copy of this module talks to
 * `window.history`; this one goes through the Nuxt router so `route.query`
 * never desyncs from the address bar. Both expose the same three functions,
 * so the component source stays identical. */

let router: Router | null = null;

/** Called once by plugins/navigation.client.ts. */
export function installUrlStateRouter(instance: Router): void {
  router = instance;
}

export function currentSearch(): string {
  if (location.search) return location.search;
  if (typeof window !== "undefined") return window.location.search;
  return "";
}

export function currentPathname(): string {
  if (location.path) return location.path;
  if (typeof window !== "undefined") return window.location.pathname;
  return "/";
}

/** Replace the current entry's query string (no navigation, no scroll). */
export function replaceSearch(params: URLSearchParams): void {
  const query: Record<string, string> = {};
  for (const [k, v] of params) query[k] = v;
  if (router) {
    void router.replace({ path: currentPathname(), query, hash: router.currentRoute.value.hash });
    return;
  }
  if (typeof window !== "undefined") {
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  }
}
