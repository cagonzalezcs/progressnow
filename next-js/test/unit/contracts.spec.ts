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
import { createMock } from "../mock/api.mjs";

/* Dual-sided contracts (openspec contract-governance): PHPUnit writes these
 * fixtures from the real serializers (wp-content/themes/progressnow/tests/
 * fixtures); the shared zod schemas must accept every one of them — and the
 * fixture-backed mock, being built from the same fixtures, must too. */
describe("theme fixtures satisfy the shared schemas", () => {
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

describe("the fixture-backed mock serves contract-valid envelopes", () => {
  const mock = createMock({ origin: "https://mock.example" });

  it("routes manifest lists both languages with trailing slashes", () => {
    const manifest = routesManifestSchema.parse(mock.dispatch("routes", {}));
    expect(manifest.routes.some((r) => r.kind === "front" && r.lang === "es")).toBe(true);
    expect(manifest.routes.every((r) => r.path.endsWith("/"))).toBe(true);
    expect(manifest.routes.map((r) => r.kind)).toEqual(
      expect.arrayContaining([
        "front",
        "posts_index",
        "about",
        "get_involved",
        "calendar",
        "page",
        "post",
        "event",
      ]),
    );
  });

  it.each([
    ["site", "site", { lang: "es" }, siteEnvelopeSchema],
    ["front-page", "front-page", { lang: "en" }, frontPageEnvelopeSchema],
    ["about page", "pages/about", { lang: "en" }, pageEnvelopeSchema],
    ["spanish about page", "pages/acerca", { lang: "es" }, pageEnvelopeSchema],
    ["posts", "posts", { lang: "en" }, postsEnvelopeSchema],
    ["searched posts", "posts", { lang: "en", s: "contract" }, postsEnvelopeSchema],
    ["single post", "posts/contract-test-post", { lang: "en" }, singlePostEnvelopeSchema],
    ["single event", "events/contract-test-event", { lang: "en" }, singleEventEnvelopeSchema],
    ["categories", "categories", {}, categoriesEnvelopeSchema],
  ])("%s", (_name, path, query, schema) => {
    const body = mock.dispatch(path, query);
    expect(body).not.toBeNull();
    expect(() => schema.parse(body)).not.toThrow();
  });

  it("returns null for unknown content", () => {
    expect(mock.dispatch("pages/nope", { lang: "en" })).toBeNull();
    expect(mock.dispatch("posts/nope", {})).toBeNull();
    expect(mock.dispatch("wat", {})).toBeNull();
  });

  it("honors e2e mutation hooks", () => {
    mock.setPostTitle("contract-test-post", "Renamed by the webhook test");
    const post = singlePostEnvelopeSchema.parse(
      mock.dispatch("posts/contract-test-post", { lang: "en" }),
    );
    expect(post.title).toBe("Renamed by the webhook test");
    const list = postsEnvelopeSchema.parse(mock.dispatch("posts", { lang: "en" }));
    expect(list.posts.some((p) => p.title === "Renamed by the webhook test")).toBe(true);
    mock.reset();
    expect(
      singlePostEnvelopeSchema.parse(mock.dispatch("posts/contract-test-post", { lang: "en" }))
        .title,
    ).not.toBe("Renamed by the webhook test");
  });

  it("emits canonical and hreflang on a configured canonical origin", () => {
    mock.setCanonicalOrigin("https://app.example");
    const post = singlePostEnvelopeSchema.parse(
      mock.dispatch("posts/contract-test-post", { lang: "en" }),
    );
    expect(post.seo.canonical).toBe("https://app.example/blog/contract-test-post/");
    expect(post.seo.hreflang.every((h) => h.href.startsWith("https://app.example/"))).toBe(true);
    expect(post.languages.every((l) => l.url.startsWith("https://mock.example/"))).toBe(true);
    mock.reset();
  });
});
