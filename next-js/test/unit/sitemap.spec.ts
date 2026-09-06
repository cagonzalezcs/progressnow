import { describe, expect, it } from "vitest";
import { createMock } from "../mock/api.mjs";
import {
  appUrl,
  indexableRoutes,
  renderRobotsTxt,
  renderSitemapXml,
  sitemapEntry,
} from "@/lib/sitemap";
import type { LanguageLink } from "@/lib/contracts";
import type { RoutesManifest } from "@/lib/schemas";

/* openspec next-headless-site § "Sitemap lists both languages": every
 * indexable manifest route on the app origin, hreflang alternates, search and
 * styleguide excluded. */
const WP = "https://wp.example";
const SITE = "https://app.example";
const mock = createMock({ origin: WP });
const manifest = mock.routesManifest() as RoutesManifest;
const origins = { siteOrigin: SITE, wpOrigin: WP, lastModified: manifest.generatedAt };

describe("sitemap", () => {
  it("lists both languages' routes and excludes the styleguide", () => {
    const routes = indexableRoutes(manifest);
    expect(routes.some((r) => r.kind === "styleguide")).toBe(false);
    expect(routes.filter((r) => r.lang === "es").length).toBeGreaterThan(3);
    expect(routes.length).toBe(manifest.routes.length - 1);
  });

  it("re-homes WordPress URLs onto the app origin and pairs translations as alternates", () => {
    const about = manifest.routes.find((r) => r.kind === "about" && r.lang === "en")!;
    const languages: LanguageLink[] = [
      { code: "en", label: "EN", name: "English", active: true, url: `${WP}/about/` },
      { code: "es", label: "ES", name: "Español", active: false, url: `${WP}/es/acerca/` },
    ];
    expect(sitemapEntry(about, languages, origins)).toEqual({
      url: `${SITE}/about/`,
      lastModified: manifest.generatedAt,
      alternates: { en: `${SITE}/about/`, es: `${SITE}/es/acerca/` },
    });
    // a single language → no alternates block
    expect(sitemapEntry(about, languages.slice(0, 1), origins)).not.toHaveProperty("alternates");
    expect(appUrl("/es/blog/", SITE, WP)).toBe(`${SITE}/es/blog/`);
  });

  it("renders valid sitemap XML with xhtml alternates and escapes", () => {
    const xml = renderSitemapXml([
      {
        url: `${SITE}/a/?x=1&y=2`,
        lastModified: "2026-09-05T00:00:00Z",
        alternates: { en: `${SITE}/a/`, es: `${SITE}/es/a/` },
      },
      { url: `${SITE}/b/` },
    ]);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(xml).toContain(`<loc>${SITE}/a/?x=1&amp;y=2</loc>`);
    expect(xml).toContain(`<xhtml:link rel="alternate" hreflang="es" href="${SITE}/es/a/"/>`);
    expect(xml).toContain("<lastmod>2026-09-05T00:00:00Z</lastmod>");
    expect((xml.match(/<url>/g) ?? []).length).toBe(2);
  });

  it("robots.txt allows the site, blocks styleguide/api/internal/search, points at the sitemap", () => {
    const txt = renderRobotsTxt(SITE);
    expect(txt).toContain("User-agent: *\nAllow: /");
    for (const path of ["/styleguide/", "/api/", "/_not-found-route/", "/_error-route/", "/*?s="])
      expect(txt).toContain(`Disallow: ${path}`);
    expect(txt.trim().endsWith(`Sitemap: ${SITE}/sitemap.xml`)).toBe(true);
  });
});
