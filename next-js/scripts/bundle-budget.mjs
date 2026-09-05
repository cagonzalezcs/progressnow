/* Pure helpers for scripts/check-bundle-budget.mjs (unit-tested). */

/** Script URLs a prerendered HTML shell loads on first paint: `<script src>`
 * plus `<link rel="preload" as="script">` / `<link rel="modulepreload">`.
 * @param {string} html @returns {string[]} */
export function firstLoadScripts(html) {
  const urls = new Set();
  for (const m of html.matchAll(/<script\b[^>]*\ssrc="([^"]+)"/g)) urls.add(m[1]);
  for (const m of html.matchAll(/<link\b[^>]*>/g)) {
    const tag = m[0];
    const rel = /\srel="([^"]+)"/.exec(tag)?.[1];
    const as = /\sas="([^"]+)"/.exec(tag)?.[1];
    const href = /\shref="([^"]+)"/.exec(tag)?.[1];
    if (!href) continue;
    if (rel === "modulepreload" || (rel === "preload" && as === "script")) urls.add(href);
  }
  return [...urls].filter((u) => u.startsWith("/_next/static/") && /\.js(\?|$)/.test(u)).sort();
}

/** `/_next/static/chunks/x.js?v=1` → `.next/static/chunks/x.js`
 * @param {string} url @param {string} distDir */
export function staticFileFor(url, distDir = ".next") {
  return `${distDir}/static/${url.replace(/^\/_next\/static\//, "").replace(/\?.*$/, "")}`;
}

/** @param {{ file: string; gzipBytes: number }[]} rows @param {number} budget */
export function report(rows, budget) {
  const total = rows.reduce((n, r) => n + r.gzipBytes, 0);
  const lines = rows
    .slice()
    .sort((a, b) => b.gzipBytes - a.gzipBytes)
    .map((r) => `${String(r.gzipBytes).padStart(8)}  ${r.file}`);
  lines.push(
    `${String(total).padStart(8)}  total gzipped (budget ${budget}, ${total <= budget ? "under" : "OVER"} by ${Math.abs(budget - total)})`,
  );
  return { total, ok: total <= budget, text: lines.join("\n") };
}
