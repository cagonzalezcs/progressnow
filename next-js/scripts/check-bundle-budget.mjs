#!/usr/bin/env node
/* `npm run budget` — fail when the front page's first-load client JS exceeds
 * budget.json (openspec next-design-system § Client bundle budget). Reads the
 * prerendered shell HTML that `next build` wrote for the budgeted route and
 * gzips every script it loads. Run after `next build`. */
import { existsSync, readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { firstLoadScripts, report, staticFileFor } from "./bundle-budget.mjs";

const budget = JSON.parse(readFileSync(new URL("../budget.json", import.meta.url), "utf8"));
const route = budget.route === "/" ? "index" : budget.route.replace(/^\/|\/$/g, "");
// Per-route HTML when the route was generated (generateStaticParams); the
// optional catch-all's fallback shell otherwise.
const candidates = [`.next/server/app/${route}.html`, ".next/server/app/[[...slug]].html"];
const htmlPath = candidates.find((p) => existsSync(p));
if (!htmlPath) {
  console.error(
    `bundle budget: no prerendered HTML for ${budget.route} (looked at ${candidates.join(", ")}). Run \`next build\` first.`,
  );
  process.exit(2);
}

const scripts = firstLoadScripts(readFileSync(htmlPath, "utf8"));
const rows = scripts.map((url) => {
  const file = staticFileFor(url);
  if (!existsSync(file))
    throw new Error(`bundle budget: ${url} referenced by ${htmlPath} but ${file} is missing`);
  return { file, gzipBytes: gzipSync(readFileSync(file), { level: 9 }).length };
});
const result = report(rows, budget.firstLoadJsGzipBytes);
console.log(`bundle budget for ${budget.route} (${htmlPath}):\n${result.text}`);
process.exit(result.ok ? 0 : 1);
