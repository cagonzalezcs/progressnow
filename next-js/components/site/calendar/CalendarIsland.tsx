"use client";

import { lazy, Suspense, type ComponentProps } from "react";

/* Code-split boundary for the calendar island. A dynamic import inside the
 * client graph is a real split point for the bundler, so the island's chunk is
 * requested only on calendar pages instead of riding along in the shared page
 * chunks every route (and the front-page budget) pays for. Still server-
 * rendered: React streams lazy components. */
const EventCalendar = lazy(() =>
  import("@/components/site/calendar/EventCalendar").then((m) => ({ default: m.EventCalendar })),
);

export type CalendarIslandProps = ComponentProps<typeof EventCalendar>;

export function CalendarIsland(props: CalendarIslandProps) {
  return (
    <Suspense fallback={null}>
      <EventCalendar {...props} />
    </Suspense>
  );
}
