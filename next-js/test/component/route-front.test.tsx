import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import frontFixture from "@fixtures/front-page.json";
import siteFixture from "@fixtures/site.json";
import { FrontPage } from "@/components/routes/RouteFront";
import type { FrontPageEnvelope, SiteEnvelope } from "@/lib/schemas";

/* openspec front-page: hero, who-we-are, upcoming events (+ empty state), blog
 * teasers (+ empty state), closing CTA — from the theme fixtures, axe-clean. */
const WP = "http://example.org";
const front = frontFixture as unknown as FrontPageEnvelope;
const site = siteFixture as unknown as SiteEnvelope;

describe("FrontPage", () => {
  it("renders every section from the envelopes with one h1 and re-homed links", async () => {
    const { container } = render(<FrontPage front={front} site={site} wpOrigin={WP} />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      site.identity.hero_headline,
    );
    expect(screen.getByText(front.hero.subhead)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: front.hero.cta_primary_label })).toHaveAttribute(
      "href",
      "/get-involved/#join",
    );
    expect(screen.getByRole("heading", { level: 2, name: /We are/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View event: Contract Test Event/ })).toHaveAttribute(
      "href",
      "/?event=contract-test-event",
    );
    expect(screen.getByRole("heading", { level: 2, name: "From the blog" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Contract Test Post/ })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Join us" })).toBeInTheDocument();
    expect(container.querySelectorAll("[data-tone]").length).toBeGreaterThanOrEqual(4);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders the designed empty states when there are no events or posts", () => {
    render(
      <FrontPage
        front={{ ...front, events: [], blog: { featured: null, rows: [] } }}
        site={site}
        wpOrigin={WP}
      />,
    );
    expect(screen.getByText("No events on the books yet")).toBeInTheDocument();
    const empty = screen.getByText(/New meetings and actions land on the/).closest("p")!;
    expect(within(empty).getByRole("link", { name: "calendar" })).toHaveAttribute("href", "/");
    expect(screen.getByText("Posts coming soon")).toBeInTheDocument();
  });
});
