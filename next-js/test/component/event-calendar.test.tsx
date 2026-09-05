import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";
import chapterEvent from "@fixtures/chapter-event.json";
import siteFixture from "@fixtures/site.json";
import { EventCalendar } from "@/components/site/calendar/EventCalendar";
import { EventCard } from "@/components/site/calendar/EventCard";
import type { ChapterEvent, SiteEnvelope } from "@/lib/schemas";

/* openspec next-headless-site § Interactive archive and calendar;
 * next-accessibility § Keyboard, § Dialogs: server-rendered month from props,
 * Month/List toggle with aria-pressed + URL state, arrow-key grid, dialog focus
 * trap/restore/Escape, out-of-window fetch with a live status and retry. */
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
    const fourth = within(grid).getByRole("gridcell", { name: "Saturday, July 4, 1 event" });
    expect(
      within(fourth).getByRole("button", { name: `${event.title} — ${event.time}` }),
    ).toHaveAttribute("tabindex", "-1");
    const today = within(grid).getByRole("gridcell", { name: /July 10, today/ });
    expect(today).toHaveAttribute("aria-current", "date");
    expect(today).toHaveAttribute("tabindex", "0"); // the one tab stop
    expect(
      within(grid)
        .getAllByRole("gridcell")
        .filter((c) => c.tabIndex === 0),
    ).toHaveLength(1);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("Month/List toggle: aria-pressed, list rows, empty state, URL state", async () => {
    const user = userEvent.setup();
    const { container } = renderCalendar();
    const list = screen.getByRole("button", { name: "List" });
    expect(screen.getByRole("button", { name: "Month" })).toHaveAttribute("aria-pressed", "true");
    await user.click(list);
    expect(list).toHaveAttribute("aria-pressed", "true");
    expect(window.location.search).toBe("?view=list");
    expect(screen.getByRole("link", { name: `View event: ${event.title}` })).toHaveAttribute(
      "href",
      "/events/rally/",
    );
    expect(await axe(container)).toHaveNoViolations();

    await user.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("August 2026");
    expect(window.location.search).toBe("?view=list&month=2026-08");
    expect(screen.getByText("Nothing scheduled this month")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Previous month" }));
    await user.click(screen.getByRole("button", { name: "Month" }));
    expect(window.location.search).toBe("");
  });

  it("initial props come from the URL: list view, requested month, category filter", () => {
    renderCalendar({
      events: [event, second],
      initialView: "list",
      initialMonth: { year: 2026, month: 6 },
      category: "labor",
    });
    expect(screen.getByRole("button", { name: "List" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByRole("link", { name: /View event/ })).toHaveLength(1);
    expect(screen.getByRole("link", { name: "View event: Second Event" })).toBeInTheDocument();
  });

  it("arrow keys move one tab stop across days; Enter opens the day's event; Escape restores focus", async () => {
    const user = userEvent.setup();
    renderCalendar();
    const grid = screen.getByRole("grid");
    const today = within(grid).getByRole("gridcell", { name: /July 10, today/ });
    today.focus();
    await user.keyboard("{ArrowLeft}");
    expect(within(grid).getByRole("gridcell", { name: "Thursday, July 9" })).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(within(grid).getByRole("gridcell", { name: "Thursday, July 2" })).toHaveFocus();
    await user.keyboard("{ArrowRight}{ArrowRight}");
    const fourth = within(grid).getByRole("gridcell", { name: /July 4, 1 event/ });
    expect(fourth).toHaveFocus();
    await user.keyboard("{Home}");
    expect(within(grid).getByRole("gridcell", { name: "Sunday, June 28" })).toHaveFocus();
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
      expect(within(grid).getByRole("gridcell", { name: "Saturday, August 1" })).toHaveFocus(),
    );
  });

  it("a day with several events focuses its chips; chips open the dialog and close restores focus", async () => {
    const user = userEvent.setup();
    const { container } = renderCalendar({ events: [event, { ...second, date: event.date }] });
    const grid = screen.getByRole("grid");
    const fourth = within(grid).getByRole("gridcell", { name: /July 4, 2 events/ });
    fourth.focus();
    await user.keyboard("{Enter}");
    const chip1 = within(fourth).getByRole("button", { name: /Contract Test Event/ });
    const chip2 = within(fourth).getByRole("button", { name: /Second Event/ });
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
});
