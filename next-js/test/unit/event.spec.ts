import { describe, expect, it } from "vitest";
import singleEvent from "@fixtures/single-event.json";
import {
  eventDetailRows,
  eventHasContact,
  eventLocationLine,
  eventLongDate,
  eventWhenWhere,
  telHref,
} from "@/lib/event";
import type { SingleEventEnvelope } from "@/lib/schemas";

const event = (singleEvent as unknown as SingleEventEnvelope).event;
const labels = { date: "Date", time: "Time", location: "Location" };

describe("single event helpers", () => {
  it("formats the long date and the when/where lede", () => {
    expect(eventLongDate("2030-07-04")).toBe("Thursday, July 4, 2030");
    expect(eventWhenWhere(event)).toBe(
      "Thursday, July 4, 2030 · 6:00–8:00 PM · Union Hall · Downtown",
    );
    expect(eventWhenWhere({ ...event, time: "" })).toBe(
      "Thursday, July 4, 2030 · Union Hall · Downtown",
    );
  });

  it("location line by type", () => {
    expect(eventLocationLine(event)).toBe("Union Hall · Downtown");
    expect(eventLocationLine({ locationType: "online", venue: "x", city: "y" })).toBe(
      "Online · link shared on RSVP",
    );
    expect(eventLocationLine({ locationType: "hybrid", venue: "Hall", city: "" })).toBe(
      "Hall · or online",
    );
    expect(eventLocationLine({ locationType: "hybrid", venue: "", city: "" })).toBe(
      "In person or online",
    );
    expect(eventLocationLine({ locationType: "in-person", venue: "", city: "" })).toBe(
      "Location TBA",
    );
  });

  it("detail rows include doors time and skip an empty time", () => {
    expect(eventDetailRows(event, labels)).toEqual([
      { label: "Date", value: "Thursday, July 4, 2030" },
      { label: "Time", value: "6:00–8:00 PM" },
      { label: "Location", value: "Union Hall · Downtown" },
    ]);
    expect(eventDetailRows({ ...event, doorsTime: "5:30 PM" }, labels)[1]).toEqual({
      label: "Time",
      value: "6:00–8:00 PM · doors 5:30 PM",
    });
    expect(eventDetailRows({ ...event, time: "" }, labels).map((r) => r.label)).toEqual([
      "Date",
      "Location",
    ]);
  });

  it("contact presence and tel: href", () => {
    expect(eventHasContact(event)).toBe(false);
    expect(eventHasContact({ contact: { name: "", email: "a@b.c", phone: "" } })).toBe(true);
    expect(telHref("+1 (512) 555-0100")).toBe("tel:+15125550100");
  });
});
