/* Security headers and the per-request CSP (openspec next-deployment
 * § Security headers and CSP; design D11). Framework-free: proxy.ts applies
 * these to every HTML response it handles, next.config.ts applies the static
 * set to everything else (API, build assets, the theme static proxy).
 *
 * The script policy is nonce-based (`'nonce-…' 'strict-dynamic'`): Next reads
 * the nonce back from the REQUEST's Content-Security-Policy header and stamps
 * its own inline/RSC payload scripts with it; the root layout stamps the a11y
 * bootstrap. That is why HTML renders per request (decided 2026-09-05).
 * Styles stay `'unsafe-inline'`: React style props and Next's hoisted <style>
 * cannot carry a nonce, and a style nonce buys little once scripts are locked. */

export interface CspOptions {
  nonce: string;
  /** WordPress origin (media in kses'd HTML, <audio>/<video> files) — full origin, port included. */
  wpOrigin: string;
  /** Hosts next/image may optimize from; also allowed for plain <img>. */
  imageHosts: readonly string[];
  /** Adds 'unsafe-eval' for the dev server (React Refresh / source maps). */
  dev?: boolean;
  /** Extra img-src sources — the styleguide's vendored shadcn examples load demo
   * avatars from github.com / unsplash; that noindex parity surface gets `https:`. */
  extraImageSources?: readonly string[];
  /** `report-uri` target for the report-only rollout. */
  reportUri?: string;
}

/** Third-party players the video block lazy-embeds (BlockVideo). */
export const FRAME_SOURCES = ["https://www.youtube-nocookie.com", "https://player.vimeo.com"];

/** 128 bits, base64 — the shape Next's nonce parser accepts. */
export function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

function hostSources(hosts: readonly string[]): string[] {
  const out = new Set<string>();
  for (const host of hosts) {
    const h = host.trim();
    if (!h) continue;
    // A bare host matches https (and the page's own scheme); origins keep their port.
    out.add(h.includes("://") ? new URL(h).origin : h);
  }
  return [...out];
}

/** The policy string, one directive per entry, in a stable order for the tests. */
export function buildCsp({
  nonce,
  wpOrigin,
  imageHosts,
  dev,
  reportUri,
  extraImageSources = [],
}: CspOptions): string {
  const media = hostSources([wpOrigin]);
  const images = [...hostSources([wpOrigin, ...imageHosts]), ...extraImageSources];
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${images.join(" ")}`,
    "font-src 'self'",
    "connect-src 'self'",
    `media-src 'self' ${media.join(" ")}`,
    `frame-src ${FRAME_SOURCES.join(" ")}`,
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];
  if (reportUri) directives.push(`report-uri ${reportUri}`);
  return directives.join("; ");
}

/** Headers that do not depend on the request. */
export const STATIC_SECURITY_HEADERS: ReadonlyArray<{ key: string; value: string }> = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

export const CSP_HEADER = "Content-Security-Policy";
export const CSP_REPORT_ONLY_HEADER = "Content-Security-Policy-Report-Only";

/** `CSP_REPORT_ONLY=1` rolls the policy out as report-only (design D11: report-only first). */
export function cspHeaderName(reportOnly: boolean): string {
  return reportOnly ? CSP_REPORT_ONLY_HEADER : CSP_HEADER;
}

/** Stamp a response's headers: the CSP under its mode's name plus the static set. */
export function applySecurityHeaders(headers: Headers, csp: string, reportOnly = false): void {
  headers.set(cspHeaderName(reportOnly), csp);
  for (const { key, value } of STATIC_SECURITY_HEADERS) headers.set(key, value);
}
