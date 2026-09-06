import { connection } from "next/server";
import { getRoutes } from "@/lib/data";
import { getRouteLanguages } from "@/lib/data/languages";
import { getEnv } from "@/lib/env";
import { logger } from "@/lib/log";
import { resolveRoute } from "@/lib/routes";
import { indexableRoutes, renderSitemapXml, sitemapEntry } from "@/lib/sitemap";

/* GET /sitemap.xml — every indexable manifest route in both languages, with
 * hreflang alternates from each route's envelope (the same cached reads the
 * pages use), on the app's public origin. A route handler rather than
 * app/sitemap.ts so the build needs no API and failures are honest (503);
 * connection() keeps it request-time (never prerendered at build). */
export async function GET(): Promise<Response> {
  await connection();
  const env = getEnv();
  try {
    const manifest = await getRoutes();
    const routes = indexableRoutes(manifest);
    const languages = await Promise.all(
      routes.map((r) => getRouteLanguages(resolveRoute(manifest, r.path))),
    );
    const entries = routes.map((route, i) =>
      sitemapEntry(route, languages[i] ?? [], {
        siteOrigin: env.NEXT_PUBLIC_SITE_ORIGIN,
        wpOrigin: env.WP_ORIGIN,
        lastModified: manifest.generatedAt,
      }),
    );
    return new Response(renderSitemapXml(entries), {
      headers: {
        "content-type": "application/xml; charset=utf-8",
        "cache-control": "public, max-age=300, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    logger.error("sitemap-route", { error });
    return new Response("sitemap temporarily unavailable", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
    });
  }
}
