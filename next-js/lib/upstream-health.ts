/* Process-local upstream health (openspec next-headless-site § Error and empty
 * surfaces — "answers 500 with the error surface"). The data layer marks every
 * upstream failure/success; proxy.ts consults it so the request AFTER a failure
 * can be answered with a real 500 before the body streams (a layout cannot set
 * a status). Framework-free; in the standalone/Docker deployment the proxy and
 * the renderer share this module instance. Where they do not (Vercel), the
 * proxy's own manifest probe still catches an outage on its next refresh. */
export function createUpstreamHealth({ now = Date.now }: { now?: () => number } = {}) {
  let failedAt = 0;
  return {
    markFailure() {
      failedAt = now();
    },
    markSuccess() {
      failedAt = 0;
    },
    /** A failure was recorded within `withinMs` and no success since. */
    recentlyFailed(withinMs = 30_000): boolean {
      return failedAt !== 0 && now() - failedAt <= withinMs;
    },
    /** Test seam. */
    get state() {
      return { failedAt };
    },
  };
}

type Health = ReturnType<typeof createUpstreamHealth>;
declare global {
  var __progressnowUpstreamHealth: Health | undefined;
}
/* On globalThis, not a module local: Next compiles the proxy, route handlers
 * and 'use cache' scopes into separate bundles with separate module instances;
 * the process is what they share. */
export const upstreamHealth: Health = (globalThis.__progressnowUpstreamHealth ??=
  createUpstreamHealth());
