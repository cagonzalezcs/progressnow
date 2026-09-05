import { NextResponse, type NextRequest } from "next/server";
import { createProxyManifest } from "@/lib/proxy-manifest";

/* Request proxy (Next 16 `proxy.ts`, Node runtime).
 *  1. Forwards the pathname to the root layout as `x-pathname` so <html lang>
 *     and the chrome follow Polylang's URL structure (design D3).
 *  2. Decides 404s BEFORE the body streams: under Cache Components a dynamic
 *     route always streams a fallback shell, so a `notFound()` thrown in the
 *     page can only produce a 200 + noindex. For unknown paths the proxy renders
 *     the not-found route internally and answers with its HTML and a real 404
 *     (next-headless-site § Content freshness — unknown path is cheap; the
 *     manifest is cached in memory).
 *  Task 8.1 adds the per-request CSP nonce and security headers here. */
export const PATHNAME_HEADER = "x-pathname";
export const NOT_FOUND_PATH = "/_not-found-route/";

/** Paths served by dedicated Next segments, not by the WordPress manifest. */
const APP_SEGMENTS = [/^\/styleguide\/?$/];

let manifest: ReturnType<typeof createProxyManifest> | null = null;
function routes() {
  if (!manifest) {
    const apiBase =
      process.env.WP_API_BASE ??
      (process.env.MOCK_API === "1" ? "http://127.0.0.1:8787/wp-json/progressnow/v1" : "");
    manifest = createProxyManifest({ apiBase });
  }
  return manifest;
}

const RENDER_HEADER = "x-not-found-render";

/** Where the proxy can reach this app to render the 404 page: the standalone
 * server's own address (PORT set by start-standalone / the container), else the
 * public origin (Vercel runs the proxy separately from the app). */
function internalOrigin(request: NextRequest): string {
  if (process.env.INTERNAL_ORIGIN) return process.env.INTERNAL_ORIGIN;
  if (process.env.PORT) return `http://127.0.0.1:${process.env.PORT}`;
  return process.env.NEXT_PUBLIC_SITE_ORIGIN ?? request.nextUrl.origin;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isRenderLoop = request.headers.has(RENDER_HEADER);
  const headers = new Headers(request.headers);
  // The internal 404 render keeps the visitor's original path (language, chrome).
  if (!isRenderLoop || !headers.get(PATHNAME_HEADER)) headers.set(PATHNAME_HEADER, pathname);
  if (
    !isRenderLoop &&
    pathname !== NOT_FOUND_PATH &&
    !APP_SEGMENTS.some((re) => re.test(pathname))
  ) {
    const existence = await routes().exists(pathname);
    if (existence === "unknown") {
      // A rewrite cannot change the status once the route streams; render the
      // not-found route internally and return its HTML with a real 404.
      try {
        const res = await fetch(new URL(NOT_FOUND_PATH, internalOrigin(request)), {
          headers: {
            accept: "text/html",
            [RENDER_HEADER]: "1",
            [PATHNAME_HEADER]: pathname,
            "accept-language": request.headers.get("accept-language") ?? "",
          },
          signal: AbortSignal.timeout(10_000),
        });
        const html = await res.text();
        return new NextResponse(html, {
          status: 404,
          headers: {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "no-store",
            "x-robots-tag": "noindex",
          },
        });
      } catch {
        return new NextResponse("Not found", {
          status: 404,
          headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
        });
      }
    }
    // "unavailable" (WordPress down, cold cache): let the route render its error surface.
  }
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: [
    "/((?!api/|_next/static|_next/image|wp-content/|favicon.ico|robots.txt|sitemap.xml|.*\\.[a-z0-9]{2,5}$).*)",
  ],
};
