"use client";

import { useEffect, useRef, useState } from "react";
import { EventDetailDialog } from "@/components/site/EventDetailDialog";
import { EventListView } from "@/components/site/EventListView";
import { MonthGrid } from "@/components/site/MonthGrid";
import {
  type CalendarView,
  type ChapterEvent,
  type EventCategory,
  MONTH_NAMES,
  monthKey,
  monthRange,
  normalizeCategory,
  normalizeView,
  parseISODate,
  shiftMonth,
  windowCovers,
} from "@/lib/events";
import type { EventsEnvelope } from "@/lib/schemas";
import { cn } from "@/lib/utils";

/* Calendar island (openspec fix-calendar-page-layout D1–D4; twin of
 * EventCalendar.vue). The server passes the events window, resolved
 * categories, `today` and the initial `?view=` / `?category=` as props, so the
 * first paint is complete HTML. Month nav, view and filter are client state;
 * view/category are written back with history.replaceState (Next syncs its
 * router from it). Months outside the loaded window are fetched from the
 * same-origin /api/events proxy with a skeleton + role=status, and the ICS
 * link survives a failed fetch. */
export interface CalendarLabels {
  monthLabelText: string;
  listLabelText: string;
  filterLabelText: string;
  allEventsText: string;
  viewLabel: string;
  emptyTitle: string;
  emptyBody: string;
  icsLabel: string;
  loadingText: string;
  errorTitle: string;
  retryText: string;
}

export const DEFAULT_LABELS: CalendarLabels = {
  monthLabelText: "Month",
  listLabelText: "List",
  filterLabelText: "Filter:",
  allEventsText: "All events",
  viewLabel: "View event",
  emptyTitle: "Nothing scheduled this month",
  emptyBody: "Check the next month or subscribe below and never miss one.",
  icsLabel: "iCal / .ics",
  loadingText: "Loading events…",
  errorTitle: "We couldn’t load the calendar",
  retryText: "Retry",
};

export interface EventCalendarProps {
  lang: string;
  events: ChapterEvent[];
  /** "All events" first, then the six real categories (lib/categories.ts) */
  categories: EventCategory[];
  /** ISO yyyy-mm-dd decided on the server (hydration-stable) */
  today: string;
  initialView?: CalendarView;
  initialCategory?: string;
  /** Test seam: start on this month instead of `today`'s. */
  initialMonth?: { year: number; month: number };
  defaultView?: CalendarView;
  showCategoryColors?: boolean;
  icsUrl?: string;
  fallbackUrl?: string;
  labels?: Partial<CalendarLabels>;
}

const NAV_BTN =
  "inline-flex size-11 flex-none cursor-pointer items-center justify-center rounded-full border-2 border-control bg-white p-0 text-[1.1rem] font-extrabold text-ink transition-colors hover:border-accent hover:bg-accent hover:text-white";
const SEG_BTN =
  "cursor-pointer rounded-full border-none px-[22px] py-[9px] font-display text-[0.9rem] font-normal tracking-[0.03em] transition-colors";
const CHIP =
  "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-[0.85rem] font-bold leading-[1.5] transition-colors";

export function EventCalendar({
  lang,
  events: seed,
  categories,
  today,
  initialView,
  initialCategory,
  initialMonth,
  defaultView = "month",
  showCategoryColors = true,
  icsUrl = "#",
  fallbackUrl = "/calendar/",
  labels: labelOverrides,
}: EventCalendarProps) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const todayDate = parseISODate(today);
  const base = initialMonth ?? { year: todayDate.getFullYear(), month: todayDate.getMonth() };

  const [offset, setOffset] = useState(0);
  const [view, setView] = useState<CalendarView>(normalizeView(initialView, defaultView));
  const [activeCat, setActiveCat] = useState(normalizeCategory(initialCategory, categories));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [opener, setOpener] = useState<HTMLElement | null>(null);
  const select = (id: string) => {
    setOpener(document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setSelectedId(id);
  };
  const visible = shiftMonth(base, offset);
  const key = monthKey(visible.year, visible.month);

  /* ---- URL state: view + category (defaults are removed, not written) ---- */
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const url = new URL(window.location.href);
    if (view === defaultView) url.searchParams.delete("view");
    else url.searchParams.set("view", view);
    if (activeCat === "all") url.searchParams.delete("category");
    else url.searchParams.set("category", activeCat);
    window.history.replaceState(window.history.state, "", url);
  }, [view, activeCat, defaultView]);

  /* ---- month cache: seeded from the server window, extended per month.
   * `loading` is derived (not cached and not failed), so the effect only
   * performs the fetch and records its outcome. ---- */
  const [extra, setExtra] = useState<Record<string, ChapterEvent[]>>({});
  const [failedKeys, setFailedKeys] = useState<Record<string, true>>({});
  const inWindow = windowCovers(today, visible.year, visible.month);
  const cached = inWindow || key in extra;
  const failed = !cached && failedKeys[key] === true;
  const loading = !cached && !failed;

  useEffect(() => {
    if (!loading) return;
    const controller = new AbortController();
    const { from, to } = monthRange(visible.year, visible.month);
    const params = new URLSearchParams({ lang, from, to });
    fetch(`/api/events?${params}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`events ${res.status}`);
        const envelope = (await res.json()) as EventsEnvelope;
        setExtra((prev) => ({ ...prev, [key]: envelope.events }));
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setFailedKeys((prev) => ({ ...prev, [key]: true }));
      });
    return () => controller.abort();
  }, [loading, key, lang, visible.year, visible.month]);

  const merged = new Map<string, ChapterEvent>();
  for (const ev of seed) merged.set(ev.id, ev);
  for (const list of Object.values(extra)) for (const ev of list) merged.set(ev.id, ev);
  const all = [...merged.values()];
  const filtered = all.filter((e) => activeCat === "all" || e.cat === activeCat);
  const monthEvents = filtered
    .filter((e) => {
      const d = parseISODate(e.date);
      return d.getFullYear() === visible.year && d.getMonth() === visible.month;
    })
    .sort((a, b) => a.date.localeCompare(b.date));
  const selectedEvent = all.find((e) => e.id === selectedId) ?? null;
  const monthLabel = `${MONTH_NAMES[visible.month]} ${visible.year}`;
  const retry = () =>
    setFailedKeys((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

  return (
    <div className="event-calendar" data-calendar-view={view} data-testid="event-calendar">
      {/* Toolbar: month nav + Month/List segmented control */}
      <section
        className="bg-white px-6 pt-7 md:pt-10"
        data-tone="white"
        data-testid="event-calendar-toolbar"
      >
        <div className="mx-auto flex max-w-[1200px] flex-col gap-5">
          <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-5">
            <div className="flex items-center justify-between gap-2.5 md:justify-start md:gap-3.5">
              <button
                type="button"
                aria-label="Previous month"
                className={NAV_BTN}
                data-testid="event-calendar-prev-month"
                onClick={() => setOffset((o) => o - 1)}
              >
                ←
              </button>
              <div
                aria-live="polite"
                data-month-label=""
                data-testid="event-calendar-month-label"
                className="text-center font-display text-[1.25rem] md:min-w-[280px] md:text-[clamp(1.3rem,2.4vw,1.8rem)]"
              >
                {monthLabel}
              </div>
              <button
                type="button"
                aria-label="Next month"
                className={NAV_BTN}
                data-testid="event-calendar-next-month"
                onClick={() => setOffset((o) => o + 1)}
              >
                →
              </button>
            </div>

            <div
              role="group"
              aria-label="View"
              className="flex items-center gap-0.5 self-center rounded-full bg-alt p-1 md:self-auto"
              data-testid="event-calendar-view-switch"
            >
              {(["month", "list"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={view === v}
                  className={cn(
                    SEG_BTN,
                    view === v
                      ? "bg-brand text-white"
                      : "bg-transparent text-ink hover:bg-control-faint",
                  )}
                  data-testid="event-calendar-view-option"
                  data-view={v}
                  onClick={() => setView(v)}
                >
                  {v === "month" ? labels.monthLabelText : labels.listLabelText}
                </button>
              ))}
            </div>
          </div>

          {/* Category filter chips: "All events" + one per term, swatch dot in term color */}
          <div
            role="group"
            aria-label={labels.filterLabelText}
            className="flex flex-wrap items-center gap-2"
            data-testid="event-calendar-filters"
          >
            <span className="mr-1.5 font-display text-[0.82rem] font-bold uppercase tracking-[0.06em] text-muted">
              {labels.filterLabelText}
            </span>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                aria-pressed={activeCat === cat.id}
                className={cn(
                  CHIP,
                  activeCat === cat.id
                    ? "border-ink bg-ink text-white"
                    : "border-control bg-white text-ink hover:border-ink",
                )}
                data-testid="event-calendar-filter-option"
                data-category={cat.id}
                onClick={() => setActiveCat(cat.id)}
              >
                {showCategoryColors && cat.color ? (
                  <span
                    aria-hidden="true"
                    className="inline-block size-2.5 flex-none rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                ) : null}
                {cat.id === "all" ? labels.allEventsText : cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {loading ? (
        <section
          className="bg-white px-4 pb-8 pt-5 min-[700px]:px-6 md:pb-14 md:pt-7"
          data-tone="white"
        >
          <CalendarSkeleton />
          <p
            role="status"
            className="mx-auto mt-3.5 max-w-[1200px] text-[0.9rem] font-medium text-muted"
            data-testid="event-calendar-loading"
          >
            {labels.loadingText}
          </p>
        </section>
      ) : failed ? (
        <section className="bg-white px-6 pb-10 pt-5 md:pb-14 md:pt-7" data-tone="white">
          <div className="mx-auto max-w-[900px]">
            <div
              role="alert"
              className="flex flex-col items-center gap-1 rounded-[16px] border-2 border-dashed border-border-muted px-6 py-11 text-center md:rounded-[20px] md:px-8 md:py-16"
              data-testid="event-calendar-error"
            >
              <div className="text-[1.05rem] font-extrabold md:text-[1.25rem] md:font-bold">
                {labels.errorTitle}
              </div>
              <p className="m-0 max-w-[44ch] text-base font-medium leading-[1.45] md:text-[1.2rem]">
                Try again in a moment — or subscribe with{" "}
                <a
                  href={icsUrl}
                  className="font-bold text-accent underline underline-offset-4 hover:text-brand-deep"
                  data-testid="event-calendar-error-ics-link"
                >
                  {labels.icsLabel}
                </a>{" "}
                and get every event straight in your own calendar.
              </p>
              <button
                type="button"
                className="mt-4 cursor-pointer rounded-full border-2 border-accent bg-transparent px-6 py-2.5 text-[0.92rem] font-bold text-accent transition-colors hover:bg-accent hover:text-white"
                data-testid="event-calendar-retry"
                onClick={retry}
              >
                {labels.retryText}
              </button>
            </div>
          </div>
        </section>
      ) : view === "month" ? (
        <section
          className="bg-white px-4 pb-8 pt-5 min-[700px]:px-6 md:pb-14 md:pt-7"
          data-tone="white"
        >
          <div className="mx-auto max-w-[1200px]">
            <MonthGrid
              key={key}
              year={visible.year}
              month={visible.month}
              today={today}
              events={filtered}
              categories={categories}
              showCategoryColors={showCategoryColors}
              onSelect={select}
            />
          </div>
        </section>
      ) : (
        <section className="bg-white px-6 pb-10 pt-5 md:pb-14 md:pt-7" data-tone="white">
          <div className="mx-auto max-w-[900px]">
            <EventListView
              events={monthEvents}
              fallbackUrl={fallbackUrl}
              viewLabel={labels.viewLabel}
              emptyTitle={labels.emptyTitle}
              emptyBody={labels.emptyBody}
            />
          </div>
        </section>
      )}

      <EventDetailDialog
        event={selectedEvent}
        categories={categories}
        showCategoryColors={showCategoryColors}
        fallbackUrl={fallbackUrl}
        viewLabel={labels.viewLabel}
        returnFocusTo={opener}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}

/** Grid-shaped placeholder: the island's out-of-window fetch and the route's Suspense fallback. */
export function CalendarSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto max-w-[1200px] overflow-hidden rounded-[20px] shadow-gallery"
      data-testid="calendar-skeleton"
    >
      <div className="h-11 animate-pulse bg-brand/30" />
      <div className="grid grid-cols-7 gap-px bg-line pt-px">
        {Array.from({ length: 35 }, (_, n) => (
          <div key={n} className="h-11 animate-pulse bg-alt min-[700px]:h-24" />
        ))}
      </div>
    </div>
  );
}
