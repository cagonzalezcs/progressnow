import { addTemplate, defineNuxtModule, useLogger } from "@nuxt/kit";
import { routesManifestSchema, type RoutesManifest } from "../app/lib/schemas";
import { mockRoutesManifest } from "../shared/mock-api";

/* The `/routes` manifest (openspec design D3), fetched once per build:
 *
 *  - bundled as `#build/progressnow-routes.mjs` so path → route resolution
 *    needs no request (client and prerender alike);
 *  - fed to `nitro.prerender.routes` so `nuxt generate` renders every public
 *    WordPress URL in every language — editor slugs decide what exists, never
 *    link crawling. A fetch failure fails the build.
 *
 * `nuxt prepare`/typecheck skip the fetch (empty manifest); NUXT_MOCK_API=1
 * uses the fixture routes. Content published after the build is still
 * reachable: the app refreshes the manifest from REST on an unknown path. */
export default defineNuxtModule({
  meta: { name: "progressnow:routes-manifest" },
  async setup(_options, nuxt) {
    const logger = useLogger("routes-manifest");
    const pub = nuxt.options.runtimeConfig.public as { wpApiBase: string; mockApi: boolean };
    const empty: RoutesManifest = { routes: [], contentVersion: 0, generatedAt: "" };

    let manifest: RoutesManifest = empty;
    if (nuxt.options._prepare) {
      logger.info("prepare — skipping the /routes fetch");
    } else if (pub.mockApi) {
      manifest = routesManifestSchema.parse(mockRoutesManifest());
      logger.info("NUXT_MOCK_API=1 — using the fixture routes");
    } else {
      // Outside `nuxt dev` the chapter.test default is never right: a build
      // host has no local WordPress, so the fetch dies as an opaque
      // "fetch failed" against a hostname nobody set. Name the variable.
      if (!nuxt.options.dev && !process.env.NUXT_PUBLIC_WP_API_BASE) {
        throw new Error(
          "routes-manifest: NUXT_PUBLIC_WP_API_BASE is unset, so this build has no " +
            "WordPress to read /routes from. Set it to the absolute " +
            "…/wp-json/progressnow/v1 of the source site, or build with " +
            "NUXT_MOCK_API=1 (`npm run generate:mock`) for a fixture-backed render.",
        );
      }
      manifest = await fetchManifest(String(pub.wpApiBase ?? ""));
    }

    addTemplate({
      filename: "progressnow-routes.mjs",
      write: true,
      getContents: () => `export default ${JSON.stringify(manifest)};\n`,
    });

    nuxt.hook("prerender:routes", ({ routes }) => {
      for (const route of manifest.routes) {
        routes.add(route.path);
      }
      // Hand the content version to modules/shell-manifest.ts when the
      // workflow didn't pin one explicitly.
      process.env.PROGRESSNOW_ROUTES_CONTENT_VERSION = String(manifest.contentVersion);

      const langs = [...new Set(manifest.routes.map((r) => r.lang || "default"))];
      logger.info(
        `prerendering ${manifest.routes.length} routes (${langs.join(", ")}), content v${manifest.contentVersion}`,
      );
    });
  },
});

async function fetchManifest(base: string): Promise<RoutesManifest> {
  const root = base.replace(/\/+$/, "");
  if (!/^https?:\/\//.test(root)) {
    throw new Error(
      `routes-manifest: NUXT_PUBLIC_WP_API_BASE must be an absolute WordPress REST URL (got "${root}")`,
    );
  }
  const url = `${root}/routes`;
  let res: Response;
  try {
    res = await fetch(url, { headers: { Accept: "application/json" } });
  } catch (err) {
    throw new Error(`routes-manifest: GET ${url} failed — ${(err as Error).message}`, { cause: err });
  }
  if (!res.ok) {
    throw new Error(`routes-manifest: GET ${url} returned ${res.status}`);
  }
  return routesManifestSchema.parse(await res.json());
}
