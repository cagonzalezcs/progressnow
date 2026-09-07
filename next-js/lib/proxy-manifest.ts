import { resolveCategories } from "@/lib/categories";
import { languageHomeRedirect, resolveRoute } from "@/lib/routes";
import { routesManifestSchema, type RoutesManifest } from "@/lib/schemas";

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
  /* The registry behind `/category/{slug}/`: null until read, and left null when
   * /site cannot be read so a transient failure never turns a real archive into a
   * 404 (unknown slugs stay 200 until the registry is back). */
  let categoryIds: Set<string> | null = null;
  let categoriesFetchedAt = 0;
  let categoriesInflight: Promise<Set<string> | null> | null = null;

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

  /** Category ids from `/site` (WordPress overrides win, else the bundled registry). */
  async function categories(): Promise<Set<string> | null> {
    if (categoryIds && now() - categoriesFetchedAt <= ttlMs) return categoryIds;
    if (categoriesInflight) return categoriesInflight;
    categoriesInflight = (async () => {
      try {
        const res = await fetchImpl(`${apiBase.replace(/\/+$/, "")}/site`, {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(5_000),
        });
        if (!res.ok) return categoryIds;
        const body: unknown = await res.json();
        const raw = (body as { categories?: unknown } | null)?.categories;
        const list = Array.isArray(raw)
          ? raw.filter(
              (c): c is { id: string } =>
                typeof (c as { id?: unknown } | null)?.id === "string" &&
                (c as { id: string }).id !== "",
            )
          : [];
        categoryIds = new Set(
          resolveCategories(list.map((c) => ({ id: c.id, label: c.id, color: null }))).map(
            (c) => c.id,
          ),
        );
        categoriesFetchedAt = now();
        return categoryIds;
      } catch {
        return categoryIds;
      } finally {
        categoriesInflight = null;
      }
    })();
    return categoriesInflight;
  }

  /* `/category/{slug}/` for a slug the registry does not have is a 404 in WordPress —
   * and `/posts?category=` would reject it with a 400 — so it must not resolve here.
   * `path` is a pathname, so this only ever sees the archive form, never `?category=`. */
  async function knownUnlessBadCategory(path: string): Promise<Existence> {
    const slug = manifest ? resolveRoute(manifest, path).category : "";
    if (slug === "") return "known";
    const ids = await categories();
    return ids === null || ids.has(slug) ? "known" : "unknown";
  }

  return {
    /** Does `path` resolve to a real route (or a derived posts-index state)? */
    async exists(path: string): Promise<Existence> {
      if (!manifest || now() - fetchedAt > ttlMs) await refresh();
      if (!manifest) return "unavailable";
      if (resolveRoute(manifest, path).kind !== "not_found") return knownUnlessBadCategory(path);
      if (now() - lastMissRefresh > missRefreshMs) {
        lastMissRefresh = now();
        await refresh();
        if (manifest && resolveRoute(manifest, path).kind !== "not_found")
          return knownUnlessBadCategory(path);
      }
      return "unknown";
    },
    /** Bare language directory → its front page (`/es/` → `/es/inicio/`), else null. */
    async redirect(path: string): Promise<string | null> {
      if (!manifest || now() - fetchedAt > ttlMs) await refresh();
      return manifest ? languageHomeRedirect(manifest, path) : null;
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
