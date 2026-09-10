#!/usr/bin/env node
/* Change scoping for the next-js CI pipeline (openspec next-test-harness
 * § Change-scoped pipeline). Reads changed repo-relative paths (one per line)
 * on stdin and prints `true` when any of them can affect next-js, else
 * `false`. An empty list — an unknown diff base — prints `true`: when in
 * doubt, run everything. Pushes to main never consult this; the security
 * gates never do.
 *
 *   git diff --name-only "$BASE...HEAD" | node .github/scripts/next-paths.mjs
 *
 * The pattern list is the single place the dependency set lives. next-js
 * reads three things outside its own directory, each named here:
 *   - the theme's contract fixtures (next-js/test/mock/api.mjs, the
 *     `@fixtures` alias in next-js/vitest.config.mts)
 *   - the drift-test sources it compares byte for byte
 *     (next-js/test/unit/shared-source-drift.test.ts)
 *   - this workflow and its scripts
 * Tests: .github/scripts/next-paths.test.mjs (node --test ".github/scripts/*.test.mjs"). */

const THEME = "wp-content/themes/progressnow";

/** Prefixes (trailing slash) and exact paths that can affect next-js. */
export const NEXT_PATHS = [
  "next-js/",
  ".github/workflows/ci.yml",
  ".github/scripts/",
  `${THEME}/tests/fixtures/`,
  `${THEME}/src/lib/schemas.ts`,
  `${THEME}/src/css/tailwind.css`,
  `${THEME}/categories.json`,
];

/** @param {string[]} paths @returns {boolean} */
export function affectsNext(paths) {
  const changed = paths.map((p) => p.trim()).filter(Boolean);
  if (changed.length === 0) return true;
  return changed.some((p) =>
    NEXT_PATHS.some((rule) =>
      rule.endsWith("/") ? p.startsWith(rule) : p === rule,
    ),
  );
}

if (
  process.argv[1] &&
  import.meta.url === new URL(`file://${process.argv[1]}`).href
) {
  let input = "";
  process.stdin.setEncoding("utf8");
  for await (const chunk of process.stdin) input += chunk;
  process.stdout.write(`${affectsNext(input.split("\n"))}\n`);
}
