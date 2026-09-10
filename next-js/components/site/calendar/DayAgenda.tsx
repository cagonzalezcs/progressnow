import { EventCard } from "@/components/site/calendar/EventCard";
import type { CalendarLabels } from "@/components/site/calendar/labels";
import { dayHeading, formatLabel, shortDate, type DayCell } from "@/lib/calendar";
import { categoryById, eventCategories } from "@/lib/categories";
import type { EventCategory } from "@/lib/schemas";

/* Day agenda (openspec calendar-mobile-day-agenda → events-presentation
 * § Day agenda (compact)): the panel under the compact month grid for the
 * selected day — Bowlby date + count, one agenda card per event, or the
 * dashed "Nothing scheduled" note with "Jump to next event" (first event day
 * after the selection, wrapping; absent when the month is empty) — always
 * closed by "See the whole month as a list". Rendered at every width and
 * hidden from 700px by CSS so SSR markup is width-agnostic; `aria-live`
 * announces the day change without moving focus. */
export function DayAgenda({
  day,
  jumpTo,
  categories,
  showCategoryColors = true,
  fallbackUrl = "/calendar/",
  labels,
  onJump,
  onSeeList,
  wpOrigin,
}: {
  day: DayCell;
  /** target of the jump pill; null when the month has no events */
  jumpTo: string | null;
  categories?: EventCategory[] | null;
  showCategoryColors?: boolean;
  fallbackUrl?: string;
  labels: Pick<
    CalendarLabels,
    | "dayRegionLabel"
    | "noEvents"
    | "eventCountOne"
    | "eventCountOther"
    | "dayEmptyBody"
    | "jumpToNext"
    | "seeMonthList"
    | "viewLabel"
  >;
  onJump: (key: string) => void;
  onSeeList: () => void;
  wpOrigin: string;
}) {
  const palette = eventCategories(categories);
  const count = day.events.length;
  return (
    <div
      role="region"
      aria-live="polite"
      aria-label={labels.dayRegionLabel}
      className="mt-5 flex flex-col gap-3 min-[700px]:hidden"
      data-testid="day-agenda"
      data-date={day.key}
      data-event-count={count}
    >
      <div className="flex items-baseline justify-between gap-3 px-1">
        <h3
          className="m-0 font-display text-[1.1rem] font-normal leading-[1.2] text-ink"
          data-testid="day-agenda-heading"
        >
          {dayHeading(day.key)}
        </h3>
        <span
          className="whitespace-nowrap text-[0.85rem] font-bold text-muted"
          data-testid="day-agenda-count"
        >
          {count === 0
            ? labels.noEvents
            : formatLabel(count === 1 ? labels.eventCountOne : labels.eventCountOther, {
                n: count,
              })}
        </span>
      </div>
      {count ? (
        day.events.map((ev) => {
          const cat = categoryById(ev.cat, palette);
          return (
            <EventCard
              key={ev.id}
              variant="agenda"
              event={ev}
              category={{ label: cat.label, color: showCategoryColors ? cat.color : null }}
              fallbackUrl={fallbackUrl}
              viewLabel={labels.viewLabel}
              wpOrigin={wpOrigin}
            />
          );
        })
      ) : (
        <div
          className="flex flex-col items-start gap-3 rounded-[16px] border-2 border-dashed border-border-muted p-6"
          data-testid="day-agenda-empty"
        >
          <p className="m-0 text-base font-semibold leading-[1.45]">{labels.dayEmptyBody}</p>
          {jumpTo ? (
            <button
              type="button"
              className="cursor-pointer rounded-full border-none bg-brand px-5 py-3 font-display text-[0.85rem] font-normal tracking-[0.03em] text-white transition-colors hover:bg-accent"
              data-testid="day-agenda-jump"
              data-date={jumpTo}
              onClick={() => onJump(jumpTo)}
            >
              {formatLabel(labels.jumpToNext, { date: shortDate(jumpTo) })}
            </button>
          ) : null}
        </div>
      )}
      <button
        type="button"
        className="cursor-pointer self-start border-none bg-transparent px-1 py-2 text-[0.92rem] font-bold text-accent underline-offset-4 hover:underline"
        data-testid="day-agenda-see-list"
        onClick={onSeeList}
      >
        {labels.seeMonthList}
      </button>
    </div>
  );
}
