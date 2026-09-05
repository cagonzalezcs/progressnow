import { MONTH_NAMES, MONTH_SHORTS, parseISODate, WEEKDAYS_LONG } from "@/lib/events";
import type { SingleEventData } from "@/lib/schemas";

/* Single-event view helpers (openspec progress-now-v4-events D4; twin of the
 * computeds in SingleEvent.vue). Framework-free so the server route and the
 * unit tests share them. */

/** "Tuesday, September 8, 2026" */
export function longDate(iso: string): string {
  const d = parseISODate(iso);
  return `${WEEKDAYS_LONG[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/** The hero date tile: zero-padded day + upper-case short month. */
export function dateTile(iso: string): { day: string; month: string } {
  const d = parseISODate(iso);
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: MONTH_SHORTS[d.getMonth()]!.toUpperCase(),
  };
}

export type LocationEvent = Pick<SingleEventData, "locationType" | "venue" | "city">;

/** "Union Hall · Downtown", "Online · link shared on RSVP", "… · or online", "Location TBA". */
export function locationLine(event: LocationEvent): string {
  if (event.locationType === "online") return "Online · link shared on RSVP";
  const place = [event.venue, event.city].filter(Boolean).join(" · ");
  if (event.locationType === "hybrid")
    return place ? `${place} · or online` : "In person or online";
  return place || "Location TBA";
}

/** Hero lede: "<weekday, date> · <time> · <location>". */
export function whenWhere(event: LocationEvent & Pick<SingleEventData, "date" | "time">): string {
  return [longDate(event.date), event.time, locationLine(event)].filter(Boolean).join(" · ");
}

export interface DetailLabels {
  date: string;
  time: string;
  location: string;
}

/** Sidebar "Details" rows; the time row is omitted without a time and carries the doors time. */
export function detailRows(
  event: LocationEvent & Pick<SingleEventData, "date" | "time" | "doorsTime">,
  labels: DetailLabels,
): { label: string; value: string }[] {
  const rows = [{ label: labels.date, value: longDate(event.date) }];
  if (event.time) {
    rows.push({
      label: labels.time,
      value: event.doorsTime ? `${event.time} · doors ${event.doorsTime}` : event.time,
    });
  }
  rows.push({ label: labels.location, value: locationLine(event) });
  return rows;
}

export function hasContact(contact: SingleEventData["contact"]): boolean {
  return contact.name !== "" || contact.email !== "" || contact.phone !== "";
}

/** `tel:` href from a display phone number. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^0-9+]/g, "")}`;
}
