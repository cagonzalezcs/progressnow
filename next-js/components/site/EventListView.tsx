import { EventCard } from "@/components/site/EventCard";
import type { ChapterEvent } from "@/lib/events";

/* Calendar list view (openspec events-presentation "Event list rows"; twin of
 * EventListView.vue): the visible month's events as EventCard rows and the
 * dashed empty-month state. */
export function EventListView({
  events,
  fallbackUrl = "/calendar/",
  emptyTitle = "Nothing scheduled this month",
  emptyBody = "Check the next month or subscribe below and never miss one.",
  viewLabel = "View event",
}: {
  /** filtered to the visible month, date-sorted */
  events: ChapterEvent[];
  fallbackUrl?: string;
  emptyTitle?: string;
  emptyBody?: string;
  viewLabel?: string;
}) {
  return (
    <div className="event-list-view flex flex-col gap-3">
      {events.map((ev) => (
        <EventCard key={ev.id} event={ev} fallbackUrl={fallbackUrl} viewLabel={viewLabel} />
      ))}
      {events.length === 0 ? (
        <div
          data-empty="month"
          className="flex flex-col items-center gap-1 rounded-[16px] border-2 border-dashed border-border-muted px-6 py-11 text-center md:rounded-[20px] md:px-8 md:py-16"
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
