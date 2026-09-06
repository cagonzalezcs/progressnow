import { NextResponse, type NextRequest } from "next/server";
import { createProxyManifest } from "@/lib/proxy-manifest";
import { ERROR_RENDER_HEADER } from "@/lib/request-path";
import { upstreamHealth } from "@/lib/upstream-health";

/* Request proxy (Next 16 `proxy.ts`, Node runtime).
 *  1. Forwards the pathname to the root layout as `x-pathname` so <html lang>
 *     and the chrome follow Polylang's URL structure (design D3).
 *  2. Decides 404s BEFORE the body streams: under Cache Components a dynamic
 *     route always streams a fallback shell, so a `notFound()` thrown in the
 *     page can only produce a 200 + noindex. For unknown paths the proxy renders
 *     the not-found route internally and answers with its HTML and a real 404
 *     (next-headless-site § Content freshness — unknown path is cheap; the
 *     manifest is cached in memory).
 *  3. Answers a real 500 while WordPress is unreachable (next-headless-site
 *     § Error and empty surfaces): when its own manifest probe fails, or the
 *     data layer just recorded a failure and a fresh probe confirms it, the
 *     proxy renders the error surface internally (no upstream data needed) and
 *     returns it with 500 + no-store. The first failing request in a process may
 *     still stream from the layout's own fallback (200 + the same surface).
 *  Task 8.1 adds the per-request CSP nonce and security headers here. */
export const PATHNAME_HEADER = "x-pathname";
export const NOT_FOUND_PATH = "/_not-found-route/";
export const ERROR_PATH = "/_error-route/";
/** How long a recorded data-layer failure keeps the proxy probing before it trusts the cache again. */
const FAILURE_WINDOW_MS = 30_000;

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

async function renderInternally(
  request: NextRequest,
  path: string,
  pathname: string,
  extraHeaders: Record<string, string>,
  status: number,
  fallback: string,
): Promise<NextResponse> {
  try {
    const res = await fetch(new URL(path, internalOrigin(request)), {
      headers: {
        accept: "text/html",
        [RENDER_HEADER]: "1",
        [PATHNAME_HEADER]: pathname,
        "accept-language": request.headers.get("accept-language") ?? "",
        ...extraHeaders,
      },
      signal: AbortSignal.timeout(10_000),
    });
    return new NextResponse(await res.text(), {
      status,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
        "x-robots-tag": "noindex",
      },
    });
  } catch {
    return new NextResponse(fallback, {
      status,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
    });
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isRenderLoop = request.headers.has(RENDER_HEADER);
  const headers = new Headers(request.headers);
  // The internal 404/500 renders keep the visitor's original path (language, chrome).
  if (!isRenderLoop || !headers.get(PATHNAME_HEADER)) headers.set(PATHNAME_HEADER, pathname);
  // Only the proxy's own render loop may ask the layout for the error document.
  if (!isRenderLoop) headers.delete(ERROR_RENDER_HEADER);
  if (
    !isRenderLoop &&
    pathname !== NOT_FOUND_PATH &&
    pathname !== ERROR_PATH &&
    !APP_SEGMENTS.some((re) => re.test(pathname))
  ) {
    let existence = await routes().exists(pathname);
    // A data-layer failure just happened: verify with one fresh probe before trusting memory.
    if (existence !== "unavailable" && upstreamHealth.recentlyFailed(FAILURE_WINDOW_MS)) {
      if (await routes().probe()) upstreamHealth.markSuccess();
      else existence = "unavailable";
    }
    if (existence === "unavailable") {
      return renderInternally(
        request,
        ERROR_PATH,
        pathname,
        { [ERROR_RENDER_HEADER]: "1" },
        500,
        "Content is temporarily unavailable",
      );
    }
    if (existence === "unknown") {
      // A rewrite cannot change the status once the route streams; render the
      // not-found route internally and return its HTML with a real 404.
      return renderInternally(request, NOT_FOUND_PATH, pathname, {}, 404, "Not found");
    }
  }
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: [
    "/((?!api/|_next/static|_next/image|wp-content/|favicon.ico|robots.txt|sitemap.xml|.*\\.[a-z0-9]{2,5}$).*)",
  ],
};
