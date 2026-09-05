import { describe, expect, it } from "vitest";
import singleEvent from "@fixtures/single-event.json";
import singlePost from "@fixtures/single-post.json";
import siteFixture from "@fixtures/site.json";
import {
  articleNode,
  canonicalOrigin,
  displayDateToIso,
  eventNode,
  gcalToIso,
  jsonLdGraph,
  organizationNode,
  serializeJsonLd,
  zoneOffset,
} from "@/lib/json-ld";
import type { SingleEventEnvelope, SinglePostEnvelope, SiteEnvelope } from "@/lib/schemas";

/* openspec spec structured-data: Organization (name, url, logo, sameAs),
 * Article (headline, description, dates, image, Person/committee author),
 * Event (name, ISO start/end in the chapter zone, Place, Offer) — parity with
 * inc/seo.php, built from the envelopes. */
const site = siteFixture as unknown as SiteEnvelope;
const post = singlePost as unknown as SinglePostEnvelope;
const event = singleEvent as unknown as SingleEventEnvelope;
const o = {
  canonicalOrigin: "https://canonical.example",
  siteOrigin: "https://app.example",
  wpOrigin: "http://example.org",
};

describe("json-ld", () => {
  it("Organization: name, canonical url/@id, logo on the app origin, only configured sameAs", () => {
    const node = organizationNode(
      {
        ...site,
        chapter: {
          ...site.chapter,
          socials: [
            { name: "Facebook", url: "https://fb.example/pn" },
            { name: "X", url: "" },
          ],
          instagram_url: "https://instagram.example/pn",
        },
      },
      o,
    );
    expect(node).toEqual({
      "@type": "Organization",
      "@id": "https://canonical.example/#organization",
      name: "Progress Now",
      url: "https://canonical.example/",
      logo: "https://app.example/wp-content/themes/progressnow/static/images/brand/logo-square.png",
      sameAs: ["https://fb.example/pn", "https://instagram.example/pn"],
    });
    expect(organizationNode(site, o)).not.toHaveProperty("sameAs"); // fixture has no profiles
  });

  it("Article: Person vs committee Organization author, dates from the display date, publisher ref", () => {
    const named = articleNode({ ...post, author: "Lorem Ipsum", date: "June 1, 2026" }, o);
    expect(named).toMatchObject({
      "@type": "Article",
      headline: post.title,
      description: post.seo.description,
      datePublished: "2026-06-01",
      dateModified: "2026-06-01",
      mainEntityOfPage: post.seo.canonical,
      author: { "@type": "Person", name: "Lorem Ipsum" },
      publisher: { "@id": "https://canonical.example/#organization" },
    });
    expect(named).not.toHaveProperty("image"); // fixture has no featured image
    const committee = articleNode(
      { ...post, bylineMode: "committee", committee: "Housing Committee" },
      o,
    );
    expect(committee.author).toEqual({ "@type": "Organization", name: "Housing Committee" });
    const es = articleNode({ ...post, date: "1 de junio de 2026" }, o);
    expect(es).not.toHaveProperty("datePublished"); // unparseable display date → omitted, never wrong
    expect(displayDateToIso("Sep 5, 2026")).toBe("2026-09-05");
  });

  it("Event: ISO start/end with the chapter zone offset from the gcal URL, Place, Offer", () => {
    expect(gcalToIso(event.event.gcalUrl)).toEqual({
      start: "2030-07-04T18:00:00-05:00",
      end: "2030-07-04T20:00:00-05:00",
    });
    expect(zoneOffset("America/Chicago", new Date("2030-01-15T12:00:00Z"))).toBe("-06:00"); // CST
    expect(zoneOffset("UTC", new Date())).toBe("+00:00");
    expect(gcalToIso("not a url")).toBeNull();
    const node = eventNode(
      { ...event, event: { ...event.event, rsvpUrl: "https://rsvp.example/x" } },
      o,
    )!;
    expect(node).toMatchObject({
      "@type": "Event",
      name: "Contract Test Event",
      startDate: "2030-07-04T18:00:00-05:00",
      endDate: "2030-07-04T20:00:00-05:00",
      url: event.seo.canonical,
      organizer: { "@id": "https://canonical.example/#organization" },
      description: event.seo.description, // summary empty → seo description
      location: {
        "@type": "Place",
        name: "Union Hall",
        address: { "@type": "PostalAddress", addressLocality: "Downtown" },
      },
      offers: { "@type": "Offer", url: "https://rsvp.example/x" },
    });
    expect(eventNode({ ...event, event: { ...event.event, gcalUrl: "" } }, o)).toBeNull();
  });

  it("graph + serialization: null nodes dropped, `<` escaped, canonical origin fallback", () => {
    const graph = jsonLdGraph([organizationNode(site, o), null]);
    expect(graph["@context"]).toBe("https://schema.org");
    expect(graph["@graph"]).toHaveLength(1);
    expect(serializeJsonLd({ a: "</script>" })).toBe('{"a":"\\u003c/script>"}');
    expect(canonicalOrigin(post.seo, "https://app.example")).toBe("http://example.org");
    expect(canonicalOrigin({ ...post.seo, canonical: "" }, "https://app.example")).toBe(
      "https://app.example",
    );
  });
});
