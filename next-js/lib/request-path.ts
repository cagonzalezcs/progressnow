import "server-only";
import { headers } from "next/headers";

/* The current document path as forwarded by proxy.ts (`x-pathname`). Reading
 * request headers makes the render request-time — the app renders per request
 * from the cached data layer by design (design D11, CSP nonce). */
export async function requestPath(): Promise<string> {
  const h = await headers();
  return h.get("x-pathname") ?? "/";
}
