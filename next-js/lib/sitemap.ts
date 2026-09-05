import { resolveHref } from "@/lib/links";
import type { LanguageLink } from "@/lib/contracts";
import type { Route, RoutesManifest } from "@/lib/schemas";

/* sitemap.xml + robots.txt from the routes manifest on the app's public origin
 * (openspec next-headless-site § Envelope-driven document head — "Sitemap lists
 * both languages"; design D5). Pure and framework-free: the route handlers
 * fetch, these functions shape and serialize. */

export interface SitemapEntry {
  url: string;
  lastModified?: string;
  /** hreflang → absolute URL on the app origin (only when a route has translations) */
  alternates?: Record<string, string>;
}

/** Kinds that never belong in the sitemap (search/404 are not manifest routes). */
const EXCLUDED_KINDS = new Set(["styleguide"]);

export function indexableRoutes(manifest: RoutesManifest): Route[] {
  return manifest.routes.filter((r) => !EXCLUDED_KINDS.has(r.kind));
}

/** A WordPress-minted URL or app path → absolute URL on the app origin. */
export function appUrl(hrefOrPath: string, siteOrigin: string, wpOrigin: string): string {
  const resolved = resolveHref(hrefOrPath, wpOrigin);
  const path = resolved.kind === "internal" ? resolved.href : hrefOrPath;
  return new URL(path, siteOrigin).href;
}

export function sitemapEntry(
  route: Route,
  languages: LanguageLink[],
  origins: { siteOrigin: string; wpOrigin: string; lastModified?: string },
): SitemapEntry {
  const alternates = Object.fromEntries(
    languages
      .filter((l) => l.url)
      .map((l) => [l.code, appUrl(l.url, origins.siteOrigin, origins.wpOrigin)]),
  );
  return {
    url: appUrl(route.path, origins.siteOrigin, origins.wpOrigin),
    ...(origins.lastModified ? { lastModified: origins.lastModified } : {}),
    ...(Object.keys(alternates).length > 1 ? { alternates } : {}),
  };
}

const escapeXml = (s: string) =>
  s.replace(
    /[<>&'"]/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!,
  );

export function renderSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map((e) => {
      const alts = Object.entries(e.alternates ?? {})
        .map(
          ([lang, href]) =>
            `    <xhtml:link rel="alternate" hreflang="${escapeXml(lang)}" href="${escapeXml(href)}"/>`,
        )
        .join("\n");
      return [
        "  <url>",
        `    <loc>${escapeXml(e.url)}</loc>`,
        e.lastModified ? `    <lastmod>${escapeXml(e.lastModified)}</lastmod>` : "",
        alts,
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}

/** Allow everything public; keep the styleguide, API, internal render routes and search states out. */
export function renderRobotsTxt(siteOrigin: string): string {
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /styleguide/",
    "Disallow: /api/",
    "Disallow: /_not-found-route/",
    "Disallow: /_error-route/",
    "Disallow: /*?s=",
    "",
    `Sitemap: ${new URL("/sitemap.xml", siteOrigin).href}`,
    "",
  ].join("\n");
}
