import type { Route, RouteKind, RoutesManifest } from "@/lib/schemas";

/* Path → route resolution against the `/routes` manifest (openspec spec
 * nuxt-static-site § Route parity). Nuxt-free so it is unit-testable and
 * reusable from the shell store. */

export type ResolvedKind = RouteKind | "search" | "not_found";

export interface ResolvedRoute {
  kind: ResolvedKind;
  /** The manifest entry (absent for search on an unknown path and for 404s). */
  route: Route | null;
  lang: string;
  /** Path with the trailing slash normalized the WordPress way (`/about/`). */
  path: string;
  /** Posts page number (`/blog/page/2/` or `?paged=2`). */
  page: number;
  /** `?category=` filter (posts page) or `/category/{slug}/` archive. */
  category: string;
  /** `?s=` search query. */
  search: string;
}

/** vue-router's LocationQuery shape (values may be null or repeated). */
export type Query = Record<string, string | null | (string | null)[] | undefined>;

function first(value: string | null | (string | null)[] | undefined): string {
  if (Array.isArray(value)) return value.find((v) => typeof v === "string") ?? "";
  return value ?? "";
}

/** `/about` → `/about/`, `/` stays, `/blog/page/2` → `/blog/page/2/`. */
export function normalizePath(path: string): string {
  let out = path.trim();
  if (out === "") return "/";
  try {
    out = decodeURI(out);
  } catch {
    /* keep raw */
  }
  out = out.replace(/\/{2,}/g, "/");
  if (!out.startsWith("/")) out = `/${out}`;
  if (!out.endsWith("/")) out = `${out}/`;
  return out;
}

/** Longest-prefix match of the front routes decides the language of any path. */
export function langForPath(manifest: RoutesManifest, path: string): string {
  const normalized = normalizePath(path);
  // Longest prefix wins: a language's front path, or its bare root when the
  // home is a page permalink (`/es/inicio/`) — WordPress still serves the root
  // itself for search (`/es/?s=…`) and 404s (`/es/missing/`).
  const prefixes: Array<{ prefix: string; lang: string }> = [];
  for (const front of manifest.routes) {
    if (front.kind !== "front") continue;
    prefixes.push({ prefix: front.path, lang: front.lang });
    const root = languageRoot(manifest, front);
    if (root) prefixes.push({ prefix: root, lang: front.lang });
  }
  prefixes.sort((a, b) => b.prefix.length - a.prefix.length);
  for (const { prefix, lang } of prefixes) {
    if (normalized === prefix || normalized.startsWith(prefix)) return lang;
  }
  return manifest.routes[0]?.lang ?? "";
}

function languageRoot(manifest: RoutesManifest, front: Route): string | null {
  const segment = front.path.match(/^\/([^/]+)\//)?.[1];
  if (!segment) return null;
  const root = `/${segment}/`;
  if (root === front.path) return null; // already matched as the front path
  const own = manifest.routes.filter((r) => r.lang === front.lang);
  return own.every((r) => r.path === root || r.path.startsWith(root)) ? root : null;
}

export function findRoute(manifest: RoutesManifest, path: string): Route | null {
  const normalized = normalizePath(path);
  return manifest.routes.find((r) => normalizePath(r.path) === normalized) ?? null;
}

export function frontRoute(manifest: RoutesManifest, lang: string): Route | null {
  return manifest.routes.find((r) => r.kind === "front" && r.lang === lang) ?? null;
}

export function postsIndexRoute(manifest: RoutesManifest, lang: string): Route | null {
  return manifest.routes.find((r) => r.kind === "posts_index" && r.lang === lang) ?? null;
}

const PAGED = /^(.*?\/)page\/(\d+)\/$/;
const CATEGORY = /^(\/(?:[a-z]{2}\/)?)category\/([^/]+)\/$/;

export function resolveRoute(
  manifest: RoutesManifest,
  rawPath: string,
  query: Query = {},
): ResolvedRoute {
  const path = normalizePath(rawPath);
  const search = first(query.s).trim();
  const queryCategory = first(query.category).trim();
  const queryPaged = Math.max(1, Number.parseInt(first(query.paged) || "1", 10) || 1);

  const base: ResolvedRoute = {
    kind: "not_found",
    route: null,
    lang: langForPath(manifest, path),
    path,
    page: queryPaged,
    category: queryCategory,
    search,
  };

  // `/blog/page/N/` — server-paged posts index.
  const paged = path.match(PAGED);
  if (paged) {
    const parent = findRoute(manifest, paged[1]!);
    if (parent && parent.kind === "posts_index") {
      return {
        ...base,
        kind: "posts_index",
        route: parent,
        lang: parent.lang,
        page: Number.parseInt(paged[2]!, 10),
      };
    }
  }

  // `/category/{slug}/` — WordPress category archive → filtered posts index.
  const category = path.match(CATEGORY);
  if (category) {
    const lang = langForPath(manifest, category[1]!);
    const index = postsIndexRoute(manifest, lang);
    if (index) {
      return { ...base, kind: "posts_index", route: index, lang, category: category[2]! };
    }
  }

  const route = findRoute(manifest, path);

  // `?s=` — WordPress search lands on the home URL; render results there.
  if (search !== "") {
    const lang = route?.lang ?? base.lang;
    return { ...base, kind: "search", route: postsIndexRoute(manifest, lang) ?? route, lang };
  }

  if (!route) return base;

  return { ...base, kind: route.kind, route, lang: route.lang };
}
