import { describe, expect, it } from "vitest";
import {
  monthKey,
  monthRange,
  parseISODate,
  shiftMonth,
  toISODate,
  windowCovers,
} from "@/lib/events";

/* openspec fix-calendar-page-layout tasks 1.2–1.3. */
describe("lib/events", () => {
  it("parses ISO dates in local time (no UTC shift)", () => {
    const d = parseISODate("2026-07-04");
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 6, 4]);
    expect(toISODate(d)).toBe("2026-07-04");
  });

  it("computes month ranges across edges", () => {
    expect(monthRange(2026, 1)).toEqual({ from: "2026-02-01", to: "2026-02-28" });
    expect(monthRange(2028, 1)).toEqual({ from: "2028-02-01", to: "2028-02-29" });
    expect(monthRange(2026, 11)).toEqual({ from: "2026-12-01", to: "2026-12-31" });
    expect(monthKey(2026, 0)).toBe("2026-01");
  });

  it("shifts months with year overflow", () => {
    expect(shiftMonth({ year: 2026, month: 11 }, 1)).toEqual({ year: 2027, month: 0 });
    expect(shiftMonth({ year: 2026, month: 0 }, -1)).toEqual({ year: 2025, month: 11 });
  });

  it("window covers previous month through N months ahead", () => {
    const today = "2026-09-05";
    expect(windowCovers(today, 2026, 7)).toBe(true); // Aug
    expect(windowCovers(today, 2026, 8)).toBe(true); // Sep
    expect(windowCovers(today, 2026, 11)).toBe(true); // Dec (+3)
    expect(windowCovers(today, 2027, 0)).toBe(false); // Jan (+4)
    expect(windowCovers(today, 2026, 6)).toBe(false); // Jul (−2)
  });
});
