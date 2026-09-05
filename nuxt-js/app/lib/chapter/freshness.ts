import type { ShellManifest } from "@/lib/schemas";

/* Freshness guard (openspec design D4). The shell embeds the content version
 * WordPress had when it rendered; the live static build declares its own in
 * shell-manifest.json. While the shell is newer — a rebuild is in flight, or
 * no rebuild transport is configured — `_payload.json` data must not be used:
 * navigations resolve from REST until a manifest with contentVersion ≥ the
 * shell's is observed. Nuxt-free; plugins/shell.client.ts drives it. */

export type FreshnessState = "unknown" | "fresh" | "stale" | "unguarded";

export interface FreshnessGuard {
  /** Content version the shell carried (0 when the app booted without a shell). */
  readonly shellVersion: number;
  state: FreshnessState;
  manifest: ShellManifest | null;
  /** True whenever the static payloads must be bypassed. */
  readonly bypass: boolean;
  observe(manifest: ShellManifest | null): FreshnessState;
}

export function compareVersions(shellVersion: number, manifestVersion: number): FreshnessState {
  return manifestVersion >= shellVersion ? "fresh" : "stale";
}

export function createFreshnessGuard(shellVersion: number | null): FreshnessGuard {
  const guard = {
    shellVersion: shellVersion ?? 0,
    // No shell (nuxt dev / preview / the static index.html itself): the static
    // build is the only source, nothing to guard against.
    state: (shellVersion === null ? "unguarded" : "unknown") as FreshnessState,
    manifest: null as ShellManifest | null,
    get bypass(): boolean {
      // Before the manifest is known — or when it is unreachable — assume the
      // shell is newer: correctness over cache hits.
      return this.state === "unknown" || this.state === "stale";
    },
    observe(manifest: ShellManifest | null): FreshnessState {
      if (this.state === "unguarded") return this.state;
      this.manifest = manifest;
      this.state = manifest ? compareVersions(this.shellVersion, manifest.contentVersion) : "stale";
      return this.state;
    },
  };
  return guard;
}
