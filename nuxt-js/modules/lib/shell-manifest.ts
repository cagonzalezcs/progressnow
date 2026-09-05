import vm from "node:vm";

/* Pure extraction for modules/shell-manifest.ts (unit-tested in
 * test/unit/shell-manifest.spec.ts). Reads the SPA fallback `200.html` that
 * `nuxt generate` writes and derives what the PHP shell must emit (openspec
 * design D5), in document order:
 *
 *   <script type="importmap">{"imports":{…}}</script>      ← importmap
 *   <link rel="stylesheet" href=…>                           ← css[]
 *   <link rel="modulepreload" as="script" crossorigin href=…> ← modulepreload[]
 *   <script>window.__NUXT__={};window.__NUXT__.config=…</script> ← runtimeConfig
 *   <script type="module" src=… crossorigin></script>         ← entry
 *   <link rel="prefetch" as="script" crossorigin href=…>      ← prefetch[] (optional)
 *
 * With `window.__NUXT__.config` present and no `__NUXT_DATA__` the client
 * entry boots with `createApp` (no hydration) and mounts into `#__nuxt` (D1). */

export interface ShellRuntimeConfig {
  public: Record<string, unknown>;
  app: { baseURL: string; buildId: string; buildAssetsDir: string; cdnURL: string } & Record<
    string,
    unknown
  >;
}

export interface ShellManifest {
  buildId: string;
  builtAt: string;
  contentVersion: number;
  entry: string;
  css: string[];
  modulepreload: string[];
  prefetch: string[];
  /** The `imports` map of the importmap the entry chunk relies on (`#entry`). */
  importmap: Record<string, string>;
  prerenderedRoutes: number;
  /** What the shell serializes as `window.__NUXT__.config`. */
  runtimeConfig: ShellRuntimeConfig;
}

const ATTR = /([a-zA-Z-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;

function attrs(tag: string): Record<string, string> {
  const out: Record<string, string> = {};
  const inner = tag.replace(/^<[a-zA-Z]+\s*/, "").replace(/\/?>$/, "");
  for (const m of inner.matchAll(ATTR)) {
    out[m[1]!.toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? "";
  }
  return out;
}

/** Evaluate Nuxt's inline `window.__NUXT__.config = {…}` assignment (our own
 * build output) in an isolated context and return the config object. */
export function parseRuntimeConfigScript(source: string): ShellRuntimeConfig {
  const sandbox = { window: {} as { __NUXT__?: { config?: ShellRuntimeConfig } } };
  vm.runInNewContext(source, sandbox, { timeout: 1000 });
  const config = sandbox.window.__NUXT__?.config;
  if (!config || typeof config !== "object" || !config.app || !config.public) {
    throw new Error("shell-manifest: the inline __NUXT__ script carries no runtime config");
  }
  return { public: { ...config.public }, app: { ...config.app } };
}

export interface ExtractInput {
  html: string;
  buildId: string;
  contentVersion: number;
  prerenderedRoutes: number;
  builtAt?: string;
}

export function extractShellManifest(input: ExtractInput): ShellManifest {
  const html = input.html;

  const css: string[] = [];
  const modulepreload: string[] = [];
  const prefetch: string[] = [];
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const a = attrs(m[0]);
    const rel = (a.rel ?? "").toLowerCase();
    if (!a.href) continue;
    if (rel === "stylesheet") css.push(a.href);
    else if (rel === "modulepreload") modulepreload.push(a.href);
    else if (rel === "prefetch") prefetch.push(a.href);
  }

  let entry = "";
  let importmap: Record<string, string> = {};
  let runtimeConfig: ShellRuntimeConfig | null = null;
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const a = attrs(`<script ${m[1]}>`);
    const type = (a.type ?? "").toLowerCase();
    const body = (m[2] ?? "").trim();
    if (type === "module" && a.src) {
      if (!entry) entry = a.src;
    } else if (type === "importmap") {
      const parsed = JSON.parse(body) as { imports?: Record<string, string> };
      importmap = { ...parsed.imports };
    } else if (type === "" && /window\.__NUXT__\s*=/.test(body)) {
      runtimeConfig = parseRuntimeConfigScript(body);
    } else if (a.id === "__NUXT_DATA__" && (a["data-ssr"] ?? "").toLowerCase() === "true") {
      throw new Error("shell-manifest: 200.html is not the SPA fallback (data-ssr=true)");
    }
  }
  if (!entry) {
    throw new Error('shell-manifest: no <script type="module" src> found in 200.html');
  }
  if (!runtimeConfig) {
    throw new Error("shell-manifest: no inline window.__NUXT__ runtime config script found in 200.html");
  }

  return {
    buildId: input.buildId,
    builtAt: input.builtAt ?? new Date().toISOString(),
    contentVersion: input.contentVersion,
    entry,
    css: [...new Set(css)],
    modulepreload: [...new Set(modulepreload)],
    prefetch: [...new Set(prefetch)],
    importmap,
    prerenderedRoutes: input.prerenderedRoutes,
    runtimeConfig,
  };
}
