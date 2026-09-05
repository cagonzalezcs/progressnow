"use client";

import { useEffect, useId, useRef, useState } from "react";
import { EventDetailDialog } from "@/components/site/calendar/EventDetailDialog";
import { EventListView } from "@/components/site/calendar/EventListView";
import { MonthGrid } from "@/components/site/calendar/MonthGrid";
import {
  addMonths,
  calendarHref,
  eventsInMonth,
  filterByCategory,
  monthBounds,
  monthInWindow,
  monthKey,
  monthLabel,
  monthOf,
  type EventWindow,
  type YearMonth,
} from "@/lib/calendar";
import type { ChapterEvent, EventCategory } from "@/lib/schemas";
import { cn } from "@/lib/utils";

/* Calendar island (openspec progress-now-v4-events D1/D2/D5; next-headless-site
 * § Interactive archive and calendar). The server renders the requested month
 * from the REST window it fetched (−1 → +12 months) and hands it over as props;
 * the island owns month paging, the Month/List toggle and the preview dialog.
 * URL state (`?view=`, `?month=`, `?category=`) is written with
 * history.replaceState so a reload or a shared link lands on the same month.
 * Months outside the window load through the same-origin /api/events with a
 * live status; the failure state keeps the ICS feed reachable. */
export interface CalendarLabels {
  monthLabelText: string;
  listLabelText: string;
  viewGroupLabel: string;
  prevLabel: string;
  nextLabel: string;
  viewLabel: string;
  rsvpLabel: string;
  closeLabel: string;
  emptyTitle: string;
  emptyBody: string;
  loading: string;
  errorTitle: string;
  errorBody: string;
  retry: string;
  icsLabel: string;
}

export const DEFAULT_CALENDAR_LABELS: CalendarLabels = {
  monthLabelText: "Month",
  listLabelText: "List",
  viewGroupLabel: "View",
  prevLabel: "Previous month",
  nextLabel: "Next month",
  viewLabel: "View event",
  rsvpLabel: "RSVP",
  closeLabel: "Close",
  emptyTitle: "Nothing scheduled this month",
  emptyBody: "Check the next month or subscribe below and never miss one.",
  loading: "Loading events…",
  errorTitle: "We couldn’t load the calendar",
  errorBody: "Try again in a moment — or subscribe with",
  retry: "Retry",
  icsLabel: "iCal / .ics",
};

const NAV_BTN =
  "inline-flex size-11 flex-none cursor-pointer items-center justify-center rounded-full border-2 border-control bg-white p-0 text-[1.1rem] font-extrabold text-ink transition-colors hover:border-accent hover:bg-accent hover:text-white";
const SEG_BTN =
  "cursor-pointer rounded-full border-none px-[22px] py-[9px] font-display text-[0.9rem] font-normal tracking-[0.03em] transition-colors";

type MonthState =
  | { status: "ready"; events: ChapterEvent[] }
  | { status: "loading" }
  | { status: "failed" };

export function EventCalendar({
  events,
  window,
  todayISO,
  lang,
  initialView = "month",
  defaultView = "month",
  initialMonth,
  category = "all",
  categories,
  showCategoryColors = true,
  basePath,
  icsUrl,
  fetchImpl,
  labels = {},
  wpOrigin,
}: {
  /** the server-fetched REST window */
  events: ChapterEvent[];
  window: EventWindow;
  /** the server's yyyy-mm-dd — keeps "today" identical across SSR and hydration */
  todayISO: string;
  lang: string;
  initialView?: "month" | "list";
  defaultView?: "month" | "list";
  initialMonth?: YearMonth;
  /** `?category=` narrows the window (no chips in v4) */
  category?: string;
  categories?: EventCategory[] | null;
  showCategoryColors?: boolean;
  /** calendar page path (URL state + event fallback link) */
  basePath: string;
  icsUrl: string;
  /** test seam for the out-of-window fetch */
  fetchImpl?: typeof fetch;
  labels?: Partial<CalendarLabels>;
  wpOrigin: string;
}) {
  const L: CalendarLabels = {
    ...DEFAULT_CALENDAR_LABELS,
    ...Object.fromEntries(Object.entries(labels).filter(([, v]) => Boolean(v))),
  };
  const currentMonth = monthOf(todayISO);
  const [view, setView] = useState<"month" | "list">(initialView);
  const [ym, setYm] = useState<YearMonth>(initialMonth ?? currentMonth);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [extra, setExtra] = useState<Record<string, MonthState>>({});
  const [retryTick, setRetryTick] = useState(0);
  /** months already requested (ref: read/written only in effects and handlers) */
  const requested = useRef(new Set<string>());
  const headingId = useId();
  const mounted = useRef(false);
  const openerRef = useRef<HTMLElement | null>(null);
  const select = (id: string) => {
    openerRef.current = document.activeElement as HTMLElement | null;
    setSelectedId(id);
  };
  const key = monthKey(ym);
  const inWindow = monthInWindow(ym, window);

  // URL is the state (replaceState keeps Next's router in sync without a server round trip).
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const href = calendarHref(
      basePath,
      { view, month: key, category },
      { view: defaultView, month: monthKey(currentMonth) },
    );
    const current = `${location.pathname}${location.search}`;
    if (current !== href) globalThis.history.replaceState(null, "", href);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- currentMonth derives from todayISO
  }, [view, key, category, basePath, defaultView, todayISO]);

  // Out-of-window months: fetch once per month, same-origin, with a live status.
  useEffect(() => {
    if (inWindow || requested.current.has(key)) return;
    requested.current.add(key);
    const controller = new AbortController();
    const load = async () => {
      setExtra((s) => ({ ...s, [key]: { status: "loading" } }));
      try {
        const b = monthBounds(ym);
        const q = new URLSearchParams({ lang, from: b.from, to: b.to });
        // trailing slash: the app redirects `/api/events` → `/api/events/` (one request, not two)
        const res = await (fetchImpl ?? fetch)(`/api/events/?${q}`, { signal: controller.signal });
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as { events?: unknown };
        if (!Array.isArray(json.events)) throw new Error("shape");
        setExtra((s) => ({
          ...s,
          [key]: { status: "ready", events: json.events as ChapterEvent[] },
        }));
      } catch {
        // Aborted (month changed mid-flight): forget the stale "loading" so a revisit refetches.
        if (controller.signal.aborted) requested.current.delete(key);
        setExtra((s) => {
          const next = { ...s };
          if (controller.signal.aborted) delete next[key];
          else next[key] = { status: "failed" };
          return next;
        });
      }
    };
    void load();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ym is derived from key
  }, [key, inWindow, retryTick, lang, fetchImpl]);

  const monthState: MonthState = inWindow
    ? { status: "ready", events }
    : (extra[key] ?? { status: "loading" });
  const pool = monthState.status === "ready" ? filterByCategory(monthState.events, category) : [];
  const monthEvents = eventsInMonth(pool, ym);
  const selected =
    (monthState.status === "ready" ? monthState.events : events).find((e) => e.id === selectedId) ??
    null;
  const changeMonth = (delta: number) => setYm((m) => addMonths(m, delta));
  const retry = () => {
    requested.current.delete(key);
    setExtra((s) => {
      const next = { ...s };
      delete next[key];
      return next;
    });
    setRetryTick((t) => t + 1);
  };

  return (
    <div className="event-calendar" data-calendar="">
      {/* Toolbar: month nav + Month/List segmented control */}
      <section className="bg-white px-6 pt-7 md:pt-10" data-tone="white">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-4 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-5">
          <div className="flex items-center justify-between gap-2.5 md:justify-start md:gap-3.5">
            <button
              type="button"
              aria-label={L.prevLabel}
              className={NAV_BTN}
              onClick={() => changeMonth(-1)}
            >
              <span aria-hidden="true">←</span>
            </button>
            <h2
              id={headingId}
              aria-live="polite"
              className="m-0 text-center font-display text-[1.25rem] font-normal md:min-w-[280px] md:text-[clamp(1.3rem,2.4vw,1.8rem)]"
            >
              {monthLabel(ym)}
            </h2>
            <button
              type="button"
              aria-label={L.nextLabel}
              className={NAV_BTN}
              onClick={() => changeMonth(1)}
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
          <div
            role="group"
            aria-label={L.viewGroupLabel}
            className="flex items-center gap-0.5 self-center rounded-full bg-alt p-1 md:self-auto"
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
                onClick={() => setView(v)}
              >
                {v === "month" ? L.monthLabelText : L.listLabelText}
              </button>
            ))}
          </div>
        </div>
      </section>

      {monthState.status === "loading" ? (
        <section
          className="bg-white px-4 pb-8 pt-5 min-[700px]:px-6 md:pb-14 md:pt-7"
          data-tone="white"
          aria-busy="true"
        >
          <div
            aria-hidden="true"
            className="mx-auto max-w-[1200px] overflow-hidden rounded-[20px] shadow-gallery"
          >
            <div className="h-11 animate-pulse bg-brand/30" />
            <div className="grid grid-cols-7 gap-px bg-line pt-px">
              {Array.from({ length: 35 }, (_, n) => (
                <div key={n} className="h-11 animate-pulse bg-alt min-[700px]:h-24" />
              ))}
            </div>
          </div>
          <p
            role="status"
            className="mx-auto mt-3.5 max-w-[1200px] text-[0.9rem] font-medium text-muted"
          >
            {L.loading}
          </p>
        </section>
      ) : monthState.status === "failed" ? (
        <section className="bg-white px-6 pb-10 pt-5 md:pb-14 md:pt-7" data-tone="white">
          <div className="mx-auto max-w-[900px]">
            <div
              role="alert"
              className="flex flex-col items-center gap-1 rounded-[16px] border-2 border-dashed border-border-muted px-6 py-11 text-center md:rounded-[20px] md:px-8 md:py-16"
              data-calendar-error=""
            >
              <div className="text-[1.05rem] font-extrabold md:text-[1.25rem] md:font-bold">
                {L.errorTitle}
              </div>
              <p className="m-0 max-w-[44ch] text-base font-medium leading-[1.45] md:text-[1.2rem]">
                {L.errorBody}{" "}
                <a
                  href={icsUrl}
                  className="font-bold text-accent underline underline-offset-4 hover:text-brand-deep"
                >
                  {L.icsLabel}
                </a>{" "}
                and get every event straight in your own calendar.
              </p>
              <button
                type="button"
                className="mt-4 cursor-pointer rounded-full border-2 border-accent bg-transparent px-6 py-2.5 text-[0.92rem] font-bold text-accent transition-colors hover:bg-accent hover:text-white"
                onClick={retry}
              >
                {L.retry}
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
              ym={ym}
              events={pool}
              todayISO={todayISO}
              categories={categories}
              showCategoryColors={showCategoryColors}
              labelledBy={headingId}
              onSelect={select}
              onMonthChange={changeMonth}
            />
          </div>
        </section>
      ) : (
        <section className="bg-white px-6 pb-10 pt-5 md:pb-14 md:pt-7" data-tone="white">
          <div className="mx-auto max-w-[900px]">
            <EventListView
              events={monthEvents}
              fallbackUrl={basePath}
              viewLabel={L.viewLabel}
              emptyTitle={L.emptyTitle}
              emptyBody={L.emptyBody}
              wpOrigin={wpOrigin}
            />
          </div>
        </section>
      )}

      <EventDetailDialog
        event={selected}
        categories={categories}
        showCategoryColors={showCategoryColors}
        fallbackUrl={basePath}
        viewLabel={L.viewLabel}
        rsvpLabel={L.rsvpLabel}
        closeLabel={L.closeLabel}
        openerRef={openerRef}
        onClose={() => setSelectedId(null)}
        wpOrigin={wpOrigin}
      />
    </div>
  );
}
