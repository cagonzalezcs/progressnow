#!/usr/bin/env node
/* Snapshot a live `GET /wp-json/progressnow/v1/*` into ./snapshot.json plus the
 * media it references into ./public, so the Vercel function in api/index.mjs
 * can serve the same content without reaching WordPress.
 *
 *   SOURCE=https://progressnow.test:8890 node snapshot.mjs
 *
 * Absolute URLs on the source origin are stored as `__ORIGIN__` and re-homed
 * per request by the handler. Against MAMP, trust its CA from the shell
 * (NODE_EXTRA_CA_CERTS) — see next-js/.env.example. */
import { mkdirSync, writeFileSync, copyFileSync, existsSync, cpSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "..", "..");
const SOURCE = (process.env.SOURCE ?? "https://progressnow.test:8890").replace(/\/+$/, "");
const API = `${SOURCE}/wp-json/progressnow/v1`;
const LANGS = ["en", "es"];
const ALL_TIME = { after: "2000-01-01", before: "2100-12-31" };

/** @type {Record<string, unknown>} key = "path?sorted-query" */
const snapshot = {};
/** @type {Set<string>} */
const media = new Set();

function key(path, query = {}) {
  const qs = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join("&");
  return qs ? `${path}?${qs}` : path;
}

async function grab(path, query = {}) {
  const k = key(path, query);
  const res = await fetch(`${API}${k}`);
  if (!res.ok) throw new Error(`${res.status} ${API}${k}`);
  const text = await res.text();
  for (const m of text.matchAll(/https?:\\?\/\\?\/[^"]+?\\?\/wp-content\\?\/[^"]+/g)) {
    media.add(m[0].replace(/\\\//g, "/"));
  }
  const host = new URL(SOURCE).host;
  const data = JSON.parse(
    text
      .replaceAll(SOURCE.replace(/\//g, "\\/"), SOURCE)
      .replaceAll(SOURCE, "__ORIGIN__")
      // e.g. Google Calendar links carry webcal://host encoded as a query value
      .replaceAll(encodeURIComponent(host), "__HOST_ENC__"),
  );
  snapshot[k] = data;
  process.stdout.write(`  ${k}\n`);
  return data;
}

console.log(`Snapshotting ${API}`);
const routes = await grab("/routes");
await grab("/categories");
for (const lang of LANGS) {
  await grab("/site", { lang });
  await grab("/front-page", { lang });
  // Full lists; the handler paginates/filters (posts) and windows by date (events).
  const posts = [];
  for (let page = 1, totalPages = 1; page <= totalPages; page++) {
    const env = await grab("/posts", { lang, per_page: 50, page });
    posts.push(...env.posts);
    totalPages = env.totalPages;
  }
  snapshot[key("/posts", { all: 1, lang })] = { posts, total: posts.length };
  await grab("/events", { lang, ...ALL_TIME });
}
for (const r of routes.routes) {
  const slug = r.payloadKey.split(":").slice(2).join(":");
  if (r.kind === "post") await grab(`/posts/${slug}`, { lang: r.lang });
  else if (r.kind === "event") await grab(`/events/${slug}`, { lang: r.lang });
  else if (r.kind !== "front") await grab(`/pages/${slug}`, { lang: r.lang });
}

writeFileSync(join(HERE, "snapshot.json"), JSON.stringify({ source: SOURCE, takenAt: new Date().toISOString(), entries: snapshot }));
console.log(`${Object.keys(snapshot).length} responses → snapshot.json`);

// Media: referenced uploads (from the local WP tree) + the whole theme static dir (fonts/brand art).
const pub = join(HERE, "public");
let copied = 0;
for (const url of media) {
  const rel = new URL(url).pathname.replace(/^\//, "");
  if (rel.startsWith("wp-content/themes/")) continue; // covered by the static dir below
  const src = join(REPO, rel);
  if (!existsSync(src)) {
    console.warn(`  missing locally, skipped: ${rel}`);
    continue;
  }
  mkdirSync(dirname(join(pub, rel)), { recursive: true });
  copyFileSync(src, join(pub, rel));
  copied++;
}
const staticRel = "wp-content/themes/progressnow/static";
cpSync(join(REPO, staticRel), join(pub, staticRel), { recursive: true });
console.log(`${copied} upload(s) + ${staticRel} → public/`);
