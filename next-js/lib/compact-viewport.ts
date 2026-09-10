import { useSyncExternalStore } from "react";

/* The calendar's compact breakpoint as a runtime flag (openspec
 * calendar-mobile-day-agenda, design "compact is a runtime media flag"): under
 * 700px a day control selects the day instead of opening its event. Only
 * activation semantics and `aria-pressed` read it — dots, the agenda panel and
 * the grouped list are toggled by CSS so SSR / no-JS markup is width-agnostic.
 * Server snapshot and environments without matchMedia (jsdom) read as desktop. */
export const COMPACT_CALENDAR_QUERY = "(max-width: 699.98px)";

function media(): MediaQueryList | null {
  return typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia(COMPACT_CALENDAR_QUERY)
    : null;
}

function subscribe(listener: () => void): () => void {
  const mq = media();
  if (!mq) return () => {};
  mq.addEventListener("change", listener);
  return () => mq.removeEventListener("change", listener);
}

const getSnapshot = () => media()?.matches ?? false;
const getServerSnapshot = () => false;

export function useCompactCalendar(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
