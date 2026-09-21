import { test } from "node:test";
import assert from "node:assert/strict";
import { checkPaths, looksLikePath, parseAllowlist, resolves, withBasenames } from "./check-paths.mjs";

function tracked(list) {
  const files = new Set(list);
  const dirs = new Set([""]);
  for (const f of list) {
    let d = f;
    while ((d = d.slice(0, d.lastIndexOf("/"))) && !dirs.has(d)) dirs.add(d);
  }
  return withBasenames({ files, dirs, has: (p) => files.has(p) || dirs.has(p.replace(/\/+$/, "")) });
}

test("looksLikePath: paths and file names yes; URLs, globs, placeholders, routes, flags, env, hooks with spaces no", () => {
  for (const yes of ["inc/rest.php", "docs/", "schemas.ts", ".nvmrc", ".env.local", "wp-config.php", "src/css/tailwind.css", "LICENSE.md"])
    assert.ok(looksLikePath(yes), yes);
  for (const no of [
    "https://x.y/z", "/es/inicio/", "/wp-json/progressnow/v1/*", "tests/fixtures/*.json", "<next-origin>/api/rebuild",
    "posts:{lang}", "--check", "NODE_EXTRA_CA_CERTS=x", "npm run dev", "es_MX", "LICENSE", "@kucrut/vite-for-wp",
    "a[href]", "page → x", "owner/repo?x", "…/wp-json/progressnow/v1", "../up.md", "a//b",
  ])
    assert.ok(!looksLikePath(no), no);
});

test("resolves against the doc dir, the root, the app roots, then by bare file name", () => {
  const t = tracked(["README.md", "wp-content/themes/progressnow/inc/rest.php", "next-js/lib/env.ts", "nuxt-js/README.md", "docs/deployment.md"]);
  assert.ok(resolves("inc/rest.php", "", t), "theme-relative from the root README");
  assert.ok(resolves("lib/env.ts", "docs", t), "next-js-relative from docs/");
  assert.ok(resolves("deployment.md", "docs", t), "doc-dir relative");
  assert.ok(resolves("docs/", "", t), "directory with trailing slash");
  assert.ok(resolves("env.ts", "", t), "bare file name anywhere");
  assert.ok(!resolves("inc/gone.php", "", t));
  assert.ok(!resolves("Readme.md", "", t), "case-exact");
});

test("checkPaths: findings carry file:line; (planned) only in proposals; generated README regions and fences skipped; allowlist", () => {
  const t = tracked(["README.md", "docs/a.md", "openspec/changes/x/proposal.md", "inc/ok.php"]);
  const docs = {
    "README.md": "see `inc/ok.php` and `inc/gone.php`\n```\n`fenced/nope.php`\n```\n<!-- openspec:roadmap:start -->\n| `made/up.ts` |\n<!-- openspec:roadmap:end -->\n`hook/name` `owner/repo`\n",
    "docs/a.md": "`later/thing.md` (planned) does not count outside proposals\n",
    "openspec/changes/x/proposal.md": "adds `later/thing.md` (planned)\nand `also/missing.md`\n",
  };
  const findings = checkPaths({
    files: Object.keys(docs),
    read: (f) => docs[f],
    tracked: t,
    allowlist: parseAllowlist("# comment\nowner/repo\nhook/*  # prefix\n"),
  });
  assert.deepEqual(findings, [
    { file: "README.md", line: 1, token: "inc/gone.php" },
    { file: "docs/a.md", line: 1, token: "later/thing.md" },
    { file: "openspec/changes/x/proposal.md", line: 2, token: "also/missing.md" },
  ]);
});
