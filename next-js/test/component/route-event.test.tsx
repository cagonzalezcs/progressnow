import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import singleEvent from "@fixtures/single-event.json";
import siteFixture from "@fixtures/site.json";
import { SingleEventPage } from "@/components/site/SingleEvent";
import type { SingleEventEnvelope, SiteEnvelope } from "@/lib/schemas";

/* Single event — openspec progress-now-v4-events D4 (specs "Event hero" …
 * "More upcoming events"); twin of views/single-event.twig / SingleEvent.vue.
 * Strings come from `/site`; URLs from the envelope are re-homed. */
const WP = "https://mock.example";
const site = siteFixture as unknown as SiteEnvelope;
const base = singleEvent as unknown as SingleEventEnvelope;
const fixture: SingleEventEnvelope = {
  ...base,
  homeUrl: `${WP}/`,
  calendarUrl: `${WP}/calendar/`,
};

const rich: SingleEventEnvelope = {
  ...fixture,
  event: {
    ...fixture.event,
    summary: "Bring a friend.",
    doorsTime: "5:30 PM",
    rsvpUrl: "https://actionnetwork.org/events/x",
    icsUrl: `${WP}/feed/chapter-events/?event=contract-test-event`,
    contact: { name: "Ana Organizer", email: "ana@example.org", phone: "(555) 010-2020" },
    featuredImage: {
      src: `${WP}/wp-content/uploads/hall.jpg`,
      alt: "Union Hall",
      caption: "The hall",
      credit: "Photo: X",
    },
    blocks: [
      { type: "prose", html: "<p>Agenda below.</p>" },
      { type: "agenda", items: [{ title: "6:00", desc: "Doors" }] },
      { type: "good_to_know", items: ["Childcare available"] },
      { type: "a11y_note", html: "<p>Step-free entrance.</p>" },
      { type: "map", address: "1 Union St" },
    ],
  },
  related: [
    {
      id: "r1",
      date: "2030-07-11",
      time: "7:00 PM",
      cat: "labor",
      title: "Picket line",
      location: "Plant gate",
      url: `${WP}/events/picket-line/`,
    },
    {
      id: "r2",
      date: "2030-07-18",
      time: "",
      cat: "social",
      title: "Summer social",
      location: "",
      url: `${WP}/events/summer-social/`,
    },
    {
      id: "r3",
      date: "2030-07-25",
      time: "6:00 PM",
      cat: "chapter",
      title: "General meeting",
      location: "Union Hall",
      url: `${WP}/events/general-meeting/`,
    },
    {
      id: "r4",
      date: "2030-08-01",
      time: "6:00 PM",
      cat: "chapter",
      title: "Fourth (hidden)",
      location: "",
      url: `${WP}/events/fourth/`,
    },
  ],
};

describe("single event", () => {
  it("renders hero (tile, category pill, when/where, action pills), body, sidebar, contact and more events", async () => {
    const { container } = render(
      <main>
        <SingleEventPage envelope={rich} site={site} wpOrigin={WP} />
      </main>,
    );
    expect(container.querySelector("[data-route-kind='event']")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Contract Test Event");
    // Breadcrumb: Home / Calendar (re-homed) / current.
    const crumbs = screen.getByRole("navigation", { name: /Home/ });
    expect(within(crumbs).getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(within(crumbs).getByRole("link", { name: "Calendar" })).toHaveAttribute(
      "href",
      "/calendar/",
    );
    // Date tile is decorative; the lede carries the full date.
    const tile = container.querySelector(".page-header [aria-hidden='true']")!;
    expect(tile).toHaveTextContent("04");
    expect(tile).toHaveTextContent("JUL");
    expect(
      screen.getByText("Thursday, July 4, 2030 · 6:00–8:00 PM · Union Hall · Downtown"),
    ).toBeInTheDocument();
    // Category pill filters the calendar.
    expect(screen.getByRole("link", { name: "Chapter-Wide" })).toHaveAttribute(
      "href",
      "/calendar/?category=chapter",
    );
    // Action pills.
    const rsvp = screen.getAllByRole("link", { name: "RSVP" })[0]!;
    expect(rsvp).toHaveAttribute("href", "https://actionnetwork.org/events/x");
    expect(rsvp).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(screen.getByRole("link", { name: "Add to calendar" })).toHaveAttribute(
      "href",
      rich.event.icsUrl,
    );
    // Body: about heading, image with alt, summary, every event block.
    expect(screen.getByRole("heading", { level: 2, name: "About this event" })).toBeInTheDocument();
    expect(container.querySelector("figure img")).toHaveAttribute("alt", "Union Hall");
    expect(screen.getByText("Bring a friend.")).toBeInTheDocument();
    expect(screen.getByText("Agenda below.")).toBeInTheDocument();
    expect(screen.getByText("Doors")).toBeInTheDocument();
    expect(screen.getByText("Childcare available")).toBeInTheDocument();
    expect(screen.getByText("Step-free entrance.")).toBeInTheDocument();
    expect(screen.getByText("1 Union St")).toBeInTheDocument();
    // Sidebar: details rows, save-your-spot CTA, contact.
    const aside = screen.getByRole("complementary", { name: "Details" });
    expect(within(aside).getByText("Thursday, July 4, 2030")).toBeInTheDocument();
    expect(within(aside).getByText("6:00–8:00 PM · doors 5:30 PM")).toBeInTheDocument();
    expect(within(aside).getByText("Union Hall · Downtown")).toBeInTheDocument();
    expect(within(aside).getByRole("link", { name: "RSVP Now" })).toHaveAttribute(
      "href",
      "https://actionnetwork.org/events/x",
    );
    expect(within(aside).getByText("Ana Organizer")).toBeInTheDocument();
    expect(within(aside).getByRole("link", { name: "ana@example.org" })).toHaveAttribute(
      "href",
      "mailto:ana@example.org",
    );
    expect(within(aside).getByRole("link", { name: "(555) 010-2020" })).toHaveAttribute(
      "href",
      "tel:5550102020",
    );
    // More upcoming events: three rows max, re-homed, plus the full-calendar link.
    const more = container.querySelector("[data-more-events]")!;
    expect(more.querySelectorAll("a.event-card")).toHaveLength(3);
    expect(
      within(more as HTMLElement).getByRole("link", { name: "View event: Picket line" }),
    ).toHaveAttribute("href", "/events/picket-line/");
    expect(screen.queryByText("Fourth (hidden)")).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Full calendar/ })[0]).toHaveAttribute(
      "href",
      "/calendar/",
    );
    expect(await axe(container)).toHaveNoViolations();
  }, 20_000);

  it("fixture event: no image/summary/blocks → no about heading; no RSVP → no pills, no CTA; no related → no band", async () => {
    const { container } = render(
      <main>
        <SingleEventPage envelope={fixture} site={site} wpOrigin={WP} />
      </main>,
    );
    expect(
      screen.queryByRole("heading", { level: 2, name: "About this event" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "RSVP" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "RSVP Now" })).not.toBeInTheDocument();
    // gcalUrl alone still offers "Add to calendar".
    expect(screen.getByRole("link", { name: "Add to calendar" })).toHaveAttribute(
      "href",
      fixture.event.gcalUrl,
    );
    expect(screen.queryByText("Questions? Contact")).not.toBeInTheDocument();
    expect(container.querySelector("[data-more-events]")).toBeNull();
    // Details still list date/time/location.
    const aside = screen.getByRole("complementary", { name: "Details" });
    expect(within(aside).getByText("6:00–8:00 PM")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("uses translated strings and hides related when showRelated is false", () => {
    const es = {
      ...site,
      strings: {
        ...site.strings,
        event_about: "Sobre este evento",
        event_details: "Detalles",
        cal_crumb_calendar: "Calendario",
        blog_crumb_home: "Inicio",
      },
    };
    render(
      <main>
        <SingleEventPage envelope={{ ...rich, showRelated: false }} site={es} wpOrigin={WP} />
      </main>,
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "Sobre este evento" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: "Detalles" })).toBeInTheDocument();
    expect(
      within(screen.getByRole("navigation", { name: /Inicio/ })).getByRole("link", {
        name: "Calendario",
      }),
    ).toBeInTheDocument();
    expect(document.querySelector("[data-more-events]")).toBeNull();
  });
});
