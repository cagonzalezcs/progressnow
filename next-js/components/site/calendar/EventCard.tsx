import { SiteLink } from "@/components/site/SiteLink";
import { dateTile, eventWhen } from "@/lib/calendar";
import { cn } from "@/lib/utils";

/* Event row-link card (openspec progress-now-v4-events D3, spec "Event list
 * rows"): the one row used by the calendar list view and the single event's
 * "More upcoming events" band. Brand date tile, 700 title, muted "<when> ·
 * <where>", and a visual outline "View event" pill at md+; mobile = 60px tile
 * + the when line only. The whole row is the link. */
export function EventCard({
  event,
  fallbackUrl = "/calendar/",
  viewLabel = "View event",
  subtle = false,
  wpOrigin,
}: {
  event: { title: string; date: string; time: string; location: string; url?: string };
  /** fallback href when the event has no permalink (calendar page) */
  fallbackUrl?: string;
  viewLabel?: string;
  /** 1px subtle shadow (more-events band) instead of the card shadow */
  subtle?: boolean;
  wpOrigin: string;
}) {
  const tile = dateTile(event.date);
  return (
    <SiteLink
      href={event.url || fallbackUrl}
      wpOrigin={wpOrigin}
      aria-label={`${viewLabel}: ${event.title}`}
      data-testid="event-card"
      data-event-date={event.date}
      className={cn(
        "event-card group grid grid-cols-[60px_1fr] items-center gap-4 rounded-[14px] bg-white p-4 text-ink no-underline transition-shadow hover:shadow-card md:gap-6 md:rounded-[16px] md:px-[22px] md:py-[18px] md:[grid-template-columns:76px_1fr_auto]",
        subtle ? "shadow-subtle" : "shadow-card hover:shadow-card-hover",
      )}
    >
      <span
        aria-hidden="true"
        className="flex flex-col rounded-[10px] bg-brand px-0.5 py-2 text-center text-white md:rounded-[12px] md:px-1 md:py-2.5"
        data-testid="event-card-date-tile"
      >
        <span
          className="text-[1.2rem] font-extrabold leading-[1.1] md:text-[1.4rem]"
          data-testid="event-card-day"
        >
          {tile.day}
        </span>
        <span
          className="text-[0.68rem] font-bold tracking-[0.1em] md:text-[0.75rem]"
          data-testid="event-card-month"
        >
          {tile.month}
        </span>
      </span>
      <span className="flex min-w-0 flex-col gap-[3px] md:gap-1">
        <span
          className="text-[1.02rem] font-bold leading-[1.3] md:text-[1.18rem]"
          data-testid="event-card-title"
        >
          {event.title}
        </span>
        <span
          className="text-[0.88rem] font-medium text-muted md:text-base"
          data-testid="event-card-meta"
        >
          {eventWhen(event)}
          {event.location ? (
            <span className="hidden md:inline" data-testid="event-card-location">
              {" "}
              · {event.location}
            </span>
          ) : null}
        </span>
      </span>
      <span
        aria-hidden="true"
        className="hidden whitespace-nowrap rounded-full border-2 border-accent px-5 py-[9px] font-display text-[0.88rem] font-normal uppercase tracking-[0.03em] text-accent transition-colors group-hover:bg-accent group-hover:text-white md:inline-block"
        data-testid="event-card-view-pill"
      >
        {viewLabel}
      </span>
    </SiteLink>
  );
}
