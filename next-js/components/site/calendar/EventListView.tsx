import { EventCard } from "@/components/site/calendar/EventCard";
import { DEFAULT_CALENDAR_LABELS, type CalendarLabels } from "@/components/site/calendar/labels";
import { formatLabel, groupByDay } from "@/lib/calendar";
import { categoryById, eventCategories } from "@/lib/categories";
import type { ChapterEvent, EventCategory } from "@/lib/schemas";
import { cn } from "@/lib/utils";

/* Calendar list view (openspec progress-now-v4-events spec "Event list rows",
 * regrouped by openspec calendar-mobile-day-agenda): the visible month's
 * events as day groups (max-width 900px) — a summary row ("9 events in
 * September", counting hidden past days too) with the "Show N past" / "Hide
 * past events" toggle, then per day a sticky decorative date badge (brand /
 * ink + TODAY tag / alt for past) beside an h3 date heading and agenda cards.
 * Days before today stay hidden until toggled and render faded. The dashed v4
 * empty-month state (`cal_empty_*`) is unchanged. */
type ListLabels = Pick<
  CalendarLabels,
  "listSummaryOne" | "listSummaryOther" | "showPast" | "hidePast" | "todayTag"
>;

export function EventListView({
  events,
  todayISO,
  monthName,
  showPast = false,
  onTogglePast,
  categories,
  showCategoryColors = true,
  fallbackUrl = "/calendar/",
  emptyTitle = "Nothing scheduled this month",
  emptyBody = "Check the next month or subscribe below and never miss one.",
  viewLabel = "View event",
  labels = DEFAULT_CALENDAR_LABELS,
  wpOrigin,
}: {
  /** filtered to the visible month, date-sorted */
  events: ChapterEvent[];
  /** yyyy-mm-dd — days before it are "past" */
  todayISO: string;
  /** "September" (summary row) */
  monthName: string;
  showPast?: boolean;
  onTogglePast?: () => void;
  categories?: EventCategory[] | null;
  showCategoryColors?: boolean;
  fallbackUrl?: string;
  emptyTitle?: string;
  emptyBody?: string;
  viewLabel?: string;
  labels?: ListLabels;
  wpOrigin: string;
}) {
  const palette = eventCategories(categories);
  const groups = groupByDay(events, todayISO);
  const pastCount = groups.filter((g) => g.isPast).reduce((n, g) => n + g.events.length, 0);
  const visible = showPast ? groups : groups.filter((g) => !g.isPast);
  return (
    <div
      className="event-list-view flex flex-col gap-3"
      data-calendar-view="list"
      data-testid="event-list-view"
      data-show-past={showPast}
    >
      {events.length > 0 ? (
        <div
          className="flex items-baseline justify-between gap-3 px-1 pb-1"
          data-testid="event-list-summary-row"
        >
          <p className="m-0 text-[0.85rem] font-bold text-muted" data-testid="event-list-summary">
            {formatLabel(events.length === 1 ? labels.listSummaryOne : labels.listSummaryOther, {
              n: events.length,
              month: monthName,
            })}
          </p>
          {pastCount > 0 ? (
            <button
              type="button"
              aria-pressed={showPast}
              className="cursor-pointer border-none bg-transparent p-1 text-[0.85rem] font-bold text-accent underline-offset-4 hover:underline"
              data-testid="event-list-past-toggle"
              data-past-count={pastCount}
              onClick={onTogglePast}
            >
              {showPast ? labels.hidePast : formatLabel(labels.showPast, { n: pastCount })}
            </button>
          ) : null}
        </div>
      ) : null}
      {visible.map((group) => (
        <div
          key={group.key}
          className="grid grid-cols-[56px_1fr] items-start gap-3.5"
          data-testid="event-list-day"
          data-date={group.key}
          data-past={group.isPast}
          data-today={group.isToday}
        >
          <div
            aria-hidden="true"
            className={cn(
              "sticky top-[76px] flex flex-col items-center gap-0.5 rounded-[12px] px-1 py-2",
              group.isToday
                ? "bg-ink text-white"
                : group.isPast
                  ? "bg-alt text-muted"
                  : "bg-brand text-white",
            )}
            data-testid="event-list-day-badge"
          >
            <span className="text-[0.66rem] font-extrabold uppercase tracking-[0.1em]">
              {group.dow}
            </span>
            <span className="font-display text-[1.35rem] font-normal leading-none">
              {group.num}
            </span>
            {group.isToday ? (
              <span
                className="mt-0.5 rounded-full bg-yellow px-1.5 py-0.5 text-[0.58rem] font-extrabold tracking-[0.08em] text-ink"
                data-testid="event-list-today-tag"
              >
                {labels.todayTag}
              </span>
            ) : null}
          </div>
          <div className="flex min-w-0 flex-col gap-2.5">
            <h3
              className="m-0 pt-1.5 text-[0.85rem] font-bold uppercase tracking-[0.04em] text-muted"
              data-testid="event-list-day-heading"
            >
              {group.label}
            </h3>
            {group.events.map((ev) => {
              const cat = categoryById(ev.cat, palette);
              return (
                <EventCard
                  key={ev.id}
                  variant="agenda"
                  event={ev}
                  category={{ label: cat.label, color: showCategoryColors ? cat.color : null }}
                  past={group.isPast}
                  fallbackUrl={fallbackUrl}
                  viewLabel={viewLabel}
                  wpOrigin={wpOrigin}
                />
              );
            })}
          </div>
        </div>
      ))}
      {events.length === 0 ? (
        <div
          className="flex flex-col items-center gap-1 rounded-[16px] border-2 border-dashed border-border-muted px-6 py-11 text-center md:rounded-[20px] md:px-8 md:py-16"
          data-calendar-empty=""
          data-testid="event-list-empty"
        >
          <div
            className="text-[1.05rem] font-extrabold md:text-[1.25rem] md:font-bold"
            data-testid="event-list-empty-title"
          >
            {emptyTitle}
          </div>
          <p
            className="m-0 max-w-[44ch] text-base font-medium leading-[1.45] md:text-[1.2rem]"
            data-testid="event-list-empty-body"
          >
            {emptyBody}
          </p>
        </div>
      ) : null}
    </div>
  );
}
