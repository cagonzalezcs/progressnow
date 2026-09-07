import { describe, expect, it } from "vitest";
import { routesManifestSchema } from "@/lib/schemas";
import {
  findRoute,
  frontRoute,
  langForPath,
  languageDirectories,
  languageDirectory,
  languageHomeRedirect,
  normalizePath,
  payloadSlug,
  resolveRoute,
} from "@/lib/routes";
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

describe("languageDirectory", () => {
  it("is the first segment of the front path — Polylang's directory, not the front slug", () => {
    expect(languageDirectory("/")).toBe("/");
    expect(languageDirectory("/es/")).toBe("/es/");
    expect(languageDirectory("/es/inicio/")).toBe("/es/");
    expect(languageDirectory("/en")).toBe("/en/");
  });

  it("lists one directory per front route, longest first", () => {
    // The mock mirrors the real theme: the Spanish front page lives at /es/inicio/.
    expect(frontRoute(manifest, "es")?.path).toBe("/es/inicio/");
    expect(languageDirectories(manifest).map(({ lang, dir }) => [lang, dir])).toEqual([
      ["es", "/es/"],
      ["en", "/"],
    ]);
  });
});

describe("langForPath", () => {
  it("picks the longest language-directory prefix", () => {
    expect(langForPath(manifest, "/")).toBe("en");
    expect(langForPath(manifest, "/about/")).toBe("en");
    expect(langForPath(manifest, "/es/")).toBe("es");
    expect(langForPath(manifest, "/es/inicio/")).toBe("es");
    expect(langForPath(manifest, "/es/acerca/")).toBe("es");
    // Not under the front page's own path, still Spanish (the live bug: 404s drew English chrome).
    expect(langForPath(manifest, "/es/unknown/")).toBe("es");
    expect(langForPath(manifest, "/es/category/labor/")).toBe("es");
    // A slug that merely starts with the language code is not in that directory.
    expect(langForPath(manifest, "/estudiantes/")).toBe("en");
  });
});

describe("languageHomeRedirect", () => {
  it("sends a bare language directory to its front page, like WordPress' 301", () => {
    expect(languageHomeRedirect(manifest, "/es/")).toBe("/es/inicio/");
    expect(languageHomeRedirect(manifest, "/es")).toBe("/es/inicio/");
  });

  it("leaves every other path alone", () => {
    expect(languageHomeRedirect(manifest, "/")).toBeNull(); // the front page itself
    expect(languageHomeRedirect(manifest, "/es/inicio/")).toBeNull();
    expect(languageHomeRedirect(manifest, "/es/blog/")).toBeNull();
    expect(languageHomeRedirect(manifest, "/nope/")).toBeNull();
    expect(languageHomeRedirect(manifest, "/es/nada/")).toBeNull();
  });

  it("does nothing when the front page is the directory itself", () => {
    const flat = {
      ...manifest,
      routes: manifest.routes.map((r) =>
        r.kind === "front" && r.lang === "es" ? { ...r, path: "/es/" } : r,
      ),
    };
    expect(languageHomeRedirect(flat, "/es/")).toBeNull();
    expect(langForPath(flat, "/es/nada/")).toBe("es");
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
    // The bare directory is not a route (proxy.ts redirects it); the language still resolves.
    expect(resolveRoute(manifest, "/es/")).toMatchObject({ kind: "not_found", lang: "es" });
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
