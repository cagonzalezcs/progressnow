import { describe, expect, it } from "vitest";
import { routesManifestSchema } from "@/lib/schemas";
import { findRoute, langForPath, normalizePath, resolveRoute } from "@/lib/chapter/routes";
import { mockRoutesManifest } from "../../shared/mock-api";

const manifest = routesManifestSchema.parse(mockRoutesManifest());

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
});

/* openspec nuxt4-static-platform 5.8 (parity gap): a secondary language's home
 * can be a page permalink (`/es/inicio/` on a real Polylang install) while
 * WordPress still serves the bare language root for search and 404s. Those
 * URLs must resolve to that language, not fall back to the default. */
describe("langForPath with a page-permalink secondary home", () => {
  const real = routesManifestSchema.parse({
    ...manifest,
    routes: manifest.routes.map((r) =>
      r.kind === "front" && r.lang === "es" ? { ...r, path: "/es/inicio/" } : r,
    ),
  });

  it("maps the bare language root and its unknown children to that language", () => {
    expect(langForPath(real, "/es/")).toBe("es");
    expect(langForPath(real, "/es/definitely-missing/")).toBe("es");
    expect(langForPath(real, "/es/inicio/")).toBe("es");
    expect(langForPath(real, "/")).toBe("en");
    expect(langForPath(real, "/definitely-missing/")).toBe("en");
  });

  it("resolves search and 404 under the language root in that language", () => {
    expect(resolveRoute(real, "/es/", { s: "lorem" })).toMatchObject({
      kind: "search",
      lang: "es",
    });
    expect(resolveRoute(real, "/es/nope/", {})).toMatchObject({ kind: "not_found", lang: "es" });
  });

  it("does not treat an ordinary first segment of the default language as a root", () => {
    const odd = routesManifestSchema.parse({
      ...manifest,
      routes: manifest.routes.map((r) =>
        r.kind === "front" && r.lang === "en" ? { ...r, path: "/home/welcome/" } : r,
      ),
    });
    // `/home/` is not shared by every English route, so it is not a language root.
    expect(langForPath(odd, "/home/other/")).toBe(langForPath(odd, "/anything/"));
  });
});
