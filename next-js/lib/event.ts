import { WEEKDAYS_LONG } from "@/lib/calendar";
import { MONTH_NAMES, parseISODate } from "@/lib/events";
import type { SingleEventData } from "@/lib/schemas";

/* Pure single-event helpers (twin of the computed values in the Nuxt
 * SingleEvent.vue; openspec progress-now-v4-events D4 "Event hero"). */

/** "Tuesday, September 8, 2026" */
export function eventLongDate(iso: string): string {
  const d = parseISODate(iso);
  return `${WEEKDAYS_LONG[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/** Location line by type: online, hybrid ("… · or online"), in-person, TBA. */
export function eventLocationLine(
  event: Pick<SingleEventData, "locationType" | "venue" | "city">,
): string {
  if (event.locationType === "online") return "Online · link shared on RSVP";
  const place = [event.venue, event.city].filter(Boolean).join(" · ");
  if (event.locationType === "hybrid")
    return place ? `${place} · or online` : "In person or online";
  return place || "Location TBA";
}

/** hero lede: "<weekday, date> · <time> · <location>" */
export function eventWhenWhere(
  event: Pick<SingleEventData, "date" | "time" | "locationType" | "venue" | "city">,
): string {
  return [eventLongDate(event.date), event.time, eventLocationLine(event)]
    .filter(Boolean)
    .join(" · ");
}

export function eventDetailRows(
  event: Pick<SingleEventData, "date" | "time" | "doorsTime" | "locationType" | "venue" | "city">,
  labels: { date: string; time: string; location: string },
): { label: string; value: string }[] {
  return [
    { label: labels.date, value: eventLongDate(event.date) },
    ...(event.time
      ? [
          {
            label: labels.time,
            value: event.doorsTime ? `${event.time} · doors ${event.doorsTime}` : event.time,
          },
        ]
      : []),
    { label: labels.location, value: eventLocationLine(event) },
  ];
}

export function eventHasContact(event: Pick<SingleEventData, "contact">): boolean {
  const c = event.contact;
  return c.name !== "" || c.email !== "" || c.phone !== "";
}

/** tel: href — digits and a leading + only */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^0-9+]/g, "")}`;
}
