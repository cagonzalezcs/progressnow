import "server-only";
import { headers } from "next/headers";

/* The current document path as forwarded by proxy.ts (`x-pathname`). Reading
 * request headers makes the render request-time — the app renders per request
 * from the cached data layer by design (design D11, CSP nonce). */
export async function requestPath(): Promise<string> {
  const h = await headers();
  return h.get("x-pathname") ?? "/";
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
