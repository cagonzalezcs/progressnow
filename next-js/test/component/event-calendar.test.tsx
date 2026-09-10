import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";
import chapterEvent from "@fixtures/chapter-event.json";
import siteFixture from "@fixtures/site.json";
import { EventCalendar } from "@/components/site/calendar/EventCalendar";
import { EventCard } from "@/components/site/calendar/EventCard";
import { COMPACT_CALENDAR_QUERY } from "@/lib/compact-viewport";
import type { ChapterEvent, SiteEnvelope } from "@/lib/schemas";

/* openspec next-headless-site § Interactive archive and calendar;
 * next-accessibility § Keyboard, § Dialogs; calendar-mobile-day-agenda →
 * events-presentation § Month grid (v4), § Day agenda (compact), § Event list
 * rows: server-rendered month from props, Month/List toggle with aria-pressed
 * + URL state, arrow-key grid on the day buttons, dialog focus trap/restore/
 * Escape, out-of-window fetch with a live status and retry, the compact day
 * picker + agenda (behind a matchMedia stub) and the day-grouped list with its
 * past toggle. */
const WP = "https://mock.example";
const site = siteFixture as unknown as SiteEnvelope;
const event = { ...(chapterEvent as unknown as ChapterEvent), url: `${WP}/events/rally/` };
const second: ChapterEvent = {
  ...event,
  id: "21",
  title: "Second Event",
  time: "9:00 PM",
  cat: "labor",
};
const TODAY = "2026-07-10";
const WINDOW = { from: "2026-06-10", to: "2027-07-10" };

function renderCalendar(overrides: Partial<Parameters<typeof EventCalendar>[0]> = {}) {
  return render(
    <main>
      <h1>Calendar</h1>
      <EventCalendar
        events={[event]}
        window={WINDOW}
        todayISO={TODAY}
        lang="en"
        basePath="/calendar/"
        icsUrl={`${WP}/feed/chapter-events/`}
        categories={site.categories}
        wpOrigin={WP}
        {...overrides}
      />
    </main>,
  );
}

/** Under 700px: the day buttons select instead of opening the dialog. */
function stubCompact() {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: query === COMPACT_CALENDAR_QUERY,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList,
  );
}

const agenda = () => screen.getByRole("region", { name: "Events on selected day" });

afterEach(() => {
  vi.restoreAllMocks();
  window.history.replaceState(null, "", "/calendar/");
});

describe("EventCalendar", () => {
  it("renders the month grid with the event chip, today marked, and is axe-clean", async () => {
    const { container } = renderCalendar();
    expect(screen.getByRole("heading", { level: 2, name: "July 2026" })).toHaveAttribute(
      "aria-live",
      "polite",
    );
    const grid = screen.getByRole("grid", { name: "July 2026" });
    expect(within(grid).getAllByRole("columnheader")).toHaveLength(7);
    const fourth = within(grid).getByRole("button", { name: "Saturday, July 4, 1 event" });
    expect(fourth).not.toHaveAttribute("aria-pressed"); // desktop: opens, does not toggle
    expect(
      within(fourth.parentElement!).getByRole("button", { name: `${event.title} — ${event.time}` }),
    ).toHaveAttribute("tabindex", "-1");
    const today = within(grid).getByRole("button", { name: "Friday, July 10, no events, today" });
    expect(today.parentElement).toHaveAttribute("aria-current", "date");
    expect(today).toHaveAttribute("tabindex", "0"); // the one tab stop
    expect(
      within(grid)
        .getAllByRole("button")
        .filter((b) => b.tabIndex === 0),
    ).toHaveLength(1);
    expect(
      within(grid).getByRole("button", { name: "Sunday, June 28, no events" }),
    ).toHaveAttribute("aria-disabled", "true");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("Month/List toggle: aria-pressed, day groups with the past toggle, empty state, URL state", async () => {
    const user = userEvent.setup();
    const { container } = renderCalendar();
    const list = screen.getByRole("button", { name: "List" });
    expect(screen.getByRole("button", { name: "Month" })).toHaveAttribute("aria-pressed", "true");
    await user.click(list);
    expect(list).toHaveAttribute("aria-pressed", "true");
    expect(window.location.search).toBe("?view=list");
    // July 4 is before today (July 10) → counted in the summary, hidden until toggled
    expect(screen.getByTestId("event-list-summary")).toHaveTextContent("1 event in July");
    const past = screen.getByRole("button", { name: "Show 1 past" });
    expect(past).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByRole("link", { name: /View event/ })).toBeNull();
    await user.click(past);
    expect(past).toHaveAttribute("aria-pressed", "true");
    expect(past).toHaveTextContent("Hide past events");
    const group = screen.getByTestId("event-list-day");
    expect(group).toHaveAttribute("data-past", "true");
    expect(within(group).getByRole("heading", { level: 3 })).toHaveTextContent("Saturday, July 4");
    const link = screen.getByRole("link", { name: `View event: ${event.title}, July 4` });
    expect(link).toHaveAttribute("href", "/events/rally/");
    expect(link).toHaveAttribute("data-past", "true");
    expect(await axe(container)).toHaveNoViolations();

    await user.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("August 2026");
    expect(window.location.search).toBe("?view=list&month=2026-08");
    expect(screen.getByText("Nothing scheduled this month")).toBeInTheDocument();
    expect(screen.queryByTestId("event-list-summary")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Previous month" }));
    // month change resets the past toggle
    expect(screen.getByRole("button", { name: "Show 1 past" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await user.click(screen.getByRole("button", { name: "Month" }));
    expect(window.location.search).toBe("");
  });

  it("initial props come from the URL: list view, requested month, category filter; chips change it", async () => {
    const user = userEvent.setup();
    renderCalendar({
      events: [event, second],
      todayISO: "2026-07-01", // both events upcoming
      initialView: "list",
      initialMonth: { year: 2026, month: 6 },
      category: "labor",
    });
    expect(screen.getByRole("button", { name: "List" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByRole("link", { name: /View event/ })).toHaveLength(1);
    expect(
      screen.getByRole("link", { name: "View event: Second Event, July 4" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /past/ })).toBeNull(); // nothing past → no toggle
    const filter = screen.getByRole("group", { name: "Filter:" });
    expect(within(filter).getByRole("button", { name: "Labor" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await user.click(within(filter).getByRole("button", { name: "All events" }));
    expect(screen.getAllByRole("link", { name: /View event/ })).toHaveLength(2);
    expect(screen.getByTestId("event-list-summary")).toHaveTextContent("2 events in July");
    expect(window.location.search).toBe("?view=list"); // July is the current month → no month param
    await user.click(within(filter).getByRole("button", { name: "Chapter-Wide" }));
    expect(window.location.search).toBe("?view=list&category=chapter");
  });

  it("arrow keys move one tab stop across days; Enter opens the day's event; Escape restores focus", async () => {
    const user = userEvent.setup();
    renderCalendar();
    const grid = screen.getByRole("grid");
    const today = within(grid).getByRole("button", { name: /July 10, no events, today/ });
    today.focus();
    await user.keyboard("{ArrowLeft}");
    expect(within(grid).getByRole("button", { name: "Thursday, July 9, no events" })).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(within(grid).getByRole("button", { name: "Thursday, July 2, no events" })).toHaveFocus();
    await user.keyboard("{ArrowRight}{ArrowRight}");
    const fourth = within(grid).getByRole("button", { name: /July 4, 1 event/ });
    expect(fourth).toHaveFocus();
    await user.keyboard("{Home}");
    expect(within(grid).getByRole("button", { name: "Sunday, June 28, no events" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(fourth).toHaveFocus();

    await user.keyboard("{Enter}");
    const dialog = await screen.findByRole("dialog", { name: event.title });
    expect(within(dialog).getByText(event.title)).toBeInTheDocument();
    expect(within(dialog).getByText(/When:/).parentElement).toHaveTextContent(
      "Sat, July 4, 2026 · 6:00–8:00 PM",
    );
    expect(within(dialog).getByRole("link", { name: "View event" })).toHaveAttribute(
      "href",
      "/events/rally/",
    );
    expect(dialog).toContainElement(document.activeElement as HTMLElement); // trapped
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(fourth).toHaveFocus()); // restored

    await user.keyboard("{PageDown}");
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("August 2026");
    await waitFor(() =>
      expect(
        within(grid).getByRole("button", { name: "Saturday, August 1, no events" }),
      ).toHaveFocus(),
    );
  });

  it("a day with several events focuses its chips; chips open the dialog and close restores focus", async () => {
    const user = userEvent.setup();
    const { container } = renderCalendar({ events: [event, { ...second, date: event.date }] });
    const grid = screen.getByRole("grid");
    const fourth = within(grid).getByRole("button", { name: /July 4, 2 events/ });
    const cell = fourth.parentElement!;
    fourth.focus();
    await user.keyboard("{Enter}");
    const chip1 = within(cell).getByRole("button", { name: /Contract Test Event/ });
    const chip2 = within(cell).getByRole("button", { name: /Second Event/ });
    expect(chip1).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(chip2).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(fourth).toHaveFocus();

    await user.click(chip2);
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Second Event")).toBeInTheDocument();
    expect(await axe(container.ownerDocument.body)).toHaveNoViolations();
    await user.click(within(dialog).getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(chip2).toHaveFocus());
  });

  it("out-of-window month: live loading status, same-origin fetch, error + retry", async () => {
    const user = userEvent.setup();
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response("nope", { status: 503 }))
      .mockResolvedValueOnce(
        Response.json({
          events: [{ ...event, id: "99", date: "2026-05-02", title: "May Day" }],
          categories: [],
        }),
      );
    renderCalendar({ fetchImpl, initialMonth: { year: 2026, month: 5 } });
    // June 2026 is not fully inside the window (from 06-10) → fetched
    expect(screen.getByRole("status")).toHaveTextContent("Loading events…");
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("We couldn’t load the calendar");
    expect(within(alert).getByRole("link", { name: "iCal / .ics" })).toHaveAttribute(
      "href",
      `${WP}/feed/chapter-events/`,
    );
    expect(fetchImpl.mock.calls[0]![0]).toBe("/api/events/?lang=en&from=2026-06-01&to=2026-06-30");

    await user.click(within(alert).getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    // ready → grid renders (no chips in June); switch to May via cache-free path: only one fetch per month
    await act(async () => {
      await user.click(screen.getByRole("button", { name: "Next month" }));
    });
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("July 2026");
    expect(fetchImpl).toHaveBeenCalledTimes(2); // in-window month needs no fetch
    await user.click(screen.getByRole("button", { name: "Previous month" }));
    expect(fetchImpl).toHaveBeenCalledTimes(2); // June cached
  });
});

describe("EventCalendar under 700px (compact day picker + day agenda)", () => {
  it("tapping a dotted day lists its cards; an empty day offers Jump to next event; resets on filter and month; see-list writes the URL", async () => {
    stubCompact();
    const user = userEvent.setup();
    const twelfth = { ...second, date: "2026-07-12" };
    const { container } = renderCalendar({ events: [event, twelfth] });
    const grid = screen.getByRole("grid");
    // default selection = today (current month), which has nothing scheduled
    const today = within(grid).getByRole("button", { name: /July 10, no events, today/ });
    expect(today).toHaveAttribute("aria-pressed", "true");
    expect(today.parentElement).toHaveAttribute("data-selected", "true");
    expect(within(agenda()).getByRole("heading", { level: 3 })).toHaveTextContent("Friday, Jul 10");
    expect(screen.getByTestId("day-agenda-count")).toHaveTextContent("No events");
    expect(screen.getByTestId("day-agenda-empty")).toHaveTextContent(
      "Nothing scheduled on this day",
    );
    expect(screen.getByTestId("month-grid-hint-compact")).toHaveTextContent(
      "Tap a day to see what’s happening.",
    );
    expect(await axe(container)).toHaveNoViolations();

    // tap a dotted day → its cards, no dialog
    const fourth = within(grid).getByRole("button", { name: "Saturday, July 4, 1 event" });
    await user.click(fourth);
    expect(fourth).toHaveAttribute("aria-pressed", "true");
    expect(today).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(within(agenda()).getByRole("heading", { level: 3 })).toHaveTextContent(
      "Saturday, Jul 4",
    );
    expect(screen.getByTestId("day-agenda-count")).toHaveTextContent("1 event");
    const card = within(agenda()).getByRole("link", { name: `View event: ${event.title}, July 4` });
    expect(card).toHaveAttribute("href", "/events/rally/");
    expect(card).toHaveTextContent(`${event.time} · ${event.location}`);
    expect(await axe(container)).toHaveNoViolations();

    // empty day → note + jump to the next event day (July 12)
    await user.click(within(grid).getByRole("button", { name: "Monday, July 6, no events" }));
    const jump = screen.getByRole("button", { name: "Jump to next event · Jul 12" });
    await user.click(jump);
    expect(within(grid).getByRole("button", { name: "Sunday, July 12, 1 event" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      within(agenda()).getByRole("link", { name: "View event: Second Event, July 12" }),
    ).toBeInTheDocument();
    // after the last event day the jump wraps to the month's first event day
    await user.click(within(grid).getByRole("button", { name: "Monday, July 20, no events" }));
    expect(screen.getByRole("button", { name: "Jump to next event · Jul 4" })).toBeInTheDocument();

    // keyboard: arrows still move the one tab stop; Space selects instead of opening
    within(grid).getByRole("button", { name: "Monday, July 20, no events" }).focus();
    await user.keyboard("{ArrowLeft}");
    const nineteenth = within(grid).getByRole("button", { name: "Sunday, July 19, no events" });
    expect(nineteenth).toHaveFocus();
    await user.keyboard(" ");
    expect(nineteenth).toHaveAttribute("aria-pressed", "true");
    expect(nineteenth).toHaveFocus();
    expect(within(agenda()).getByRole("heading", { level: 3 })).toHaveTextContent("Sunday, Jul 19");

    // category chip → selection returns to the default (today) and the dots follow the filter
    await user.click(
      within(screen.getByRole("group", { name: "Filter:" })).getByRole("button", { name: "Labor" }),
    );
    expect(today).toHaveAttribute("aria-pressed", "true");
    expect(
      within(grid).getByRole("button", { name: "Saturday, July 4, no events" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Jump to next event · Jul 12" })).toBeInTheDocument();

    // month change → default for a month without events is the 1st, no jump, list link still there
    await user.click(screen.getByRole("button", { name: "Next month" }));
    expect(
      within(grid).getByRole("button", { name: "Saturday, August 1, no events" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("day-agenda-count")).toHaveTextContent("No events");
    expect(screen.queryByRole("button", { name: /Jump to next event/ })).toBeNull();
    await user.click(screen.getByRole("button", { name: "See the whole month as a list →" }));
    expect(screen.getByRole("button", { name: "List" })).toHaveAttribute("aria-pressed", "true");
    expect(window.location.search).toBe("?view=list&month=2026-08&category=labor");
    expect(screen.getByText("Nothing scheduled this month")).toBeInTheDocument();
  });

  it("labels come from the strings map (Spanish agenda copy)", () => {
    stubCompact();
    renderCalendar({
      events: [event, { ...second, date: "2026-07-04" }],
      labels: {
        tapDayHint: "Toca un día para ver qué hay.",
        dayRegionLabel: "Eventos del día seleccionado",
        noEvents: "Sin eventos",
        eventCountOne: "{n} evento",
        eventCountOther: "{n} eventos",
        jumpToNext: "Ir al próximo evento · {date}",
        seeMonthList: "Ver todo el mes como lista →",
      },
    });
    expect(screen.getByTestId("month-grid-hint-compact")).toHaveTextContent("Toca un día");
    const region = screen.getByRole("region", { name: "Eventos del día seleccionado" });
    expect(within(region).getByTestId("day-agenda-count")).toHaveTextContent("Sin eventos");
    expect(
      within(region).getByRole("button", { name: "Ir al próximo evento · Jul 4" }),
    ).toBeInTheDocument();
    expect(
      within(region).getByRole("button", { name: "Ver todo el mes como lista →" }),
    ).toBeInTheDocument();
  });
});

describe("EventCard", () => {
  it("row link with tile, when/where and the visual pill", async () => {
    const { container } = render(
      <main>
        <h1>x</h1>
        <EventCard event={event} viewLabel="View event" wpOrigin={WP} />
        <EventCard
          event={{ ...event, url: undefined }}
          fallbackUrl="/calendar/"
          subtle
          wpOrigin={WP}
        />
      </main>,
    );
    const [link, fallback] = screen.getAllByRole("link");
    expect(link).toHaveAttribute("href", "/events/rally/");
    expect(link).toHaveAccessibleName(`View event: ${event.title}`);
    expect(link).toHaveTextContent("Saturday, July 4 · 6:00–8:00 PM");
    expect(link).toHaveTextContent(event.location);
    expect(fallback).toHaveAttribute("href", "/calendar/");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("agenda variant: category bar + label, time · location, arrow; past cards fade with ink text", async () => {
    const { container } = render(
      <main>
        <h1>x</h1>
        <EventCard
          variant="agenda"
          event={event}
          category={{ label: "Chapter-Wide", color: "#B01B22" }}
          wpOrigin={WP}
        />
        <EventCard
          variant="agenda"
          event={{ ...event, url: undefined, location: "" }}
          category={{ label: "Labor", color: null }}
          past
          wpOrigin={WP}
        />
      </main>,
    );
    const [card, past] = screen.getAllByRole("link");
    expect(card).toHaveAccessibleName(`View event: ${event.title}, July 4`);
    expect(card).toHaveAttribute("data-variant", "agenda");
    expect(within(card!).getByTestId("event-card-category-bar")).toHaveStyle({
      backgroundColor: "#B01B22",
    });
    expect(within(card!).getByTestId("event-card-meta")).toHaveTextContent(
      `${event.time} · ${event.location}`,
    );
    expect(within(card!).getByTestId("event-card-category")).toHaveTextContent("Chapter-Wide");
    expect(within(card!).getByTestId("event-card-arrow")).toHaveAttribute("aria-hidden", "true");
    expect(past).toHaveAttribute("href", "/calendar/");
    expect(past).toHaveAttribute("data-past", "true");
    expect(past).toHaveClass("opacity-60");
    expect(within(past!).getByTestId("event-card-meta")).toHaveTextContent(event.time);
    expect(within(past!).getByTestId("event-card-meta")).toHaveClass("text-ink");
    expect(within(past!).getByTestId("event-card-category-bar")).not.toHaveAttribute("style");
    expect(await axe(container)).toHaveNoViolations();
  });
});
