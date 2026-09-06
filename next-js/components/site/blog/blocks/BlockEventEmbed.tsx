import { SiteLink } from "@/components/site/SiteLink";
import { categoryById, eventCategories } from "@/lib/categories";
import { MONTH_SHORTS, parseISODate, WEEKDAYS } from "@/lib/events";
import type { ChapterEvent, EventCategory } from "@/lib/schemas";

const PILL =
  "whitespace-nowrap rounded-full border-2 border-accent px-5 py-2 text-[0.9rem] font-bold text-accent no-underline transition-colors hover:bg-accent hover:text-white";

/* Upcoming-event card inside a post (openspec gutenberg-post-blocks
 * § event_embed). A null event (unpublished / past) renders the calendar
 * fallback so the article never shows a dead reference. */
export function BlockEventEmbed({
  event,
  categories,
  calendarUrl = "/calendar/",
  wpOrigin,
}: {
  event: ChapterEvent | null;
  categories?: EventCategory[] | null;
  calendarUrl?: string;
  wpOrigin: string;
}) {
  if (!event) {
    return (
      <div
        className="block-event-embed grid w-full items-center gap-5 rounded-[16px] bg-alt px-6 py-5 [grid-template-columns:1fr_auto]"
        data-testid="block-event-embed"
        data-empty="true"
      >
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-[0.75rem] font-bold uppercase tracking-[0.06em] text-muted">
            Event
          </span>
          <span
            className="text-[1.05rem] font-bold text-muted"
            data-testid="block-event-embed-empty-text"
          >
            This event is no longer scheduled.
          </span>
        </div>
        <SiteLink
          href={calendarUrl}
          wpOrigin={wpOrigin}
          className={PILL}
          data-testid="block-event-embed-calendar-link"
        >
          See the calendar
        </SiteLink>
      </div>
    );
  }
  const date = parseISODate(event.date);
  const category = categoryById(event.cat, eventCategories(categories));
  return (
    <div
      className="block-event-embed grid w-full items-center gap-5 rounded-[16px] bg-white px-6 py-5 shadow-card [grid-template-columns:auto_1fr] md:[grid-template-columns:72px_1fr_auto]"
      data-testid="block-event-embed"
      data-event-id={event.id}
      data-event-date={event.date}
    >
      <div
        aria-hidden="true"
        className="flex flex-col items-center rounded-[12px] bg-brand px-1 py-2 text-center text-white"
        data-testid="block-event-embed-date-tile"
      >
        <span className="text-[0.7rem] font-bold tracking-[0.1em]">
          {WEEKDAYS[date.getDay()]!.toUpperCase()}
        </span>
        <span className="text-[1.4rem] font-extrabold leading-[1.1]">{date.getDate()}</span>
        <span className="text-[0.7rem] font-bold tracking-[0.1em]">
          {MONTH_SHORTS[date.getMonth()]!.toUpperCase()}
        </span>
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <span
          className="text-[0.75rem] font-bold uppercase tracking-[0.06em] text-brand"
          data-testid="block-event-embed-eyebrow"
        >
          Upcoming event · {category.label}
        </span>
        <span className="text-[1.1rem] font-bold" data-testid="block-event-embed-title">
          {event.title}
        </span>
        <span className="text-[0.9rem] font-medium text-muted" data-testid="block-event-embed-meta">
          {event.time} · {event.location}
        </span>
      </div>
      <SiteLink
        href={event.rsvpUrl ?? event.url ?? calendarUrl}
        wpOrigin={wpOrigin}
        aria-label={`RSVP: ${event.title}`}
        className={`${PILL} col-span-2 justify-self-start md:col-span-1 md:justify-self-auto`}
        data-testid="block-event-embed-action"
      >
        RSVP
      </SiteLink>
    </div>
  );
}
