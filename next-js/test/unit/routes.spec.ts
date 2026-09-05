import { describe, expect, it } from "vitest";
import { routesManifestSchema } from "@/lib/schemas";
import { findRoute, langForPath, normalizePath, payloadSlug, resolveRoute } from "@/lib/routes";
import { createMock } from "../mock/api.mjs";

/* Ported unchanged from nuxt-js/test/unit/routes.spec.ts (openspec
 * next-test-harness § Resolver parity). */
const manifest = routesManifestSchema.parse(createMock().routesManifest());

describe("normalizePath", () => {
  it("adds the WordPress trailing slash and collapses doubles", () => {
    expect(normalizePath("/about")).toBe("/about/");
    expect(normalizePath("/about/")).toBe("/about/");
    expect(normalizePath("")).toBe("/");
    expect(normalizePath("//es//blog")).toBe("/es/blog/");
    expect(normalizePath("/blog/caf%C3%A9")).toBe("/blog/café/");
  });
});

describe("langForPath", () => {
  it("picks the longest front-route prefix", () => {
    expect(langForPath(manifest, "/")).toBe("en");
    expect(langForPath(manifest, "/about/")).toBe("en");
    expect(langForPath(manifest, "/es/")).toBe("es");
    expect(langForPath(manifest, "/es/acerca/")).toBe("es");
    expect(langForPath(manifest, "/es/unknown/")).toBe("es");
  });
});

describe("resolveRoute", () => {
  it("resolves manifest paths in both languages, slash-insensitively", () => {
    expect(resolveRoute(manifest, "/").kind).toBe("front");
    expect(resolveRoute(manifest, "/about").kind).toBe("about");
    expect(resolveRoute(manifest, "/es/acerca/")).toMatchObject({ kind: "about", lang: "es" });
    expect(resolveRoute(manifest, "/blog/contract-test-post/")).toMatchObject({
      kind: "post",
      lang: "en",
    });
    expect(resolveRoute(manifest, "/events/contract-test-event")).toMatchObject({ kind: "event" });
    expect(findRoute(manifest, "/calendar")?.payloadKey).toBe("page:en:calendar");
  });

  it("maps /page/N/ onto the posts index with the page number", () => {
    const r = resolveRoute(manifest, "/blog/page/3/");
    expect(r.kind).toBe("posts_index");
    expect(r.page).toBe(3);
    expect(r.route?.path).toBe("/blog/");
    // `/page/N/` under anything else is not a route.
    expect(resolveRoute(manifest, "/about/page/2/").kind).toBe("not_found");
  });

  it("maps /category/{slug}/ onto the filtered posts index", () => {
    expect(resolveRoute(manifest, "/category/labor/")).toMatchObject({
      kind: "posts_index",
      category: "labor",
      lang: "en",
    });
    expect(resolveRoute(manifest, "/es/category/labor/")).toMatchObject({
      kind: "posts_index",
      category: "labor",
      lang: "es",
    });
  });

  it("treats ?s= as search wherever it lands", () => {
    const r = resolveRoute(manifest, "/", { s: "fridge" });
    expect(r.kind).toBe("search");
    expect(r.search).toBe("fridge");
    expect(r.route?.kind).toBe("posts_index");
    expect(resolveRoute(manifest, "/es/", { s: ["x", null] })).toMatchObject({
      kind: "search",
      lang: "es",
      search: "x",
    });
  });

  it("reads ?paged and ?category from the query", () => {
    expect(resolveRoute(manifest, "/blog/", { paged: "2", category: "mutual" })).toMatchObject({
      page: 2,
      category: "mutual",
    });
    expect(resolveRoute(manifest, "/blog/", { paged: "junk" }).page).toBe(1);
  });

  it("falls through to not_found with the language of the prefix", () => {
    expect(resolveRoute(manifest, "/nope/")).toMatchObject({
      kind: "not_found",
      route: null,
      lang: "en",
    });
    expect(resolveRoute(manifest, "/es/nada/")).toMatchObject({ kind: "not_found", lang: "es" });
  });

  it("accepts Next's segment array and searchParams shapes", () => {
    expect(resolveRoute(manifest, ["es", "acerca"])).toMatchObject({ kind: "about", lang: "es" });
    expect(resolveRoute(manifest, undefined)).toMatchObject({ kind: "front", lang: "en" });
    expect(resolveRoute(manifest, ["blog"], { s: undefined, category: ["labor"] })).toMatchObject({
      kind: "posts_index",
      category: "labor",
    });
  });
});

describe("payloadSlug", () => {
  it("extracts the REST path segment from the payload key", () => {
    const about = findRoute(manifest, "/about/")!;
    expect(payloadSlug(about)).toBe("about");
    expect(payloadSlug(findRoute(manifest, "/blog/contract-test-post/")!)).toBe(
      "contract-test-post",
    );
    expect(payloadSlug({ ...about, payloadKey: "page:en:legal:terms" })).toBe("legal:terms");
  });
});
