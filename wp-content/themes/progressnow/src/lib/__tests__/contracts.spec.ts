import { describe, expect, it } from "vitest";
import categoriesJson from "../../../categories.json";
import blogPostFixture from "../../../tests/fixtures/blog-post.json";
import categoriesFixture from "../../../tests/fixtures/categories.json";
import chapterEventFixture from "../../../tests/fixtures/chapter-event.json";
import frontPageFixture from "../../../tests/fixtures/front-page.json";
import pageAboutFixture from "../../../tests/fixtures/page-about.json";
import pageCalendarFixture from "../../../tests/fixtures/page-calendar.json";
import pageGetInvolvedFixture from "../../../tests/fixtures/page-get-involved.json";
import postsEnvelopeFixture from "../../../tests/fixtures/posts-envelope.json";
import routesManifestFixture from "../../../tests/fixtures/routes-manifest.json";
import singleEventFixture from "../../../tests/fixtures/single-event.json";
import singlePostFixture from "../../../tests/fixtures/single-post.json";
import siteFixture from "../../../tests/fixtures/site.json";
import {
  blogPostSchema,
  categoriesEnvelopeSchema,
  chapterEventSchema,
  frontPageEnvelopeSchema,
  pageEnvelopeSchema,
  POST_CATS,
  postsEnvelopeSchema,
  routesManifestSchema,
  singleEventEnvelopeSchema,
  singlePostEnvelopeSchema,
  siteEnvelopeSchema,
} from "@/lib/schemas";

/* The TS half of the dual-sided contract tests: the same committed fixtures
 * PHPUnit asserts byte-equality against (tests/test-contracts.php) must
 * parse with the zod schemas. A serializer or schema change fails one side
 * until both layers agree. */

describe("contract fixtures parse with the zod schemas", () => {
  it("blog-post.json → blogPostSchema", () => {
    expect(() => blogPostSchema.parse(blogPostFixture)).not.toThrow();
  });

  it("single-post.json → singlePostEnvelopeSchema (with seo)", () => {
    const parsed = singlePostEnvelopeSchema.parse(singlePostFixture);
    expect(parsed.seo.robots).toBe("index,follow");
  });

  it("posts-envelope.json → postsEnvelopeSchema", () => {
    expect(() => postsEnvelopeSchema.parse(postsEnvelopeFixture)).not.toThrow();
  });

  it("chapter-event.json → chapterEventSchema", () => {
    expect(() => chapterEventSchema.parse(chapterEventFixture)).not.toThrow();
  });

  it("categories.json envelope → categoriesEnvelopeSchema", () => {
    const parsed = categoriesEnvelopeSchema.parse(categoriesFixture);
    expect(parsed.categories).toHaveLength(6);
  });
});

describe("route payload fixtures parse with the zod schemas", () => {
  it("site.json → siteEnvelopeSchema", () => {
    const parsed = siteEnvelopeSchema.parse(siteFixture);
    expect(parsed.identity.name).toBe("Progress Now");
    expect(parsed.header.logoUrl).toBe("");
    expect(parsed.header.logoIsDefault).toBe(true);
    expect(parsed.strings.home_events_head).toBe("Upcoming events");
  });

  it("routes-manifest.json → routesManifestSchema", () => {
    const parsed = routesManifestSchema.parse(routesManifestFixture);
    const kinds = parsed.routes.map((r) => r.kind);
    expect(kinds).toEqual(
      expect.arrayContaining(["front", "posts_index", "about", "get_involved", "calendar", "post", "event"]),
    );
    expect(parsed.routes.find((r) => r.kind === "about")?.payloadKey).toBe("page::about");
  });

  it("front-page.json → frontPageEnvelopeSchema", () => {
    const parsed = frontPageEnvelopeSchema.parse(frontPageFixture);
    expect(parsed.hero.cta_primary_label).toBe("Join us");
    expect(parsed.seo.title).toContain("Progress Now");
  });

  it("page-about.json / page-get-involved.json / page-calendar.json → pageEnvelopeSchema", () => {
    const about = pageEnvelopeSchema.parse(pageAboutFixture);
    expect(about.kind).toBe("about");
    expect(about.about?.counties.heading).toBe("Where We Organize");
    expect(about.gi).toBeNull();

    const gi = pageEnvelopeSchema.parse(pageGetInvolvedFixture);
    expect(gi.kind).toBe("get_involved");
    expect(gi.gi?.join.steps).toHaveLength(3);

    const calendar = pageEnvelopeSchema.parse(pageCalendarFixture);
    expect(calendar.kind).toBe("calendar");
    expect(calendar.calendar?.icsUrl).toContain("chapter-events");
  });

  it("single-event.json → singleEventEnvelopeSchema", () => {
    const parsed = singleEventEnvelopeSchema.parse(singleEventFixture);
    expect(parsed.event.venue).toBe("Union Hall");
    expect(parsed.seo.canonical).toBeTruthy();
  });
});

describe("canonical category slugs", () => {
  it("POST_CATS matches the categories.json registry", () => {
    expect([...POST_CATS]).toEqual(categoriesJson.map((c) => c.id));
  });
});
