import { describe, expect, it } from "vitest";
import chapterEvent from "@fixtures/chapter-event.json";
import {
  addMonths,
  calendarHref,
  dateTile,
  dayHeading,
  defaultSelectedDay,
  defaultWindow,
  eventDateLine,
  eventsInMonth,
  eventWhen,
  filterByCategory,
  formatLabel,
  groupByDay,
  monthBounds,
  monthCells,
  monthInWindow,
  monthKey,
  monthLabel,
  monthOf,
  nextEventDay,
  parseMonthParam,
  shortDate,
} from "@/lib/calendar";
import { resolveHref } from "@/lib/links";
import type { ChapterEvent } from "@/lib/schemas";

const event = chapterEvent as unknown as ChapterEvent;

describe("calendar month math", () => {
  it("keys, labels, parsing and paging", () => {
    expect(monthKey({ year: 2026, month: 0 })).toBe("2026-01");
    expect(monthLabel({ year: 2026, month: 8 })).toBe("September 2026");
    expect(parseMonthParam("2026-07")).toEqual({ year: 2026, month: 6 });
    expect(parseMonthParam("2026-13")).toBeNull();
    expect(parseMonthParam("nope")).toBeNull();
    expect(parseMonthParam(undefined)).toBeNull();
    expect(monthOf("2026-09-05")).toEqual({ year: 2026, month: 8 });
    expect(addMonths({ year: 2026, month: 11 }, 1)).toEqual({ year: 2027, month: 0 });
    expect(addMonths({ year: 2026, month: 0 }, -1)).toEqual({ year: 2025, month: 11 });
  });

  it("month bounds and the REST default window (−1 → +12 months)", () => {
    expect(monthBounds({ year: 2026, month: 1 })).toEqual({ from: "2026-02-01", to: "2026-02-28" });
    const w = defaultWindow("2026-09-05");
    expect(w).toEqual({ from: "2026-08-05", to: "2027-09-05" });
    expect(monthInWindow({ year: 2026, month: 8 }, w)).toBe(true); // Sep 2026 fully inside
    expect(monthInWindow({ year: 2026, month: 7 }, w)).toBe(false); // Aug 1–4 precede the window
    expect(monthInWindow({ year: 2027, month: 8 }, w)).toBe(false);
    expect(monthInWindow({ year: 2026, month: 6 }, w)).toBe(false);
  });

  it("grid cells: Sunday-first, padded, today flagged, events attached", () => {
    const cells = monthCells({ year: 2026, month: 6 }, [event], "2026-07-04");
    expect(cells.length % 7).toBe(0);
    expect(cells[0]!.key).toBe("2026-06-28"); // July 1 2026 is a Wednesday → 3 pad days
    expect(cells[3]).toMatchObject({ key: "2026-07-01", inMonth: true, num: 1 });
    const fourth = cells.find((c) => c.key === "2026-07-04")!;
    expect(fourth.isToday).toBe(true);
    expect(fourth.events).toEqual([event]);
    expect(fourth.label).toBe("Saturday, July 4");
    expect(cells.at(-1)!.inMonth).toBe(false);
  });

  it("filters and formats events", () => {
    const other = {
      ...event,
      id: "21",
      date: "2026-07-02",
      cat: "labor" as const,
      time: "9:00 AM",
    };
    expect(eventsInMonth([event, other], { year: 2026, month: 6 }).map((e) => e.id)).toEqual([
      "21",
      "20",
    ]);
    expect(eventsInMonth([event], { year: 2026, month: 7 })).toEqual([]);
    expect(filterByCategory([event, other], "labor")).toEqual([other]);
    expect(filterByCategory([event, other], "all")).toHaveLength(2);
    expect(eventWhen(event)).toBe("Saturday, July 4 · 6:00–8:00 PM");
    expect(eventWhen({ date: "2026-07-04", time: "" })).toBe("Saturday, July 4");
    expect(eventDateLine(event)).toBe("Sat, July 4, 2026 · 6:00–8:00 PM");
    expect(dateTile("2026-07-04")).toEqual({ day: "04", month: "JUL" });
  });

  it("URL state drops defaults", () => {
    const d = { view: "month" as const, month: "2026-09" };
    expect(calendarHref("/calendar/", { view: "month", month: "2026-09" }, d)).toBe("/calendar/");
    expect(calendarHref("/calendar/", { view: "list", month: "2026-09" }, d)).toBe(
      "/calendar/?view=list",
    );
    expect(
      calendarHref("/calendar/", { view: "month", month: "2026-07", category: "labor" }, d),
    ).toBe("/calendar/?month=2026-07&category=labor");
    expect(
      calendarHref("/es/calendario/", { view: "list", month: "2026-07", category: "all" }, d),
    ).toBe("/es/calendario/?view=list&month=2026-07");
  });
});

describe("feed links", () => {
  it("query-string feeds stay on WordPress like pretty-permalink feeds", () => {
    const wp = "https://wp.example";
    expect(resolveHref(`${wp}/?feed=chapter-events`, wp)).toEqual({
      kind: "wordpress",
      href: `${wp}/?feed=chapter-events`,
    });
    expect(resolveHref(`${wp}/feed/chapter-events/`, wp).kind).toBe("wordpress");
    expect(resolveHref(`${wp}/?p=20`, wp)).toEqual({ kind: "internal", href: "/?p=20" });
  });
});

/* openspec calendar-mobile-day-agenda → events-presentation § Month grid (v4)
 * (default selection), § Day agenda (compact) (jump wraps), § Event list rows
 * (day groups, past flags), § Calendar island copy (placeholders). */
describe("compact day picker + grouped list helpers", () => {
  const sep = (day: number, extra: Partial<ChapterEvent> = {}): ChapterEvent => ({
    ...event,
    id: `s${day}`,
    date: `2026-09-${String(day).padStart(2, "0")}`,
    ...extra,
  });
  const month = { year: 2026, month: 8 };
  const events = [sep(12), sep(3), sep(12, { id: "s12b", time: "9:00 AM" }), sep(18)];
  const cells = monthCells(month, events, "2026-09-05");

  it("defaultSelectedDay: today → first event day → the 1st", () => {
    expect(defaultSelectedDay(cells, "2026-09-05")).toBe("2026-09-05");
    const later = "2026-10-01";
    expect(defaultSelectedDay(monthCells(month, events, later), later)).toBe("2026-09-03");
    expect(defaultSelectedDay(monthCells(month, [], later), later)).toBe("2026-09-01");
    expect(defaultSelectedDay([], later)).toBeNull();
  });

  it("nextEventDay: first event day after the selection, wrapping; padding days never count", () => {
    expect(nextEventDay(cells, "2026-09-05")).toBe("2026-09-12");
    expect(nextEventDay(cells, "2026-09-12")).toBe("2026-09-18");
    expect(nextEventDay(cells, "2026-09-20")).toBe("2026-09-03"); // wrap
    expect(nextEventDay(monthCells(month, [], "2026-09-05"), "2026-09-05")).toBeNull();
    const padded = monthCells(
      month,
      [
        sep(3),
        sep(31, { id: "aug", date: "2026-08-31" }),
        sep(2, { id: "oct", date: "2026-10-02" }),
      ],
      "2026-09-05",
    );
    expect(padded.find((c) => c.key === "2026-08-31")!.events).toEqual([]); // Aug 31 pads the grid
    expect(padded.find((c) => c.key === "2026-10-02")!.events).toEqual([]);
    expect(nextEventDay(padded, "2026-09-03")).toBe("2026-09-03"); // only event day → itself
  });

  it("groupByDay: date-sorted groups with today/past flags; a category-filtered input groups only itself", () => {
    const groups = groupByDay(
      [sep(12), sep(3), sep(12, { id: "s12b", time: "9:00 AM" }), sep(5)],
      "2026-09-05",
    );
    expect(groups.map((g) => g.key)).toEqual(["2026-09-03", "2026-09-05", "2026-09-12"]);
    expect(groups[0]).toMatchObject({
      isPast: true,
      isToday: false,
      dow: "THU",
      num: 3,
      label: "Thursday, September 3",
    });
    expect(groups[1]).toMatchObject({ isPast: false, isToday: true, dow: "SAT", num: 5 });
    expect(groups[2]!.events.map((e) => e.id)).toEqual(["s12", "s12b"]); // eventsInMonth's time order
    expect(groupByDay(filterByCategory(events, "labor"), "2026-09-05")).toEqual([]);
    expect(groupByDay([], "2026-09-05")).toEqual([]);
  });

  it("labels: dayHeading, shortDate and {name} placeholders", () => {
    expect(dayHeading("2026-09-12")).toBe("Saturday, Sep 12");
    expect(shortDate("2026-09-08")).toBe("Sep 8");
    expect(formatLabel("{n} events in {month}", { n: 9, month: "September" })).toBe(
      "9 events in September",
    );
    expect(formatLabel("Show {n} past", { n: 3 })).toBe("Show 3 past");
    expect(formatLabel("{missing} stays", {})).toBe("{missing} stays");
  });
});
