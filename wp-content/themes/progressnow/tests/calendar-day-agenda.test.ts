// @vitest-environment happy-dom
import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import categoriesFixture from "./fixtures/categories.json";
import chapterEventFixture from "./fixtures/chapter-event.json";
import EventCalendar from "@/components/site/EventCalendar.vue";
import MonthGrid from "@/components/site/MonthGrid.vue";
import type { ChapterEvent } from "@/lib/schemas";

/* Compact day picker + day agenda + day-grouped list of the calendar island
 * (openspec calendar-mobile-day-agenda → events-presentation § Month grid
 * (v4), § Day agenda (compact), § Event list rows; next-accessibility
 * § Keyboard-complete interactions). The nuxt-js copy of every component here
 * is byte-identical (shared-source-drift.test.ts), so this covers both Vue
 * renderers; next-js has the same cases in test/component/event-calendar.test.tsx. */

const { fetchEvents } = vi.hoisted(() => ({ fetchEvents: vi.fn() }));
vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();
  return { ...actual, fetchEvents };
});

const API = "https://wp.example/wp-json/progressnow/v1";
const event = {
  ...(chapterEventFixture as unknown as ChapterEvent),
  url: "https://wp.example/events/rally/",
};
const second: ChapterEvent = {
  ...event,
  id: "21",
  title: "Second Event",
  time: "9:00 PM",
  cat: "labor",
};
const COMPACT = "(max-width: 699.98px)";

/** Under 700px: the day buttons select instead of opening the dialog. */
function stubViewport(compact: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: compact && query === COMPACT,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList,
  );
}

async function mountCalendar(
  events: ChapterEvent[],
  props: Record<string, unknown> = {},
) {
  fetchEvents.mockResolvedValue({
    events,
    categories: categoriesFixture.categories,
  });
  const wrapper = mount(EventCalendar, {
    attachTo: document.body,
    props: { apiBase: API, showSubscribe: false, ...props },
  });
  await flushPromises();
  return wrapper;
}

const dayButton = (wrapper: ReturnType<typeof mount>, date: string) =>
  wrapper.get(`[data-testid="month-grid-day-button"][data-date="${date}"]`);
const agenda = (wrapper: ReturnType<typeof mount>) =>
  wrapper.get('[data-testid="day-agenda"]');

beforeEach(() => {
  // July 10, 2026 is "today" for the island's one clock read and the visible month.
  vi.useFakeTimers({ now: new Date(2026, 6, 10, 12), toFake: ["Date"] });
  window.history.replaceState(null, "", "/calendar/");
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  fetchEvents.mockReset();
  document.body.innerHTML = "";
});

describe("compact day picker + day agenda", () => {
  it("selects today by default, lists a tapped day's cards, jumps from an empty day, resets on filter and month, and switches to the list", async () => {
    stubViewport(true);
    const w = await mountCalendar([event, { ...second, date: "2026-07-12" }]);
    const today = dayButton(w, "2026-07-10");
    expect(today.attributes("aria-label")).toBe(
      "Friday, July 10, no events, today",
    );
    expect(today.attributes("aria-pressed")).toBe("true");
    expect(today.element.parentElement?.getAttribute("data-selected")).toBe(
      "true",
    );
    expect(w.get('[data-testid="month-grid-hint-compact"]').text()).toBe(
      "Tap a day to see what’s happening.",
    );
    expect(agenda(w).attributes("aria-live")).toBe("polite");
    expect(agenda(w).attributes("aria-label")).toBe("Events on selected day");
    expect(w.get('[data-testid="day-agenda-heading"]').text()).toBe(
      "Friday, Jul 10",
    );
    expect(w.get('[data-testid="day-agenda-count"]').text()).toBe("No events");
    expect(w.get('[data-testid="day-agenda-empty"]').text()).toContain(
      "Nothing scheduled on this day",
    );

    // tap a dotted day → its card, no dialog
    const fourth = dayButton(w, "2026-07-04");
    expect(fourth.attributes("aria-label")).toBe("Saturday, July 4, 1 event");
    await fourth.trigger("click");
    expect(fourth.attributes("aria-pressed")).toBe("true");
    expect(today.attributes("aria-pressed")).toBe("false");
    expect(w.find('[role="dialog"]').exists()).toBe(false);
    expect(w.get('[data-testid="day-agenda-heading"]').text()).toBe(
      "Saturday, Jul 4",
    );
    expect(w.get('[data-testid="day-agenda-count"]').text()).toBe("1 event");
    const card = agenda(w).get('[data-testid="event-card"]');
    expect(card.attributes("href")).toBe("https://wp.example/events/rally/");
    expect(card.attributes("aria-label")).toBe(
      "View event: Contract Test Event, July 4",
    );
    expect(card.attributes("data-variant")).toBe("agenda");
    expect(card.get('[data-testid="event-card-meta"]').text()).toBe(
      `${event.time} · ${event.location}`,
    );

    // empty day → note + jump to the next event day; after the last one it wraps
    await dayButton(w, "2026-07-06").trigger("click");
    const jump = w.get('[data-testid="day-agenda-jump"]');
    expect(jump.text()).toBe("Jump to next event · Jul 12");
    await jump.trigger("click");
    expect(dayButton(w, "2026-07-12").attributes("aria-pressed")).toBe("true");
    expect(
      agenda(w).get('[data-testid="event-card"]').attributes("aria-label"),
    ).toBe("View event: Second Event, July 12");
    await dayButton(w, "2026-07-20").trigger("click");
    expect(w.get('[data-testid="day-agenda-jump"]').text()).toBe(
      "Jump to next event · Jul 4",
    );

    // category chip → selection returns to today; dots follow the filter
    await w
      .get(
        '[data-testid="event-calendar-filter-option"][data-category="labor"]',
      )
      .trigger("click");
    expect(today.attributes("aria-pressed")).toBe("true");
    expect(dayButton(w, "2026-07-04").attributes("aria-label")).toBe(
      "Saturday, July 4, no events",
    );
    expect(w.get('[data-testid="day-agenda-jump"]').text()).toBe(
      "Jump to next event · Jul 12",
    );

    // month change → the 1st of an empty month, no jump, list link
    await w.get('[data-testid="event-calendar-next-month"]').trigger("click");
    expect(w.get('[data-testid="event-calendar-month-label"]').text()).toBe(
      "August 2026",
    );
    expect(dayButton(w, "2026-08-01").attributes("aria-pressed")).toBe("true");
    expect(w.get('[data-testid="day-agenda-count"]').text()).toBe("No events");
    expect(w.find('[data-testid="day-agenda-jump"]').exists()).toBe(false);
    await w.get('[data-testid="day-agenda-see-list"]').trigger("click");
    expect(
      w.get('[data-testid="event-calendar"]').attributes("data-view"),
    ).toBe("list");
    expect(
      Object.fromEntries(new URLSearchParams(window.location.search)),
    ).toEqual({
      view: "list",
      category: "labor",
    });
    expect(w.get('[data-testid="event-list-empty"]').exists()).toBe(true);
    w.unmount();
  });

  it("labels come from props (Spanish agenda copy)", async () => {
    stubViewport(true);
    const w = await mountCalendar([event], {
      tapDayHint: "Toca un día para ver qué hay.",
      dayRegionLabel: "Eventos del día seleccionado",
      noEventsText: "Sin eventos",
      jumpToNextText: "Ir al próximo evento · {date}",
      seeMonthListText: "Ver todo el mes como lista →",
      prevLabel: "Mes anterior",
    });
    expect(w.get('[data-testid="month-grid-hint-compact"]').text()).toBe(
      "Toca un día para ver qué hay.",
    );
    expect(agenda(w).attributes("aria-label")).toBe(
      "Eventos del día seleccionado",
    );
    expect(w.get('[data-testid="day-agenda-count"]').text()).toBe(
      "Sin eventos",
    );
    expect(w.get('[data-testid="day-agenda-jump"]').text()).toBe(
      "Ir al próximo evento · Jul 4",
    );
    expect(w.get('[data-testid="day-agenda-see-list"]').text()).toBe(
      "Ver todo el mes como lista →",
    );
    expect(
      w
        .get('[data-testid="event-calendar-prev-month"]')
        .attributes("aria-label"),
    ).toBe("Mes anterior");
    w.unmount();
  });
});

describe("month grid keyboard model (both widths)", () => {
  function mountGrid(compact: boolean, events: ChapterEvent[] = [event]) {
    stubViewport(compact);
    return mount(MonthGrid, {
      attachTo: document.body,
      props: {
        year: 2026,
        month: 6,
        events,
        today: "2026-07-10",
        showCategoryColors: true,
        gridLabel: "July 2026",
        selectedDay: "2026-07-10",
      },
    });
  }

  it("one tab stop on the day buttons; arrows / Home / End move it; PageDown asks for the next month", async () => {
    const w = mountGrid(false);
    const stops = w
      .findAll('[data-testid="month-grid-day-button"]')
      .filter((b) => b.attributes("tabindex") === "0");
    expect(stops).toHaveLength(1);
    expect(stops[0]?.attributes("data-date")).toBe("2026-07-10");
    expect(w.get('[role="grid"]').attributes("aria-label")).toBe("July 2026");
    expect(dayButton(w, "2026-06-28").attributes("aria-disabled")).toBe("true");
    expect(
      dayButton(w, "2026-07-10").element.parentElement?.getAttribute(
        "aria-current",
      ),
    ).toBe("date");

    const today = dayButton(w, "2026-07-10");
    (today.element as HTMLButtonElement).focus();
    await today.trigger("keydown", { key: "ArrowLeft" });
    await flushPromises();
    expect(document.activeElement?.getAttribute("data-date")).toBe(
      "2026-07-09",
    );
    await dayButton(w, "2026-07-09").trigger("keydown", { key: "ArrowUp" });
    await flushPromises();
    expect(document.activeElement?.getAttribute("data-date")).toBe(
      "2026-07-02",
    );
    await dayButton(w, "2026-07-02").trigger("keydown", { key: "Home" });
    await flushPromises();
    expect(document.activeElement?.getAttribute("data-date")).toBe(
      "2026-06-28",
    );
    await dayButton(w, "2026-06-28").trigger("keydown", { key: "End" });
    await flushPromises();
    expect(document.activeElement?.getAttribute("data-date")).toBe(
      "2026-07-04",
    );
    await dayButton(w, "2026-07-04").trigger("keydown", { key: "PageDown" });
    expect(w.emitted("monthChange")).toEqual([[1]]);
    w.unmount();
  });

  it("activation opens the event from 700px and selects the day under 700px", async () => {
    const desktop = mountGrid(false, [event, { ...second, date: event.date }]);
    expect(
      desktop
        .get('[data-testid="month-grid-day-button"][data-date="2026-07-04"]')
        .attributes("aria-pressed"),
    ).toBeUndefined();
    await dayButton(desktop, "2026-07-04").trigger("click");
    // two events → focus lands on the first chip instead of opening
    expect(document.activeElement?.getAttribute("data-testid")).toBe(
      "month-grid-event-chip",
    );
    expect(desktop.emitted("select")).toBeUndefined();
    await desktop
      .get('[data-testid="month-grid-event-chip"][data-event-id="21"]')
      .trigger("click");
    expect(desktop.emitted("select")).toEqual([["21"]]);
    await desktop.setProps({ events: [event] });
    await dayButton(desktop, "2026-07-04").trigger("click");
    expect(desktop.emitted("select")).toEqual([["21"], ["20"]]);
    expect(desktop.emitted("daySelect")).toBeUndefined();
    desktop.unmount();

    const compact = mountGrid(true);
    expect(dayButton(compact, "2026-07-10").attributes("aria-pressed")).toBe(
      "true",
    );
    await dayButton(compact, "2026-07-04").trigger("click");
    expect(compact.emitted("daySelect")).toEqual([["2026-07-04"]]);
    expect(compact.emitted("select")).toBeUndefined();
    await dayButton(compact, "2026-06-28").trigger("click"); // padding day: inert
    expect(compact.emitted("daySelect")).toEqual([["2026-07-04"]]);
    compact.unmount();
  });
});

describe("day-grouped list view", () => {
  it("summary counts hidden past days; Show N past reveals faded groups; today carries the tag; month change resets", async () => {
    stubViewport(false);
    window.history.replaceState(null, "", "/calendar/?view=list");
    const w = await mountCalendar([
      event,
      { ...second, date: "2026-07-10" },
      { ...second, id: "22", date: "2026-07-12" },
    ]);
    expect(w.get('[data-testid="event-list-summary"]').text()).toBe(
      "3 events in July",
    );
    const toggle = w.get('[data-testid="event-list-past-toggle"]');
    expect(toggle.text()).toBe("Show 1 past");
    expect(toggle.attributes("aria-pressed")).toBe("false");
    expect(
      w
        .findAll('[data-testid="event-list-day"]')
        .map((d) => d.attributes("data-date")),
    ).toEqual(["2026-07-10", "2026-07-12"]);
    const todayGroup = w.get(
      '[data-testid="event-list-day"][data-date="2026-07-10"]',
    );
    expect(todayGroup.get('[data-testid="event-list-today-tag"]').text()).toBe(
      "TODAY",
    );
    expect(todayGroup.get("h3").text()).toBe("Friday, July 10");

    await toggle.trigger("click");
    expect(toggle.text()).toBe("Hide past events");
    expect(toggle.attributes("aria-pressed")).toBe("true");
    const past = w.get(
      '[data-testid="event-list-day"][data-date="2026-07-04"]',
    );
    expect(past.attributes("data-past")).toBe("true");
    const card = past.get('[data-testid="event-card"]');
    expect(card.classes()).toContain("opacity-60");
    expect(card.get('[data-testid="event-card-meta"]').classes()).toContain(
      "text-ink",
    );
    expect(card.attributes("aria-label")).toBe(
      "View event: Contract Test Event, July 4",
    );

    await w.get('[data-testid="event-calendar-next-month"]').trigger("click");
    expect(w.get('[data-testid="event-list-empty"]').exists()).toBe(true);
    expect(w.find('[data-testid="event-list-summary"]').exists()).toBe(false);
    await w.get('[data-testid="event-calendar-prev-month"]').trigger("click");
    expect(
      w
        .get('[data-testid="event-list-past-toggle"]')
        .attributes("aria-pressed"),
    ).toBe("false");
    w.unmount();
  });
});
