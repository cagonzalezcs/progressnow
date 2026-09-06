import { routesManifestSchema, type RoutesManifest } from "@/lib/schemas";
import { resolveRoute } from "@/lib/routes";

/* Route existence check for proxy.ts (openspec next-headless-site § Content
 * freshness — unknown paths; Next docs: a 404 status must be decided before
 * the body streams, so it cannot come from the page under Cache Components).
 * The proxy keeps the tiny /routes manifest in process memory: refreshed every
 * TTL, and refreshed at most once per `missRefreshMs` when a path is unknown so
 * freshly published content resolves without a redeploy while a flood of bogus
 * paths costs WordPress at most one request per window. Framework-free and
 * unit-tested with an injected fetch/clock. */
export interface ProxyManifestOptions {
  apiBase: string;
  fetchImpl?: typeof fetch;
  now?: () => number;
  ttlMs?: number;
  missRefreshMs?: number;
}

export type Existence = "known" | "unknown" | "unavailable";

export function createProxyManifest({
  apiBase,
  fetchImpl = fetch,
  now = Date.now,
  ttlMs = 60_000,
  missRefreshMs = 10_000,
}: ProxyManifestOptions) {
  let manifest: RoutesManifest | null = null;
  let fetchedAt = 0;
  let lastMissRefresh = 0;
  let inflight: Promise<RoutesManifest | null> | null = null;
  let lastRefreshOk = false;

  async function refresh(): Promise<RoutesManifest | null> {
    if (inflight) return inflight;
    inflight = (async () => {
      try {
        const res = await fetchImpl(`${apiBase.replace(/\/+$/, "")}/routes`, {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(5_000),
        });
        if (!res.ok) {
          lastRefreshOk = false;
          return manifest;
        }
        const parsed = routesManifestSchema.safeParse(await res.json());
        if (!parsed.success) {
          lastRefreshOk = false;
          return manifest;
        }
        manifest = parsed.data;
        fetchedAt = now();
        lastRefreshOk = true;
        return manifest;
      } catch {
        lastRefreshOk = false;
        return manifest;
      } finally {
        inflight = null;
      }
    })();
    return inflight;
  }

  return {
    /** Does `path` resolve to a real route (or a derived posts-index state)? */
    async exists(path: string): Promise<Existence> {
      if (!manifest || now() - fetchedAt > ttlMs) await refresh();
      if (!manifest) return "unavailable";
      if (resolveRoute(manifest, path).kind !== "not_found") return "known";
      if (now() - lastMissRefresh > missRefreshMs) {
        lastMissRefresh = now();
        await refresh();
        if (manifest && resolveRoute(manifest, path).kind !== "not_found") return "known";
      }
      return "unknown";
    },
    /** Is WordPress answering right now? One fresh /routes fetch (dedupes in-flight). */
    async probe(): Promise<boolean> {
      await refresh();
      return lastRefreshOk;
    },
    /** Test seam. */
    get state() {
      return { fetchedAt, hasManifest: manifest !== null, lastRefreshOk };
    },
  };
}
