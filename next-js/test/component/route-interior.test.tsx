import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import pageAbout from "@fixtures/page-about.json";
import pageCalendar from "@fixtures/page-calendar.json";
import pageGetInvolved from "@fixtures/page-get-involved.json";
import routesManifest from "@fixtures/routes-manifest.json";
import siteFixture from "@fixtures/site.json";
import { AboutPage } from "@/components/routes/RouteAbout";
import { GetInvolvedPage } from "@/components/routes/RouteGetInvolved";
import { InteriorPage } from "@/components/routes/RoutePage";
import type { PageEnvelope, SiteEnvelope } from "@/lib/schemas";

/* openspec interior-presentation: header + breadcrumb, mission band, article +
 * sidebar, committee cards, FAQ rows, subscribe strip — from theme fixtures. */
const WP = "https://mock.example";
const site = {
  ...(siteFixture as unknown as SiteEnvelope),
  chapter: {
    ...(siteFixture as unknown as SiteEnvelope).chapter,
    contact_email: "hello@example.org",
    newsletter_url: "https://news.example/",
  },
};
const manifest = routesManifest as unknown as Parameters<typeof AboutPage>[0]["manifest"];
const about = pageAbout as unknown as PageEnvelope;
const gi = pageGetInvolved as unknown as PageEnvelope;
const generic = {
  ...(pageCalendar as unknown as PageEnvelope),
  kind: "page" as const,
  about: null,
  gi: null,
  calendar: null,
  content: "<p>Editor <strong>content</strong>.</p>",
  documents: [{ title: "Bylaws", meta: "PDF", url: `${WP}/wp-content/uploads/bylaws.pdf` }],
};

describe("interior pages", () => {
  it("About: mission band, sections with anchors, committee cards, FAQ, sidebar", async () => {
    const { container } = render(
      <AboutPage page={about} site={site} manifest={manifest} lang="en" wpOrigin={WP} />,
    );
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(container.querySelector("#mission-band")).toBeInTheDocument();
    for (const id of ["chapter", "mission", "committees", "bylaws", "faq"])
      expect(container.querySelector(`h2#${id}`), id).toBeInTheDocument();
    expect(screen.getAllByRole("button").length).toBeGreaterThanOrEqual(
      about.about!.faq.rows.length,
    ); // FAQ triggers
    expect(screen.getByRole("complementary", { name: "Related" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "hello@example.org" })).toHaveAttribute(
      "href",
      "mailto:hello@example.org",
    );
    expect(screen.getByText("Never miss an update")).toBeInTheDocument();
    expect(
      await axe(container, { rules: { "landmark-unique": { enabled: false } } }),
    ).toHaveNoViolations();
  }, 20_000);

  it("Get Involved: numbered join steps, channels, committee cards, CTA card", async () => {
    const { container } = render(
      <GetInvolvedPage page={gi} site={site} manifest={manifest} lang="en" wpOrigin={WP} />,
    );
    expect(container.querySelector("h2#join")).toBeInTheDocument();
    expect(container.querySelector("h2#channels")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem").length).toBeGreaterThanOrEqual(gi.gi!.join.steps.length);
    expect(screen.getByText(gi.gi!.card.heading)).toBeInTheDocument();
    // Phone chips and the sidebar card both carry "On this page"; CSS shows one per breakpoint (e2e/axe asserts landmark-unique in the browser).
    expect(
      await axe(container, { rules: { "landmark-unique": { enabled: false } } }),
    ).toHaveNoViolations();
  }, 20_000);

  it("generic page: editor content, documents card, related links, grievance callout", async () => {
    const { container } = render(
      <InteriorPage page={generic} site={site} manifest={manifest} lang="en" wpOrigin={WP} />,
    );
    expect(screen.getByText("content")).toBeInTheDocument();
    const docs = screen.getByRole("navigation", { name: "Documents" });
    expect(within(docs).getByRole("link", { name: "Bylaws" })).toHaveAttribute(
      "href",
      `${WP}/wp-content/uploads/bylaws.pdf`,
    );
    expect(
      within(screen.getByRole("navigation", { name: "Related" })).getByRole("link", {
        name: "FAQ",
      }),
    ).toHaveAttribute("href", "/about/#faq");
    if (generic.grievance.show) expect(container.querySelector("#grievance")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  }, 20_000);
});
