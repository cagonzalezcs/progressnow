import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";

/* The current document path as forwarded by proxy.ts (`x-pathname`). Reading
 * request headers makes the render request-time — the app renders per request
 * from the cached data layer by design (design D11, CSP nonce). */
export const PATHNAME_HEADER = "x-pathname";

export async function requestPath(): Promise<string> {
  const h = await headers();
  return h.get(PATHNAME_HEADER) ?? "/";
}

/** The per-request CSP nonce minted by proxy.ts (`x-nonce`); undefined only
 * outside the proxy (build-time prerender, unit tests). */
export const NONCE_HEADER = "x-nonce";

export async function requestNonce(): Promise<string | undefined> {
  return (await headers()).get(NONCE_HEADER) ?? undefined;
}

/** Set by proxy.ts on its internal render of the 500 surface (x-error-render). */
export const ERROR_RENDER_HEADER = "x-error-render";

export async function isErrorRender(): Promise<boolean> {
  return (await headers()).get(ERROR_RENDER_HEADER) === "1";
}

/** Set by proxy.ts on its internal 404/500 renders: skip the manifest decision. */
export const NOT_FOUND_RENDER_HEADER = "x-not-found-render";

/* Internal render authentication (openspec next-edge-trust-boundaries
 * § Internal render headers are not honored from the public edge). The four
 * headers above steer the render — language/chrome, the error document, the
 * CSP nonce — so only the proxy's own render loop may set them. The loop
 * proves itself with `x-internal-token`; every other request has the headers
 * stripped before any routing, status or CSP decision (strip, don't reject:
 * rejecting would tell a client that the headers matter).
 *
 * The token is per process by default (random at boot; the standalone server
 * renders through 127.0.0.1:$PORT, so the loop stays in-process). On Vercel the
 * loop is a public round trip that may land on another instance, so when
 * CHAPTER_REBUILD_SECRET is set — required outside mock mode — the token is
 * derived from it instead and every instance of a deployment agrees. */
export const INTERNAL_TOKEN_HEADER = "x-internal-token";

/** The four request headers only the proxy's own render loop may set. */
export const INTERNAL_HEADERS = [
  NONCE_HEADER,
  PATHNAME_HEADER,
  NOT_FOUND_RENDER_HEADER,
  ERROR_RENDER_HEADER,
] as const;

function mintInternalToken(secret: string | undefined): string {
  if (secret) {
    return createHash("sha256")
      .update(`progressnow-internal-render:${secret}`, "utf8")
      .digest("hex");
  }
  return randomBytes(32).toString("hex");
}

export const INTERNAL_TOKEN = mintInternalToken(process.env.CHAPTER_REBUILD_SECRET);

/** True only for the proxy's own render loop: constant-time compare of `x-internal-token`. */
export function isTrustedInternal(
  request: { headers: Headers },
  token: string = INTERNAL_TOKEN,
): boolean {
  const given = request.headers.get(INTERNAL_TOKEN_HEADER);
  if (!given || given.length !== token.length) return false;
  return timingSafeEqual(Buffer.from(given, "utf8"), Buffer.from(token, "utf8"));
}

/** Drops the internal render headers (and the token itself) from a public request. */
export function stripInternalHeaders(headers: Headers): Headers {
  for (const name of INTERNAL_HEADERS) headers.delete(name);
  headers.delete(INTERNAL_TOKEN_HEADER);
  return headers;
}
