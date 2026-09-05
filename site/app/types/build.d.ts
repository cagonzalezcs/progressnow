import type { RoutesManifest } from "@/lib/schemas";
import type { ShellStore } from "@/lib/chapter/shell";
import type { FreshnessGuard } from "@/lib/chapter/freshness";

/* Build-time routes manifest written by modules/routes-manifest.ts. */
declare module "#build/progressnow-routes.mjs" {
  const manifest: RoutesManifest;
  export default manifest;
}

/* Provided by app/plugins/shell.client.ts (client only). */
declare module "#app" {
  interface NuxtApp {
    $chapterShell?: ShellStore;
    $chapterGuard?: FreshnessGuard;
    $chapterGuardReady?: Promise<void>;
  }
}

export {};
