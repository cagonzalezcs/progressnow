/* URL-state adapter for the interactive islands (BlogArchive, EventCalendar):
 * they read their initial search/filter/page from the URL and write it back
 * as the user interacts. This copy talks to `window.history` (the islands run
 * client-only); site/app/lib/url-state.ts is the Nuxt-router twin with the
 * same three functions, so the component source is shared unchanged. */

export function currentSearch(): string {
  return typeof window !== "undefined" ? window.location.search : "";
}

export function currentPathname(): string {
  return typeof window !== "undefined" ? window.location.pathname : "/";
}

/** Replace the current entry's query string (no navigation, no scroll). */
export function replaceSearch(params: URLSearchParams): void {
  if (typeof window === "undefined") return;
  const qs = params.toString();
  window.history.replaceState(
    null,
    "",
    qs ? `${window.location.pathname}?${qs}` : window.location.pathname,
  );
}
