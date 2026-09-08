import { NextResponse, type NextRequest } from "next/server";
import { createProxyManifest } from "@/lib/proxy-manifest";
import {
  ERROR_RENDER_HEADER,
  INTERNAL_TOKEN,
  INTERNAL_TOKEN_HEADER,
  isTrustedInternal,
  NONCE_HEADER,
  NOT_FOUND_RENDER_HEADER,
  PATHNAME_HEADER,
  stripInternalHeaders,
} from "@/lib/request-path";
import {
  applySecurityHeaders,
  buildCsp,
  cspHeaderName,
  generateNonce,
} from "@/lib/security-headers";
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
 *  3. Mirrors WordPress' 301 from a bare language directory to that language's
 *     front page (`/es/` → `/es/inicio/`; Polylang keeps a translated static
 *     front page at its own slug). The query string rides along, so `?s=` on
 *     the bare directory reaches the front page, which renders the results.
 *  4. Answers a real 500 while WordPress is unreachable (next-headless-site
 *     § Error and empty surfaces): when its own manifest probe fails, or the
 *     data layer just recorded a failure and a fresh probe confirms it, the
 *     proxy renders the error surface internally (no upstream data needed) and
 *     returns it with 500 + no-store. The first failing request in a process may
 *     still stream from the layout's own fallback (200 + the same surface).
 *  5. Mints the per-request CSP nonce and stamps the security headers (design
 *     D11, next-deployment § Security headers and CSP). The nonce travels to
 *     the render as `x-nonce` (root layout → a11y bootstrap) and inside the
 *     request's Content-Security-Policy header, which Next reads to stamp its
 *     own inline scripts. Internal 404/500 renders reuse the outer request's
 *     nonce so the HTML the proxy returns matches the header it sets.
 *     CSP_REPORT_ONLY=1 ships the policy as report-only for the rollout.
 *  6. Trusts the internal headers (x-pathname, x-nonce, x-not-found-render,
 *     x-error-render) only from its own render loop, which authenticates with
 *     x-internal-token (lib/request-path; openspec next-edge-trust-boundaries).
 *     A public request carrying them gets them stripped before any decision. */
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

const RENDER_HEADER = NOT_FOUND_RENDER_HEADER;
const REPORT_ONLY = process.env.CSP_REPORT_ONLY === "1";

/** The policy for this request's nonce; hosts come from the same env next.config.ts reads. */
function cspFor(nonce: string, pathname: string): string {
  const apiBase =
    process.env.WP_API_BASE ??
    (process.env.MOCK_API === "1" ? "http://127.0.0.1:8787/wp-json/progressnow/v1" : "");
  const wpOrigin = process.env.WP_ORIGIN ?? (apiBase ? new URL(apiBase).origin : "");
  const imageHosts = (process.env.IMAGE_HOSTS ?? "").split(",");
  return buildCsp({
    nonce,
    wpOrigin,
    imageHosts,
    dev: process.env.NODE_ENV === "development",
    reportUri: process.env.CSP_REPORT_URI,
    // The kitchen sink's vendored demos load avatars from github.com/unsplash; nowhere else.
    extraImageSources: APP_SEGMENTS.some((re) => re.test(pathname)) ? ["https:"] : [],
  });
}

function secured(response: NextResponse, csp: string): NextResponse {
  applySecurityHeaders(response.headers, csp, REPORT_ONLY);
  return response;
}

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
  nonce: string,
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
        [NONCE_HEADER]: nonce,
        [INTERNAL_TOKEN_HEADER]: INTERNAL_TOKEN,
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
  const headers = new Headers(request.headers);
  // Only the proxy's own render loop (x-internal-token) may steer the render; anyone
  // else loses the internal headers here, before routing, status and CSP are decided.
  if (!isTrustedInternal(request)) stripInternalHeaders(headers);
  headers.delete(INTERNAL_TOKEN_HEADER);
  const isRenderLoop = headers.has(RENDER_HEADER);
  // The internal 404/500 renders keep the visitor's original path (language, chrome).
  if (!isRenderLoop || !headers.get(PATHNAME_HEADER)) headers.set(PATHNAME_HEADER, pathname);
  // One nonce per visitor request; the render loop inherits it so the internally
  // rendered HTML carries the same nonce the outer response advertises.
  const nonce = (isRenderLoop && headers.get(NONCE_HEADER)) || generateNonce();
  const csp = cspFor(nonce, headers.get(PATHNAME_HEADER) ?? pathname);
  headers.set(NONCE_HEADER, nonce);
  headers.set(cspHeaderName(REPORT_ONLY), csp);
  if (
    !isRenderLoop &&
    pathname !== NOT_FOUND_PATH &&
    pathname !== ERROR_PATH &&
    !APP_SEGMENTS.some((re) => re.test(pathname))
  ) {
    const front = await routes().redirect(pathname);
    if (front) {
      const url = request.nextUrl.clone();
      url.pathname = front;
      return secured(NextResponse.redirect(url, 301), csp);
    }
    let existence = await routes().exists(pathname);
    // A data-layer failure just happened: verify with one fresh probe before trusting memory.
    if (existence !== "unavailable" && upstreamHealth.recentlyFailed(FAILURE_WINDOW_MS)) {
      if (await routes().probe()) upstreamHealth.markSuccess();
      else existence = "unavailable";
    }
    if (existence === "unavailable") {
      return secured(
        await renderInternally(
          request,
          ERROR_PATH,
          pathname,
          nonce,
          { [ERROR_RENDER_HEADER]: "1" },
          500,
          "Content is temporarily unavailable",
        ),
        csp,
      );
    }
    if (existence === "unknown") {
      // A rewrite cannot change the status once the route streams; render the
      // not-found route internally and return its HTML with a real 404.
      return secured(
        await renderInternally(request, NOT_FOUND_PATH, pathname, nonce, {}, 404, "Not found"),
        csp,
      );
    }
  }
  return secured(NextResponse.next({ request: { headers } }), csp);
}

export const config = {
  matcher: [
    "/((?!api/|_next/static|_next/image|wp-content/|favicon.ico|robots.txt|sitemap.xml|.*\\.[a-z0-9]{2,5}$).*)",
  ],
};
