import { describe, expect, it } from "vitest";
import { extractShellManifest, parseRuntimeConfigScript } from "../../modules/lib/shell-manifest";
import { shellManifestSchema } from "@/lib/schemas";

/* A `200.html` the way `nuxt generate` (4.5) writes the SPA fallback: an
 * importmap, asset tags, the inline `window.__NUXT__.config` script, the
 * module entry, prefetch hints, and a `__NUXT_DATA__` with data-ssr="false". */
function spaHtml(opts: { ssr?: boolean; config?: boolean } = {}): string {
  return `<!DOCTYPE html><html><head>
<script type="importmap">{"imports":{"#entry":"/_nuxt/entry.Ab3.js"}}</script>
<link rel="stylesheet" href="/_nuxt/entry.Cz1.css" crossorigin>
<link rel="modulepreload" as="script" crossorigin href="/_nuxt/entry.Ab3.js">
<link rel="modulepreload" as="script" crossorigin href="/_nuxt/Dx2.js">
${opts.config === false ? "" : '<script>window.__NUXT__={};window.__NUXT__.config={public:{wpApiBase:"/mock/v1",themeStatic:"/wp-content/themes/progressnow/static",mockApi:true},app:{baseURL:"/",buildId:"build-1",buildAssetsDir:"/_nuxt/",cdnURL:""}}</script>'}
<script type="module" src="/_nuxt/entry.Ab3.js" crossorigin></script>
<link rel="prefetch" as="script" crossorigin href="/_nuxt/Route.Q9.js">
</head><body><div id="__nuxt"></div>
<script type="application/json" data-nuxt-data="nuxt-app" data-ssr="${opts.ssr ? "true" : "false"}" id="__NUXT_DATA__">[{"prerenderedAt":1,"serverRendered":2},1788584765425,false]</script>
</body></html>`;
}

describe("extractShellManifest", () => {
  it("derives entry, css, modulepreload, prefetch, importmap and runtime config from 200.html", () => {
    const manifest = extractShellManifest({ html: spaHtml(), buildId: "build-1", contentVersion: 7, prerenderedRoutes: 14, builtAt: "2026-01-01T00:00:00.000Z" });
    expect(manifest).toMatchObject({
      buildId: "build-1",
      contentVersion: 7,
      entry: "/_nuxt/entry.Ab3.js",
      css: ["/_nuxt/entry.Cz1.css"],
      modulepreload: ["/_nuxt/entry.Ab3.js", "/_nuxt/Dx2.js"],
      prefetch: ["/_nuxt/Route.Q9.js"],
      importmap: { "#entry": "/_nuxt/entry.Ab3.js" },
      prerenderedRoutes: 14,
    });
    expect(manifest.runtimeConfig.public.wpApiBase).toBe("/mock/v1");
    expect(manifest.runtimeConfig.app.buildId).toBe("build-1");
    // Round-trips through the contract the PHP shell validates against.
    expect(() => shellManifestSchema.parse(manifest)).not.toThrow();
  });

  it("refuses an SSR-rendered document, a missing entry, or a missing config", () => {
    expect(() => extractShellManifest({ html: spaHtml({ ssr: true }), buildId: "b", contentVersion: 1, prerenderedRoutes: 0 })).toThrow(/SPA fallback/);
    expect(() => extractShellManifest({ html: "<html><head></head></html>", buildId: "b", contentVersion: 1, prerenderedRoutes: 0 })).toThrow(/script type="module"/);
    expect(() => extractShellManifest({ html: spaHtml({ config: false }), buildId: "b", contentVersion: 1, prerenderedRoutes: 0 })).toThrow(/runtime config/);
  });

  it("evaluates the inline config in isolation", () => {
    const cfg = parseRuntimeConfigScript('window.__NUXT__={};window.__NUXT__.config={public:{a:1},app:{baseURL:"/",buildId:"x",buildAssetsDir:"/_nuxt/",cdnURL:""}}');
    expect(cfg.public).toEqual({ a: 1 });
    expect(() => parseRuntimeConfigScript("window.__NUXT__={}")).toThrow(/runtime config/);
  });
});
