import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { defineNuxtModule, useLogger } from "@nuxt/kit";
import { extractShellManifest } from "./lib/shell-manifest";

/* Emits `.output/public/shell-manifest.json` (openspec design D5) — what
 * inc/shell.php reads to emit the app's importmap/stylesheet/modulepreload/
 * runtime-config/entry tags.
 *
 * `nuxt generate` order: prerender → nitro build (`rollup:before` copies the
 * client bundle + `_nuxt/builds/*` into `.output/public`, then fires
 * `nitro:build:public-assets`). The manifest is written in that last hook,
 * after every asset it references exists; the deploy step then uploads it
 * LAST so it only ever points at fully uploaded assets. A prerender failure
 * fails the build by name before any manifest is written.
 *
 * `contentVersion` is the value the rebuild dispatch carried
 * (CHAPTER_CONTENT_VERSION), falling back to what the /routes manifest
 * reported at build time. */
export default defineNuxtModule({
  meta: { name: "progressnow:shell-manifest" },
  setup(_options, nuxt) {
    const logger = useLogger("shell-manifest");
    let prerendered = 0;

    nuxt.hook("nitro:init", (nitro) => {
      nitro.hooks.hook("prerender:done", ({ prerenderedRoutes, failedRoutes }) => {
        // Pages only — nitro also lists every _payload.json and the 200/404 fallbacks.
        prerendered = prerenderedRoutes.filter(
          (r) => !r.route.endsWith("/_payload.json") && !r.route.endsWith(".html"),
        ).length;
        if (failedRoutes.length === 0) return;
        // Name the routes and make sure the process exits non-zero even if
        // the hook error is only logged (spec: "Missing content fails loudly").
        process.exitCode = 1;
        const details = failedRoutes
          .map((r) => {
            const err = r.error as { statusCode?: number; message?: string; stack?: string } | undefined;
            return `${r.route} → ${err?.statusCode ?? "?"} ${err?.message ?? ""}${err?.stack ? `\n${err.stack}` : ""}`;
          })
          .join("\n");
        throw new Error(`shell-manifest: ${failedRoutes.length} route(s) failed to prerender:\n${details}`);
      });
    });

    nuxt.hook("nitro:build:public-assets", async (nitro) => {
      const publicDir = nitro.options.output.publicDir;
      const spa = join(publicDir, "200.html");
      if (!nitro.options.static || !existsSync(spa)) {
        logger.info("not a static generate — no shell-manifest.json");
        return;
      }
      try {
        const html = await readFile(spa, "utf8");
        const fromEnv = Number.parseInt(process.env.CHAPTER_CONTENT_VERSION ?? "", 10);
        const fromRoutes = Number.parseInt(process.env.PROGRESSNOW_ROUTES_CONTENT_VERSION ?? "", 10);
        const contentVersion = Number.isFinite(fromEnv) ? fromEnv : Number.isFinite(fromRoutes) ? fromRoutes : 0;

        const manifest = extractShellManifest({
          html,
          buildId: nuxt.options.buildId,
          contentVersion,
          prerenderedRoutes: prerendered,
        });
        for (const rel of [manifest.entry, ...manifest.css, ...manifest.modulepreload]) {
          if (!existsSync(join(publicDir, rel))) {
            throw new Error(`shell-manifest: ${rel} is referenced by 200.html but missing from ${publicDir}`);
          }
        }

        await writeFile(join(publicDir, "shell-manifest.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8");
        logger.success(
          `shell-manifest.json: build ${manifest.buildId}, content v${manifest.contentVersion}, ${manifest.prerenderedRoutes} routes, entry ${manifest.entry}`,
        );
      } catch (err) {
        // A logged-but-swallowed hook error must still fail the build.
        process.exitCode = 1;
        throw err;
      }
    });
  },
});
