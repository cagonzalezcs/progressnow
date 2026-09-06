#!/usr/bin/env node
/* Side-by-side review artifacts: every manifest route (en + es) and the 404,
 * screenshotted full-page at desktop and mobile widths from BOTH renditions —
 * the Nuxt static output (`nuxt-js/.output/public`, from `npm run
 * generate:mock` there) and this app's production build (`npm run build:mock`
 * here) — written to test-results/parity/ with an index.html contact sheet
 * (openspec next-js-site-implementation task 6.9 parity pass).
 *
 *   node scripts/parity-screenshots.mjs            starts mock + Next + a static Nuxt server
 *   NEXT_ORIGIN=… NUXT_ORIGIN=… node scripts/…     reuse running servers
 *
 * The Nuxt output is static: its islands that fetch on mount (calendar) show
 * their loading/error state, which is expected here — compare the chrome and
 * the server-rendered bands. */
import { spawn } from "node:child_process";
import { createReadStream, existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const here = fileURLToPath(new URL(".", import.meta.url));
const root = resolve(here, "..");
const nuxtPublic = resolve(root, "../nuxt-js/.output/public");
const outDir = resolve(root, "test-results/parity");
const MOCK_PORT = 8787;
const NEXT_PORT = Number(process.env.PW_APP_PORT ?? 3100);
const NUXT_PORT = 3200;
const WIDTHS = [1440, 390];
const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
};

const children = [];
function run(cmd, args, env = {}) {
  const child = spawn(cmd, args, {
    cwd: root,
    env: { ...process.env, ...env },
    stdio: ["ignore", "ignore", "inherit"],
  });
  children.push(child);
  return child;
}
async function waitFor(url, ms = 60_000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    try {
      const r = await fetch(url);
      if (r.ok || r.status === 404) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`timeout waiting for ${url}`);
}

/** Static server for the Nuxt output (directory index + SPA-ish 404.html). */
function serveStatic(dir, port) {
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", `http://127.0.0.1:${port}`);
    let file = join(dir, decodeURIComponent(url.pathname));
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
    if (!existsSync(file)) {
      file = join(dir, "404.html");
      res.statusCode = 404;
    }
    res.setHeader("content-type", MIME[extname(file)] ?? "application/octet-stream");
    createReadStream(file).pipe(res);
  });
  server.listen(port, "127.0.0.1");
  return server;
}

async function main() {
  if (!existsSync(join(nuxtPublic, "index.html"))) {
    console.error(
      `parity: ${nuxtPublic} missing — run \`npm run generate:mock\` in nuxt-js first.`,
    );
    process.exit(2);
  }
  const mockOrigin = `http://127.0.0.1:${MOCK_PORT}`;
  let nextOrigin = process.env.NEXT_ORIGIN;
  let nuxtOrigin = process.env.NUXT_ORIGIN;
  let staticServer = null;
  if (!nextOrigin) {
    run("node", ["test/mock/server.mjs"], {
      MOCK_PORT: String(MOCK_PORT),
      MOCK_ORIGIN: mockOrigin,
    });
    await waitFor(`${mockOrigin}/__mock/health`);
    nextOrigin = `http://127.0.0.1:${NEXT_PORT}`;
    run("node", ["scripts/start-standalone.mjs"], {
      MOCK_API: "1",
      WP_API_BASE: `${mockOrigin}/wp-json/progressnow/v1`,
      NEXT_PUBLIC_SITE_ORIGIN: nextOrigin,
      CHAPTER_REBUILD_SECRET: "parity-screenshots-local-secret",
      PORT: String(NEXT_PORT),
      HOSTNAME: "127.0.0.1",
    });
    await waitFor(`${nextOrigin}/api/health/`);
  }
  if (!nuxtOrigin) {
    staticServer = serveStatic(nuxtPublic, NUXT_PORT);
    nuxtOrigin = `http://127.0.0.1:${NUXT_PORT}`;
  }

  const manifest = await (await fetch(`${mockOrigin}/wp-json/progressnow/v1/routes`)).json();
  const routes = [
    ...manifest.routes.filter((r) => r.kind !== "styleguide"),
    { path: "/does-not-exist/", kind: "not_found", lang: "en" },
    { path: "/es/no-existe/", kind: "not_found", lang: "es" },
  ];
  mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const rows = [];
  for (const route of routes) {
    for (const width of WIDTHS) {
      const shots = {};
      for (const [name, origin] of [
        ["next", nextOrigin],
        ["nuxt", nuxtOrigin],
      ]) {
        const page = await browser.newPage({
          viewport: { width, height: 900 },
          reducedMotion: "reduce",
        });
        await page.goto(`${origin}${route.path}`, { waitUntil: "networkidle" }).catch(() => {});
        await page.waitForTimeout(400);
        const slug = `${route.kind}-${route.lang}${route.path.replace(/\W+/g, "_")}__${width}__${name}.png`;
        await page.screenshot({ path: join(outDir, slug), fullPage: true, animations: "disabled" });
        shots[name] = slug;
        await page.close();
      }
      rows.push({ ...route, width, ...shots });
      console.log(`parity: ${route.path} @${width}`);
    }
  }
  await browser.close();
  const html = `<!doctype html><meta charset="utf-8"><title>Parity: Nuxt vs Next</title>
<style>body{font:14px system-ui;margin:24px}h2{margin:32px 0 8px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:12px}img{width:100%;border:1px solid #ccc}figcaption{font-weight:700;margin-bottom:4px}</style>
<h1>Parity review — Nuxt (static output) vs Next (production build)</h1>
<p>Generated ${new Date().toISOString()}. Left: Nuxt. Right: Next. The Nuxt calendar island fetches on mount, so it shows its loading state in a static preview.</p>
${rows.map((r) => `<h2>${r.kind} · ${r.lang} · ${r.path} · ${r.width}px</h2><div class="pair"><figure><figcaption>Nuxt</figcaption><img loading="lazy" src="${r.nuxt}"></figure><figure><figcaption>Next</figcaption><img loading="lazy" src="${r.next}"></figure></div>`).join("\n")}`;
  writeFileSync(join(outDir, "index.html"), html);
  console.log(`parity: ${rows.length} pairs → ${outDir}/index.html`);
  staticServer?.close();
  for (const c of children) c.kill("SIGTERM");
}

main().catch((err) => {
  console.error(err);
  for (const c of children) c.kill("SIGTERM");
  process.exit(1);
});
