import { computed, shallowRef, watch, type ComputedRef, type Ref } from "vue";
import {
  useAsyncData,
  useHead,
  useRoute,
  useRuntimeConfig,
  useState,
  tryUseNuxtApp,
} from "#imports";
import bundledRoutes from "#build/progressnow-routes.mjs";
import { fetchRoutes, fetchSite } from "@/lib/api";
import { resolveCached } from "@/lib/chapter/cache";
import { createFreshnessGuard, type FreshnessGuard } from "@/lib/chapter/freshness";
import { ROUTES_KEY, siteKey } from "@/lib/chapter/keys";
import { resolveRoute, type ResolvedRoute } from "@/lib/chapter/routes";
import { headForSeo } from "@/lib/chapter/seo";
import { createShellStore, isLandingPath, type ShellStore } from "@/lib/chapter/shell";
import { setLanguages } from "@/lib/languages";
import type { LanguageLink } from "@/components/site/LanguageToggle.vue";
import type { Route, RouteKind, RoutesManifest, Seo, SiteEnvelope } from "@/lib/schemas";

/* The one data path every route type shares (openspec spec nuxt-static-site
 * § Data seeding and payload resolution). Thin Nuxt wrappers over the
 * Nuxt-free logic in app/lib/chapter/*. */

const NO_SHELL = createShellStore(null);
const UNGUARDED = createFreshnessGuard(null);

export function useShellStore(): ShellStore {
  return tryUseNuxtApp()?.$chapterShell ?? NO_SHELL;
}

export function useFreshness(): FreshnessGuard {
  return tryUseNuxtApp()?.$chapterGuard ?? UNGUARDED;
}

export function useChapterApi(): string {
  return String(useRuntimeConfig().public.wpApiBase);
}

/** `useAsyncData` with the shell → `_payload.json` → REST order. */
export function useChapterData<T>(key: string, fetcher: () => Promise<T>) {
  const guard = useFreshness();
  return useAsyncData<T>(key, fetcher, {
    dedupe: "defer",
    getCachedData: (k, nuxtApp) =>
      resolveCached<T>(k, {
        payloadData: nuxtApp.payload.data,
        staticData: nuxtApp.static.data,
        bypassStatic: guard.bypass,
      }),
  });
}

export function useChapterSite(lang: Ref<string> | string) {
  const api = useChapterApi();
  const l = typeof lang === "string" ? lang : lang.value;
  return useChapterData<SiteEnvelope>(siteKey(l), () => fetchSite(api, l));
}

/* ---- Routes manifest: bundled at build, refreshable from REST ---- */

/* Module-level on purpose (not useState): the manifest is part of the JS
 * bundle and must not be serialized into every route's _payload.json. On the
 * server it is read-only; only the client ever replaces it. */
const routesState = shallowRef<RoutesManifest>(bundledRoutes);
let routesSeeded = false;

export function useChapterRoutes(): Ref<RoutesManifest> {
  if (import.meta.client && !routesSeeded) {
    routesSeeded = true;
    // A shell that embedded `routes` is fresher than the bundle.
    const embedded = tryUseNuxtApp()?.payload.data[ROUTES_KEY] as RoutesManifest | undefined;
    if (embedded) routesState.value = embedded;
  }
  return routesState;
}

const refreshed = new Set<string>();

/** Re-read `/routes` from REST once per unknown path (content published
 * after the last build, while a rebuild is in flight). */
export async function refreshChapterRoutes(reasonPath: string): Promise<boolean> {
  if (import.meta.server || refreshed.has(reasonPath)) return false;
  refreshed.add(reasonPath);
  const routes = useChapterRoutes();
  try {
    routes.value = await fetchRoutes(useChapterApi());
    return true;
  } catch (err) {
    console.warn("[progressnow] could not refresh the routes manifest", err);
    return false;
  }
}

function shellRoute(store: ShellStore): Route | null {
  const shell = store.shell;
  if (!shell || shell.routeKind === "search" || shell.routeKind === "not_found") return null;
  const kind = shell.routeKind as RouteKind;
  const prefix = kind === "front" ? "front:" : kind === "post" ? "post:" : kind === "event" ? "event:" : "page:";
  const payloadKey = store.keys.find((k) => k.startsWith(prefix)) ?? "";
  return { path: shell.path, kind, lang: shell.lang, id: 0, template: "", payloadKey };
}

export function useResolvedRoute(): ComputedRef<ResolvedRoute> {
  const route = useRoute();
  const routes = useChapterRoutes();
  const store = useShellStore();
  return computed(() => {
    const resolved = resolveRoute(routes.value, route.path, route.query);
    if (resolved.kind !== "not_found") return resolved;
    // The shell rendered this path (fresh content the bundle predates).
    const synthetic = isLandingPath(store, route.path) ? shellRoute(store) : null;
    if (!synthetic) return resolved;
    return { ...resolved, kind: synthetic.kind, route: synthetic, lang: synthetic.lang };
  });
}

/** `page:{lang}:{uri}` → `uri`; `post:{lang}:{slug}` → `slug`. */
export function payloadSlug(route: Route): string {
  return route.payloadKey.split(":").slice(2).join(":");
}

/* ---- Cross-cutting UI state ---- */

/** Per-route translation links (drives the header switcher). */
export function useChapterLanguages(): Ref<LanguageLink[]> {
  return useState<LanguageLink[]>("chapter-languages", () => []);
}

export function provideRouteLanguages(languages: Ref<LanguageLink[] | undefined>): void {
  const state = useChapterLanguages();
  watch(
    languages,
    (list) => {
      if (!list) return;
      state.value = list;
      // The header stays mounted across navigations and prefers the reactive
      // store (SiteHeader.vue) — keep it current on the client only, module
      // state must not leak between prerendered routes.
      if (import.meta.client) setLanguages(list);
    },
    { immediate: true },
  );
}

/** Head tags from the payload's `seo` block. The landing route keeps the PHP
 * head untouched (identical by contract); from the first client navigation on
 * unhead owns title/description/robots/canonical/hreflang and `html[lang]`. */
export function useRouteSeo(seo: Ref<Seo | undefined>, lang: Ref<string>): void {
  const store = useShellStore();
  const route = useRoute();
  const navigated = useState<boolean>("chapter-navigated", () => false);
  useHead(
    computed(() => {
      if (!seo.value) return {};
      if (import.meta.client && !navigated.value && isLandingPath(store, route.path)) return {};
      return headForSeo(seo.value, lang.value);
    }),
  );
}
