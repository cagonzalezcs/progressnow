import { describe, expect, it } from "vitest";
import singleEvent from "@fixtures/single-event.json";
import {
  dateTile,
  detailRows,
  hasContact,
  locationLine,
  longDate,
  telHref,
  whenWhere,
} from "@/lib/event";
import type { SingleEventEnvelope } from "@/lib/schemas";

/* openspec next-js-site-implementation task 6.7 — the single-event computeds
 * against the theme fixture (2030-07-04, in person, Union Hall · Downtown). */
const event = (singleEvent as unknown as SingleEventEnvelope).event;
const labels = { date: "Date", time: "Time", location: "Location" };

describe("lib/event", () => {
  it("formats the long date and the date tile in local time", () => {
    expect(longDate(event.date)).toBe("Thursday, July 4, 2030");
    expect(dateTile(event.date)).toEqual({ day: "04", month: "JUL" });
  });

  it("builds the location line per location type", () => {
    expect(locationLine(event)).toBe("Union Hall · Downtown");
    expect(locationLine({ locationType: "online", venue: "", city: "" })).toBe(
      "Online · link shared on RSVP",
    );
    expect(locationLine({ locationType: "hybrid", venue: "Hall", city: "" })).toBe(
      "Hall · or online",
    );
    expect(locationLine({ locationType: "hybrid", venue: "", city: "" })).toBe(
      "In person or online",
    );
    expect(locationLine({ locationType: "in-person", venue: "", city: "" })).toBe("Location TBA");
  });

  it("joins the hero lede and omits empty parts", () => {
    expect(whenWhere(event)).toBe("Thursday, July 4, 2030 · 6:00–8:00 PM · Union Hall · Downtown");
    expect(whenWhere({ ...event, time: "" })).toBe(
      "Thursday, July 4, 2030 · Union Hall · Downtown",
    );
  });

  it("details rows: time row only with a time, doors appended", () => {
    expect(detailRows(event, labels)).toEqual([
      { label: "Date", value: "Thursday, July 4, 2030" },
      { label: "Time", value: "6:00–8:00 PM" },
      { label: "Location", value: "Union Hall · Downtown" },
    ]);
    expect(detailRows({ ...event, doorsTime: "5:30 PM" }, labels)[1]).toEqual({
      label: "Time",
      value: "6:00–8:00 PM · doors 5:30 PM",
    });
    expect(detailRows({ ...event, time: "" }, labels)).toHaveLength(2);
  });

  it("contact presence and tel href", () => {
    expect(hasContact(event.contact)).toBe(false);
    expect(hasContact({ name: "", email: "a@b.c", phone: "" })).toBe(true);
    expect(telHref("(555) 010-2020")).toBe("tel:5550102020");
  });
});
