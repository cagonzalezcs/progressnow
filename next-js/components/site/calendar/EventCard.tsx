import { SiteLink } from "@/components/site/SiteLink";
import { dateTile, eventWhen } from "@/lib/calendar";
import { MONTH_NAMES, parseISODate } from "@/lib/events";
import { cn } from "@/lib/utils";

/* Event row-link card (openspec progress-now-v4-events D3, spec "Event list
 * rows"): the one row used by the calendar list view and the single event's
 * "More upcoming events" band. Brand date tile, 700 title, muted "<when> ·
 * <where>", and a visual outline "View event" pill at md+; mobile = 60px tile
 * + the when line only. The whole row is the link.
 * `variant="agenda"` (openspec calendar-mobile-day-agenda, spec "Agenda card")
 * is the day-agenda / grouped-list recipe: 6px category bar, title,
 * "<time> · <where>", uppercase category label and an arrow — the day is
 * carried by the surrounding heading, so the tile is dropped. Past-day cards
 * render at .6 opacity with ink text so every line stays ≥ 4.5:1. */
export function EventCard({
  event,
  fallbackUrl = "/calendar/",
  viewLabel = "View event",
  subtle = false,
  variant = "row",
  category,
  past = false,
  wpOrigin,
}: {
  event: { title: string; date: string; time: string; location: string; url?: string };
  /** fallback href when the event has no permalink (calendar page) */
  fallbackUrl?: string;
  viewLabel?: string;
  /** 1px subtle shadow (more-events band) instead of the card shadow */
  subtle?: boolean;
  variant?: "row" | "agenda";
  /** resolved term for the agenda bar + label (color null → brand) */
  category?: { label: string; color?: string | null } | null;
  /** agenda variant: the day is before today (grouped list "Show past") */
  past?: boolean;
  wpOrigin: string;
}) {
  if (variant === "agenda") {
    const d = parseISODate(event.date);
    const muted = past ? "text-ink" : "text-muted";
    return (
      <SiteLink
        href={event.url || fallbackUrl}
        wpOrigin={wpOrigin}
        aria-label={`${viewLabel}: ${event.title}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`}
        data-testid="event-card"
        data-variant="agenda"
        data-event-date={event.date}
        data-past={past || undefined}
        className={cn(
          "event-card grid grid-cols-[6px_1fr_auto] gap-3.5 rounded-[14px] bg-white py-3.5 pl-3.5 pr-4 text-ink no-underline shadow-card transition-shadow hover:shadow-card-hover",
          past && "opacity-60",
        )}
      >
        <span
          aria-hidden="true"
          className="w-1.5 self-stretch rounded-full bg-brand"
          style={category?.color ? { backgroundColor: category.color } : undefined}
          data-testid="event-card-category-bar"
        />
        <span className="flex min-w-0 flex-col gap-1">
          <span className="text-[1.02rem] font-bold leading-[1.3]" data-testid="event-card-title">
            {event.title}
          </span>
          <span className={cn("text-[0.88rem] font-medium", muted)} data-testid="event-card-meta">
            {event.time}
            {event.location ? (
              <span data-testid="event-card-location"> · {event.location}</span>
            ) : null}
          </span>
          {category?.label ? (
            <span
              className={cn("text-[0.75rem] font-bold uppercase tracking-[0.06em]", muted)}
              data-testid="event-card-category"
            >
              {category.label}
            </span>
          ) : null}
        </span>
        <span
          aria-hidden="true"
          className="self-center text-[1.1rem] font-extrabold text-brand"
          data-testid="event-card-arrow"
        >
          →
        </span>
      </SiteLink>
    );
  }

  const tile = dateTile(event.date);
  return (
    <SiteLink
      href={event.url || fallbackUrl}
      wpOrigin={wpOrigin}
      aria-label={`${viewLabel}: ${event.title}`}
      data-testid="event-card"
      data-variant="row"
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
