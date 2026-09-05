import { EventCard } from "@/components/site/calendar/EventCard";
import type { ChapterEvent } from "@/lib/schemas";

/* Calendar list view (openspec progress-now-v4-events spec "Event list
 * rows"): the visible month's events as EventCard rows (max-width 900px) and
 * the dashed v4 empty-month state (`cal_empty_*`). */
export function EventListView({
  events,
  fallbackUrl = "/calendar/",
  emptyTitle = "Nothing scheduled this month",
  emptyBody = "Check the next month or subscribe below and never miss one.",
  viewLabel = "View event",
  wpOrigin,
}: {
  /** filtered to the visible month, date-sorted */
  events: ChapterEvent[];
  fallbackUrl?: string;
  emptyTitle?: string;
  emptyBody?: string;
  viewLabel?: string;
  wpOrigin: string;
}) {
  return (
    <div className="event-list-view flex flex-col gap-3" data-calendar-view="list">
      {events.map((ev) => (
        <EventCard
          key={ev.id}
          event={ev}
          fallbackUrl={fallbackUrl}
          viewLabel={viewLabel}
          wpOrigin={wpOrigin}
        />
      ))}
      {events.length === 0 ? (
        <div
          className="flex flex-col items-center gap-1 rounded-[16px] border-2 border-dashed border-border-muted px-6 py-11 text-center md:rounded-[20px] md:px-8 md:py-16"
          data-calendar-empty=""
        >
          <div className="text-[1.05rem] font-extrabold md:text-[1.25rem] md:font-bold">
            {emptyTitle}
          </div>
          <p className="m-0 max-w-[44ch] text-base font-medium leading-[1.45] md:text-[1.2rem]">
            {emptyBody}
          </p>
        </div>
      ) : null}
    </div>
  );
}
