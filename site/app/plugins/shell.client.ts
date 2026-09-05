import { defineNuxtPlugin } from "#imports";
import { readShellData, createShellStore } from "@/lib/chapter/shell";
import { createFreshnessGuard } from "@/lib/chapter/freshness";
import { shellManifestSchema } from "@/lib/schemas";

/* Boot from the PHP shell (openspec design D1/D4).
 *
 * Reads `__SHELL_DATA__` before any route setup, seeds every embedded payload
 * into `nuxtApp.payload.data` — the first stop of `useChapterData()`'s cache
 * order — so the landing route renders with zero requests, then starts the
 * freshness check against `shell-manifest.json`. Without a shell (nuxt dev,
 * preview, or the static index.html served directly) everything is inert and
 * the guard is "unguarded". */
export default defineNuxtPlugin({
  name: "progressnow:shell",
  enforce: "pre",
  setup(nuxtApp) {
    const data = readShellData(document);
    const store = createShellStore(data);
    const guard = createFreshnessGuard(data ? data.contentVersion : null);

    if (data) {
      for (const [key, value] of Object.entries(data.data)) {
        nuxtApp.payload.data[key] = value;
      }
    }

    const ready: Promise<void> = (async () => {
      if (!data) return;
      try {
        const res = await fetch("/shell-manifest.json", {
          cache: "no-cache",
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`shell-manifest.json → ${res.status}`);
        const manifest = shellManifestSchema.parse(await res.json());
        const state = guard.observe(manifest);
        if (state === "stale") {
          console.info(
            `[progressnow] static build is content v${manifest.contentVersion}, shell is v${data.contentVersion} — resolving navigations from REST until a rebuild lands`,
          );
        }
      } catch (err) {
        guard.observe(null);
        console.warn("[progressnow] shell-manifest.json unavailable — resolving navigations from REST", err);
      }
    })();

    return {
      provide: {
        chapterShell: store,
        chapterGuard: guard,
        chapterGuardReady: ready,
      },
    };
  },
});
