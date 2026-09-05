import { MONTH_NAMES, MONTH_SHORTS, parseISODate, WEEKDAYS_LONG } from "@/lib/events";
import { cn } from "@/lib/utils";

/* Event row-link card (openspec events-presentation "Event list rows"; twin
 * of EventCard.vue): brand date tile, 700 title, muted "<when> · <where>",
 * visual outline "View event" pill at md+; mobile = 60px tile + the when line
 * only. The whole row is the link. Server-safe (no hooks). */
export interface EventCardProps {
  event: { title: string; date: string; time: string; location: string; url?: string };
  /** href when the event has no permalink (calendar page) */
  fallbackUrl?: string;
  viewLabel?: string;
  /** 1px subtle shadow (more-events band) instead of the card shadow */
  subtle?: boolean;
}

export function EventCard({
  event,
  fallbackUrl = "/calendar/",
  viewLabel = "View event",
  subtle = false,
}: EventCardProps) {
  const date = parseISODate(event.date);
  const day = String(date.getDate()).padStart(2, "0");
  const month = MONTH_SHORTS[date.getMonth()]!.toUpperCase();
  const base = `${WEEKDAYS_LONG[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
  const when = event.time ? `${base} · ${event.time}` : base;
  return (
    <a
      href={event.url || fallbackUrl}
      aria-label={`${viewLabel}: ${event.title}`}
      className={cn(
        "event-card group grid grid-cols-[60px_1fr] items-center gap-4 rounded-[14px] bg-white p-4 text-ink no-underline transition-shadow hover:shadow-card md:[grid-template-columns:76px_1fr_auto] md:gap-6 md:rounded-[16px] md:px-[22px] md:py-[18px]",
        subtle ? "shadow-subtle" : "shadow-card hover:shadow-card-hover",
      )}
    >
      <span
        aria-hidden="true"
        className="flex flex-col rounded-[10px] bg-brand px-0.5 py-2 text-center text-white md:rounded-[12px] md:px-1 md:py-2.5"
      >
        <span className="text-[1.2rem] font-extrabold leading-[1.1] md:text-[1.4rem]">{day}</span>
        <span className="text-[0.68rem] font-bold tracking-[0.1em] md:text-[0.75rem]">{month}</span>
      </span>
      <span className="flex min-w-0 flex-col gap-[3px] md:gap-1">
        <span className="text-[1.02rem] font-bold leading-[1.3] md:text-[1.18rem]">
          {event.title}
        </span>
        <span className="text-[0.88rem] font-medium text-muted md:text-base">
          {when}
          {event.location ? <span className="hidden md:inline"> · {event.location}</span> : null}
        </span>
      </span>
      <span
        aria-hidden="true"
        className="hidden whitespace-nowrap rounded-full border-2 border-accent px-5 py-[9px] font-display text-[0.88rem] font-normal uppercase tracking-[0.03em] text-accent transition-colors group-hover:bg-accent group-hover:text-white md:inline-block"
      >
        {viewLabel}
      </span>
    </a>
  );
}
