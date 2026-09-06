import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import chapterEvent from "@fixtures/chapter-event.json";
import singleEvent from "@fixtures/single-event.json";
import siteFixture from "@fixtures/site.json";
import { eventLabels } from "@/components/routes/RouteEvent";
import { SingleEvent } from "@/components/site/SingleEvent";
import type { ChapterEvent, RelatedEvent, SingleEventEnvelope, SiteEnvelope } from "@/lib/schemas";

/* openspec progress-now-v4-events D4: hero (date tile, category pill, when/
 * where lede, RSVP + Add to calendar), about + blocks, Details rows, Save your
 * spot, contact note, More upcoming events — from the theme's contract fixtures. */
const WP = "https://mock.example";
const site = siteFixture as unknown as SiteEnvelope;
const envelope = singleEvent as unknown as SingleEventEnvelope;
const base = envelope.event;
const related: RelatedEvent = {
  ...(chapterEvent as unknown as ChapterEvent),
  url: `${WP}/events/rally/`,
} as RelatedEvent;

describe("SingleEvent", () => {
  it("fixture event: hero, details rows, add-to-calendar; no RSVP/contact/more — axe-clean", async () => {
    const { container } = render(
      <main>
        <SingleEvent
          event={base}
          categories={envelope.categories}
          related={[]}
          homeUrl={`${WP}/`}
          calendarUrl={`${WP}/calendar/`}
          labels={eventLabels(site)}
          wpOrigin={WP}
        />
      </main>,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(base.title);
    expect(
      screen.getByText("Thursday, July 4, 2030 · 6:00–8:00 PM · Union Hall · Downtown"),
    ).toBeInTheDocument();
    expect(screen.getByText("04").closest("[aria-hidden='true']")).not.toBeNull(); // decorative tile
    expect(screen.getByRole("link", { name: "Chapter-Wide" })).toHaveAttribute(
      "href",
      "/calendar/?category=chapter",
    );
    expect(screen.getByRole("link", { name: "Add to calendar" })).toHaveAttribute(
      "href",
      base.gcalUrl,
    );
    expect(screen.queryByRole("link", { name: /^RSVP/ })).toBeNull();
    const aside = screen.getByRole("complementary", { name: "Event details" });
    expect(within(aside).getByText("Date").nextElementSibling).toHaveTextContent(
      "Thursday, July 4, 2030",
    );
    expect(within(aside).getByText("Location").nextElementSibling).toHaveTextContent(
      "Union Hall · Downtown",
    );
    expect(screen.queryByText("Save your spot")).toBeNull();
    expect(screen.queryByText("Questions? Contact")).toBeNull();
    expect(screen.queryByText("About this event")).toBeNull(); // no body content
    expect(container.querySelector("[data-more-events]")).toBeNull();
    // Breadcrumb re-homed from the WordPress absolute URLs
    const crumbs = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(crumbs).getByRole("link", { name: "Calendar" })).toHaveAttribute(
      "href",
      "/calendar/",
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("full event: RSVP pills, summary + blocks, save-your-spot, contact, related rows", async () => {
    const full = {
      ...base,
      summary: "Bring a friend.",
      rsvpUrl: "https://rsvp.example/x",
      icsUrl: `${WP}/feed/chapter-events/?event=1`,
      doorsTime: "5:30 PM",
      locationType: "hybrid" as const,
      contact: { name: "Ana", email: "ana@example.org", phone: "+1 (512) 555-0100" },
      blocks: [
        { type: "prose" as const, html: "<p>Details here.</p>" },
        { type: "agenda" as const, items: [{ title: "Welcome", desc: "5 min" }] },
        { type: "good_to_know" as const, items: ["Masks welcome"] },
        { type: "a11y_note" as const, html: "<p>Step-free entrance.</p>" },
        { type: "map" as const, address: "Union Hall, Downtown" },
      ],
    };
    const { container } = render(
      <main>
        <SingleEvent
          event={full}
          categories={envelope.categories}
          related={[
            related,
            { ...related, id: "31", title: "Later" },
            { ...related, id: "32" },
            { ...related, id: "33" },
          ]}
          calendarUrl="/calendar/"
          wpOrigin={WP}
        />
      </main>,
    );
    expect(screen.getAllByRole("link", { name: /^RSVP/ })[0]).toHaveAttribute(
      "href",
      "https://rsvp.example/x",
    );
    expect(screen.getByRole("link", { name: "Add to calendar" })).toHaveAttribute(
      "href",
      full.icsUrl,
    ); // ics beats gcal, stays on WP
    expect(screen.getByRole("heading", { level: 2, name: "About this event" })).toBeInTheDocument();
    expect(screen.getByText("Bring a friend.")).toBeInTheDocument();
    expect(screen.getAllByText(/Union Hall · Downtown · or online/).length).toBeGreaterThan(0);
    const aside = screen.getByRole("complementary", { name: "Event details" });
    expect(within(aside).getByText("Time").nextElementSibling).toHaveTextContent(
      "6:00–8:00 PM · doors 5:30 PM",
    );
    expect(within(aside).getByRole("link", { name: "RSVP Now" })).toHaveAttribute(
      "href",
      "https://rsvp.example/x",
    );
    expect(within(aside).getByRole("link", { name: "ana@example.org" })).toHaveAttribute(
      "href",
      "mailto:ana@example.org",
    );
    expect(within(aside).getByRole("link", { name: "+1 (512) 555-0100" })).toHaveAttribute(
      "href",
      "tel:+15125550100",
    );
    expect(container.querySelector(".block-prose")).toHaveTextContent("Details here.");
    expect(screen.getByText("Welcome")).toBeInTheDocument();
    expect(screen.getByText("Masks welcome")).toBeInTheDocument();
    const more = container.querySelector("[data-more-events]")!;
    expect(within(more as HTMLElement).getAllByRole("link", { name: /View event: / })).toHaveLength(
      3,
    ); // capped
    expect(
      within(more as HTMLElement).getAllByRole("link", { name: "Full calendar" }),
    ).toHaveLength(2); // md+ and mobile
    expect(await axe(container)).toHaveNoViolations();
  });

  it("showRelated=false hides the band even with related events", () => {
    const { container } = render(
      <SingleEvent event={base} related={[related]} showRelated={false} wpOrigin={WP} />,
    );
    expect(container.querySelector("[data-more-events]")).toBeNull();
  });
});
