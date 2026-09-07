import { describe, expect, it } from "vitest";
import {
  blogPostSchema,
  categoriesEnvelopeSchema,
  chapterEventSchema,
  frontPageEnvelopeSchema,
  pageEnvelopeSchema,
  postsEnvelopeSchema,
  routesManifestSchema,
  singleEventEnvelopeSchema,
  singlePostEnvelopeSchema,
  siteEnvelopeSchema,
} from "@/lib/schemas";
import blogPost from "@fixtures/blog-post.json";
import categories from "@fixtures/categories.json";
import chapterEvent from "@fixtures/chapter-event.json";
import frontPage from "@fixtures/front-page.json";
import pageAbout from "@fixtures/page-about.json";
import pageCalendar from "@fixtures/page-calendar.json";
import pageGetInvolved from "@fixtures/page-get-involved.json";
import postsEnvelope from "@fixtures/posts-envelope.json";
import routesManifest from "@fixtures/routes-manifest.json";
import singleEvent from "@fixtures/single-event.json";
import singlePost from "@fixtures/single-post.json";
import site from "@fixtures/site.json";
import { MOCK_ORIGIN, mockDispatch, mockRoutesManifest } from "../../shared/mock-api";

/* Dual-sided contracts: PHPUnit writes these fixtures from the real
 * serializers (wp-content/themes/progressnow/tests/fixtures); the app's zod
 * schemas must accept every one of them — and the nitro mock, being built
 * from the same fixtures, must too. */
describe("theme fixtures satisfy the app schemas", () => {
  it.each([
    ["blog-post", blogPostSchema, blogPost],
    ["categories", categoriesEnvelopeSchema, categories],
    ["chapter-event", chapterEventSchema, chapterEvent],
    ["front-page", frontPageEnvelopeSchema, frontPage],
    ["page-about", pageEnvelopeSchema, pageAbout],
    ["page-calendar", pageEnvelopeSchema, pageCalendar],
    ["page-get-involved", pageEnvelopeSchema, pageGetInvolved],
    ["posts-envelope", postsEnvelopeSchema, postsEnvelope],
    ["routes-manifest", routesManifestSchema, routesManifest],
    ["single-event", singleEventEnvelopeSchema, singleEvent],
    ["single-post", singlePostEnvelopeSchema, singlePost],
    ["site", siteEnvelopeSchema, site],
  ])("%s.json parses", (_name, schema, fixture) => {
    expect(() => schema.parse(fixture)).not.toThrow();
  });
});

describe("the nitro mock serves contract-valid envelopes", () => {
  it("routes manifest", () => {
    const manifest = routesManifestSchema.parse(mockRoutesManifest());
    expect(manifest.routes.some((r) => r.kind === "front" && r.lang === "es")).toBe(true);
    expect(manifest.routes.every((r) => r.path.endsWith("/"))).toBe(true);
  });

  it.each([
    ["site", "site", { lang: "es" }, siteEnvelopeSchema],
    ["front-page", "front-page", { lang: "en" }, frontPageEnvelopeSchema],
    ["about page", "pages/about", { lang: "en" }, pageEnvelopeSchema],
    ["spanish about page", "pages/acerca", { lang: "es" }, pageEnvelopeSchema],
    ["posts", "posts", { lang: "en" }, postsEnvelopeSchema],
    ["single post", "posts/contract-test-post", { lang: "en" }, singlePostEnvelopeSchema],
    ["single event", "events/contract-test-event", { lang: "en" }, singleEventEnvelopeSchema],
    ["categories", "categories", {}, categoriesEnvelopeSchema],
  ])("%s", (_name, path, query, schema) => {
    const body = mockDispatch(path, query);
    expect(body).not.toBeNull();
    expect(() => schema.parse(body)).not.toThrow();
  });

  it("returns null for unknown content", () => {
    expect(mockDispatch("pages/nope", { lang: "en" })).toBeNull();
    expect(mockDispatch("posts/nope", {})).toBeNull();
    expect(mockDispatch("wat", {})).toBeNull();
  });

  /* The theme builds header.homeUrl with progressnow_payload_path precisely so
   * the logo link carries no origin ("the static shell may be served from
   * another host/CDN"). A `generate:mock` build bakes whatever the mock says
   * into every prerendered page, so an origin here ships a dead logo link. */
  it("leaves header.homeUrl root-relative, like the theme fixture", () => {
    expect(site.header.homeUrl).toBe("/");
    expect(siteEnvelopeSchema.parse(mockDispatch("site", { lang: "en" })).header.homeUrl).toBe("/");
    expect(siteEnvelopeSchema.parse(mockDispatch("site", { lang: "es" })).header.homeUrl).toBe(
      "/es/",
    );
  });

  /* Everything WordPress does serialize absolutely has to sit on the origin the
   * build is served from, or the language switcher and event breadcrumbs walk
   * off-site. */
  it("mints its absolute urls on MOCK_ORIGIN", () => {
    const envelope = siteEnvelopeSchema.parse(mockDispatch("site", { lang: "en" }));
    for (const language of envelope.languages) {
      expect(language.url.startsWith(`${MOCK_ORIGIN}/`)).toBe(true);
    }

    const event = singleEventEnvelopeSchema.parse(
      mockDispatch("events/contract-test-event", { lang: "en" }),
    );
    expect(event.homeUrl).toBe(`${MOCK_ORIGIN}/`);
    expect(event.calendarUrl).toBe(`${MOCK_ORIGIN}/calendar/`);

    const calendar = pageEnvelopeSchema.parse(mockDispatch("pages/calendar", { lang: "en" }));
    expect(calendar.calendar?.icsUrl).toBe(`${MOCK_ORIGIN}/feed/chapter-events/`);
    expect(calendar.seo.canonical).toBe(`${MOCK_ORIGIN}/calendar/`);
  });
});
