/* The data-resolution order every route type shares (openspec spec
 * nuxt-static-site § Data seeding and payload resolution):
 *
 *   1. the embedded shell payload (landing route) — seeded into
 *      `nuxtApp.payload.data` at boot, so it lives in `payloadData` here;
 *   2. the prerendered `_payload.json` of the destination — Nuxt loads it into
 *      `nuxtApp.static.data` before the route resolves;
 *   3. the REST API — when nothing is cached, or the freshness guard is active.
 *
 * `useChapterData()` passes this as `getCachedData`; keeping it pure lets the
 * order be unit-tested without a Nuxt runtime. */

export interface CacheSources {
  payloadData: Record<string, unknown>;
  staticData: Record<string, unknown>;
  /** From the freshness guard: ignore `_payload.json` data when true. */
  bypassStatic: boolean;
}

export function resolveCached<T>(key: string, sources: CacheSources): T | undefined {
  const embedded = sources.payloadData[key];
  if (embedded !== undefined && embedded !== null) return embedded as T;

  if (sources.bypassStatic) return undefined;

  const prerendered = sources.staticData[key];
  if (prerendered !== undefined && prerendered !== null) return prerendered as T;

  return undefined;
}
