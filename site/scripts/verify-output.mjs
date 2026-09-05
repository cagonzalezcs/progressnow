#!/usr/bin/env node
/* Post-generate verification (openspec spec nuxt-static-site § Static
 * generation): every manifest route has index.html + _payload.json in both
 * languages, the Nuxt build metadata exists, and shell-manifest.json points at
 * files that are really there. Exits non-zero naming the first problem. */
import { access, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const out = resolve(process.argv[2] ?? ".output/public");
const problems = [];

async function exists(rel) {
  try {
    await access(join(out, rel));
    return true;
  } catch {
    return false;
  }
}

const manifestPath = join(out, "shell-manifest.json");
let manifest;
try {
  manifest = JSON.parse(await readFile(manifestPath, "utf8"));
} catch (err) {
  console.error(`✖ ${manifestPath}: ${err.message}`);
  process.exit(1);
}

for (const key of ["buildId", "builtAt", "contentVersion", "entry", "css", "modulepreload", "prerenderedRoutes", "runtimeConfig"]) {
  if (!(key in manifest)) problems.push(`shell-manifest.json is missing "${key}"`);
}
for (const rel of [manifest.entry, ...(manifest.css ?? []), ...(manifest.modulepreload ?? [])]) {
  if (typeof rel !== "string" || !(await exists(rel))) problems.push(`shell-manifest.json references a missing asset: ${rel}`);
}
if (!(await exists("_nuxt/builds/latest.json"))) problems.push("missing _nuxt/builds/latest.json");
if (!(await exists(`_nuxt/builds/meta/${manifest.buildId}.json`))) problems.push(`missing _nuxt/builds/meta/${manifest.buildId}.json`);
if (!(await exists("200.html"))) problems.push("missing 200.html (SPA fallback)");

// Routes: the generated app manifest lists what nitro prerendered.
let prerendered = [];
try {
  prerendered = JSON.parse(await readFile(join(out, `_nuxt/builds/meta/${manifest.buildId}.json`), "utf8")).prerendered ?? [];
} catch {
  /* reported above */
}
const langs = new Set();
for (const route of prerendered) {
  if (route.endsWith(".html") || route.endsWith(".json")) continue;
  const dir = route === "/" ? "" : route.replace(/^\//, "");
  langs.add(route.startsWith("/es/") || route === "/es" ? "es" : "default");
  if (!(await exists(join(dir, "index.html")))) problems.push(`${route}: missing index.html`);
  if (!(await exists(join(dir, "_payload.json")))) problems.push(`${route}: missing _payload.json`);
}
if (prerendered.length === 0) problems.push("no prerendered routes recorded in the app manifest");
if (manifest.prerenderedRoutes < prerendered.length) problems.push(`shell-manifest.json counts ${manifest.prerenderedRoutes} routes, app manifest has ${prerendered.length}`);

if (problems.length) {
  for (const p of problems) console.error(`✖ ${p}`);
  process.exit(1);
}
console.log(`✔ ${prerendered.length} routes (${[...langs].join(", ")}), build ${manifest.buildId}, content v${manifest.contentVersion}, entry ${manifest.entry}`);
