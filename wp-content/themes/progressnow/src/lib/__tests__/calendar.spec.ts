import { describe, expect, it } from "vitest";
import chapterEventFixture from "../../../tests/fixtures/chapter-event.json";
import {
  dayHeading,
  defaultSelectedDay,
  formatLabel,
  groupByDay,
  monthCells,
  nextEventDay,
  shortDate,
  toISODate,
} from "@/lib/calendar";
import type { ChapterEvent } from "@/lib/schemas";

/* openspec calendar-mobile-day-agenda → events-presentation § Month grid (v4)
 * (default selection), § Day agenda (compact) (jump wraps), § Event list rows
 * (day groups, past flags), § Calendar island copy (placeholders). Twin of
 * next-js test/unit/calendar.spec.ts; the nuxt-js copy of lib/calendar.ts is
 * byte-identical (shared-source-drift.test.ts). */
const event = chapterEventFixture as unknown as ChapterEvent;
const sep = (day: number, extra: Partial<ChapterEvent> = {}): ChapterEvent => ({
  ...event,
  id: `s${day}`,
  date: `2026-09-${String(day).padStart(2, "0")}`,
  ...extra,
});
const month = { year: 2026, month: 8 };
const events = [
  sep(12),
  sep(3),
  sep(12, { id: "s12b", time: "9:00 AM" }),
  sep(18),
];
const cells = monthCells(month, events, "2026-09-05");

describe("calendar helpers", () => {
  it("monthCells: Sunday-first, padded, today flagged, events on in-month days only", () => {
    expect(cells.length % 7).toBe(0);
    expect(cells[0]).toMatchObject({
      key: "2026-08-30",
      inMonth: false,
      events: [],
    });
    expect(cells[2]).toMatchObject({
      key: "2026-09-01",
      inMonth: true,
      num: 1,
    });
    const fifth = cells.find((c) => c.key === "2026-09-05");
    expect(fifth).toMatchObject({
      isToday: true,
      label: "Saturday, September 5",
    });
    expect(
      cells.find((c) => c.key === "2026-09-12")?.events.map((e) => e.id),
    ).toEqual(["s12", "s12b"]);
    const padded = monthCells(
      month,
      [sep(31, { id: "aug", date: "2026-08-31" })],
      "2026-09-05",
    );
    expect(padded.find((c) => c.key === "2026-08-31")?.events).toEqual([]);
    expect(toISODate(new Date(2026, 8, 5))).toBe("2026-09-05");
  });

  it("defaultSelectedDay: today → first event day → the 1st", () => {
    expect(defaultSelectedDay(cells, "2026-09-05")).toBe("2026-09-05");
    const later = "2026-10-01";
    expect(defaultSelectedDay(monthCells(month, events, later), later)).toBe(
      "2026-09-03",
    );
    expect(defaultSelectedDay(monthCells(month, [], later), later)).toBe(
      "2026-09-01",
    );
    expect(defaultSelectedDay([], later)).toBeNull();
  });

  it("nextEventDay: first event day after the selection, wrapping", () => {
    expect(nextEventDay(cells, "2026-09-05")).toBe("2026-09-12");
    expect(nextEventDay(cells, "2026-09-12")).toBe("2026-09-18");
    expect(nextEventDay(cells, "2026-09-20")).toBe("2026-09-03"); // wrap
    expect(
      nextEventDay(monthCells(month, [], "2026-09-05"), "2026-09-05"),
    ).toBeNull();
  });

  it("groupByDay: date-sorted groups with today/past flags", () => {
    const groups = groupByDay(
      [sep(12), sep(3), sep(12, { id: "s12b", time: "9:00 AM" }), sep(5)],
      "2026-09-05",
    );
    expect(groups.map((g) => g.key)).toEqual([
      "2026-09-03",
      "2026-09-05",
      "2026-09-12",
    ]);
    expect(groups[0]).toMatchObject({
      isPast: true,
      isToday: false,
      dow: "THU",
      num: 3,
      label: "Thursday, September 3",
    });
    expect(groups[1]).toMatchObject({
      isPast: false,
      isToday: true,
      dow: "SAT",
      num: 5,
    });
    expect(groups[2]?.events.map((e) => e.id)).toEqual(["s12", "s12b"]);
    expect(groupByDay([], "2026-09-05")).toEqual([]);
  });

  it("labels: dayHeading, shortDate and {name} placeholders", () => {
    expect(dayHeading("2026-09-12")).toBe("Saturday, Sep 12");
    expect(shortDate("2026-09-08")).toBe("Sep 8");
    expect(
      formatLabel("{n} events in {month}", { n: 9, month: "September" }),
    ).toBe("9 events in September");
    expect(formatLabel("Show {n} past", { n: 3 })).toBe("Show 3 past");
    expect(formatLabel("{missing} stays", {})).toBe("{missing} stays");
  });
});
