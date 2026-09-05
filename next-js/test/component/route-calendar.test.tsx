import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it } from "vitest";
import chapterEvent from "@fixtures/chapter-event.json";
import pageCalendar from "@fixtures/page-calendar.json";
import routesManifest from "@fixtures/routes-manifest.json";
import siteFixture from "@fixtures/site.json";
import { CalendarIsland, CalendarPage } from "@/components/routes/RouteCalendar";
import type { ChapterEvent, PageEnvelope, RoutesManifest, SiteEnvelope } from "@/lib/schemas";

/* openspec fix-calendar-page-layout spec calendar-route: server-rendered v4
 * page, props window, URL state, month nav, grid labels/keyboard, dialog,
 * list/empty, subscribe strip, axe. The fixture event is 2026-07-04. */
const WP = "https://mock.example";
const site = siteFixture as unknown as SiteEnvelope;
const page = pageCalendar as unknown as PageEnvelope;
const manifest = routesManifest as unknown as RoutesManifest;
const fixtureEvent = chapterEvent as unknown as ChapterEvent;
const JULY = { year: 2026, month: 6 };
const TODAY = "2026-07-10";

function renderCalendar(
  opts: {
    events?: ChapterEvent[];
    initialView?: string;
    initialCategory?: string;
    initialMonth?: { year: number; month: number };
  } = {},
) {
  return render(
    <CalendarPage page={page} site={site} manifest={manifest} lang="en" wpOrigin={WP}>
      <CalendarIsland
        site={site}
        page={page}
        events={opts.events ?? [fixtureEvent]}
        lang="en"
        today={TODAY}
        fallbackUrl="/calendar/"
        initialView={opts.initialView}
        initialCategory={opts.initialCategory}
        initialMonth={opts.initialMonth ?? JULY}
      />
    </CalendarPage>,
  );
}

beforeEach(() => window.history.replaceState(null, "", "/calendar/"));

describe("calendar page", () => {
  it("renders header, toolbar, grid with the fixture chip, subscribe strip; one h1; no axe violations", async () => {
    const { container } = renderCalendar();
    expect(container.querySelector("[data-route-kind='calendar']")).not.toBeNull();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(page.title);
    expect(
      within(screen.getByRole("navigation", { name: "Breadcrumb" })).getByRole("link", {
        name: "Home",
      }),
    ).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Previous month" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next month" })).toBeInTheDocument();
    expect(container.querySelector("[data-month-label]")).toHaveAttribute("aria-live", "polite");
    expect(container.querySelector("[data-month-label]")).toHaveTextContent("July 2026");
    const view = screen.getByRole("group", { name: "View" });
    expect(within(view).getByRole("button", { name: "Month" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(within(view).getByRole("button", { name: "List" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );

    const filter = screen.getByRole("group", { name: site.strings.cal_filter });
    expect(within(filter).getByRole("button", { name: "All events" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(within(filter).getAllByRole("button")).toHaveLength(7);

    const grid = screen.getByRole("group", { name: "July 2026" });
    const chip = within(grid).getByRole("button", { name: fixtureEvent.title });
    expect(chip).toHaveAttribute("tabindex", "0");
    expect(chip).toHaveStyle({ backgroundColor: "#B01B22" }); // chapter term color
    const cell = container.querySelector("[data-date='2026-07-04']")!;
    expect(cell).toHaveTextContent("Saturday, July 4, 1 event");
    expect(container.querySelector("[data-date='2026-06-28']")).toHaveClass("bg-alt"); // leading out-of-month cell

    const strip = container.querySelector("#subscribe")!;
    expect(strip).toHaveAttribute("data-tone", "ink");
    expect(
      within(strip as HTMLElement).getByRole("link", { name: site.strings.cal_google }),
    ).toHaveAttribute("href", page.calendar!.googleCalUrl);
    expect(
      within(strip as HTMLElement).getByRole("link", { name: site.strings.cal_ics }),
    ).toHaveAttribute("href", page.calendar!.icsUrl);

    expect(await axe(container)).toHaveNoViolations();
  });

  it("chip opens the dialog; Escape closes it and restores focus; no RSVP without rsvpUrl", async () => {
    const user = userEvent.setup();
    const { container } = renderCalendar();
    const chip = screen.getByRole("button", { name: fixtureEvent.title });
    await user.click(chip);
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(fixtureEvent.title)).toBeInTheDocument();
    expect(within(dialog).getByText(/When:/).closest("span")).toHaveTextContent(
      "Sat, July 4, 2026 · 6:00–8:00 PM",
    );
    expect(
      within(dialog)
        .getByText(/Where:/)
        .closest("span"),
    ).toHaveTextContent(fixtureEvent.location);
    expect(within(dialog).getByRole("link", { name: "View event" })).toHaveAttribute(
      "href",
      fixtureEvent.url,
    );
    expect(within(dialog).queryByRole("link", { name: "RSVP" })).toBeNull();
    expect(within(dialog).getByRole("button", { name: "Close" })).toBeInTheDocument();
    expect(await axe(document.body)).toHaveNoViolations();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(chip).toHaveFocus());
    expect(container.querySelector("[data-route-kind='calendar']")).not.toBeNull();
  });

  it("list view renders rows; an empty month renders the cal_empty_* state; axe clean", async () => {
    const user = userEvent.setup();
    const { container } = renderCalendar({ initialView: "list" });
    expect(screen.getByRole("button", { name: "List" })).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelector(".event-card")).not.toBeNull();
    expect(screen.getByRole("link", { name: `View event: ${fixtureEvent.title}` })).toHaveAttribute(
      "href",
      fixtureEvent.url,
    );
    expect(await axe(container)).toHaveNoViolations();

    await user.click(screen.getByRole("button", { name: "Next month" }));
    expect(container.querySelector("[data-month-label]")).toHaveTextContent("August 2026");
    expect(container.querySelector("[data-empty='month']")).toHaveTextContent(
      site.strings.cal_empty_h,
    );
    expect(container.querySelector("[data-empty='month']")).toHaveTextContent(
      site.strings.cal_empty_p,
    );
    expect(container.querySelector(".event-card")).toBeNull();
  });

  it("?category= and ?view= seed the state; defaults are removed from the URL on write-back", async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/calendar/?view=list&category=labor");
    renderCalendar({ initialView: "list", initialCategory: "labor" });
    expect(screen.getByRole("button", { name: "Labor" })).toHaveAttribute("aria-pressed", "true");
    // the fixture event is "chapter": filtered out
    expect(screen.queryByRole("link", { name: `View event: ${fixtureEvent.title}` })).toBeNull();

    await user.click(screen.getByRole("button", { name: "All events" }));
    expect(window.location.search).toBe("?view=list");
    await user.click(screen.getByRole("button", { name: "Month" }));
    expect(window.location.search).toBe("");
    await user.click(screen.getByRole("button", { name: "Chapter-Wide" }));
    expect(window.location.search).toBe("?category=chapter");
    expect(screen.getByRole("button", { name: fixtureEvent.title })).toBeInTheDocument();
  });

  it("unknown ?view / ?category fall back to defaults", () => {
    renderCalendar({ initialView: "week", initialCategory: "nope" });
    expect(screen.getByRole("button", { name: "Month" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "All events" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("arrow keys rove between chips; Home/End jump; ↓ finds the chip a week later", async () => {
    const user = userEvent.setup();
    const events: ChapterEvent[] = [
      { ...fixtureEvent, id: "a", date: "2026-07-04", title: "A" },
      { ...fixtureEvent, id: "b", date: "2026-07-07", title: "B" },
      { ...fixtureEvent, id: "c", date: "2026-07-11", title: "C" },
    ];
    renderCalendar({ events });
    const [a, b, c] = ["A", "B", "C"].map((n) => screen.getByRole("button", { name: n }));
    expect(a).toHaveAttribute("tabindex", "0");
    expect(b).toHaveAttribute("tabindex", "-1");
    a!.focus();
    await user.keyboard("{ArrowRight}");
    expect(b).toHaveFocus();
    expect(a).toHaveAttribute("tabindex", "-1");
    await user.keyboard("{End}");
    expect(c).toHaveFocus();
    await user.keyboard("{Home}");
    expect(a).toHaveFocus();
    await user.keyboard("{ArrowDown}"); // Sat Jul 4 → Sat Jul 11
    expect(c).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(a).toHaveFocus();
  });
});
