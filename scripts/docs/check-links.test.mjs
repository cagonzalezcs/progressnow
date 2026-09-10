import { test } from "node:test";
import assert from "node:assert/strict";
import { checkLinks } from "./check-links.mjs";
import { githubSlug, anchorsOf } from "./lib.mjs";

test("githubSlug follows GitHub: punctuation dropped, spaces to hyphens, code/emphasis unwrapped, repeats numbered", () => {
  assert.equal(githubSlug("Frontends: pick one"), "frontends-pick-one");
  assert.equal(githubSlug("10.8 Local development"), "108-local-development");
  assert.equal(githubSlug("REST API (`/wp-json/progressnow/v1`)"), "rest-api-wp-jsonprogressnowv1");
  assert.equal(githubSlug("2. Nuxt site (`nuxt-js/`)"), "2-nuxt-site-nuxt-js");
  assert.equal(githubSlug("**Bold** _under_score_"), "bold-_under_score_");
  assert.deepEqual([...anchorsOf("## A\n\n## A\n\n```\n## not a heading\n```\n### B c\n")], ["a", "a-1", "b-c"]);
});

test("checkLinks: relative files, anchors in this and other documents, schemes skipped, fences skipped", () => {
  const docs = {
    "README.md": "[ok](docs/a.md) [ok anchor](docs/a.md#two) [bad anchor](docs/a.md#nope) [self](#intro) [self bad](#missing)\n[gone](docs/gone.md) [web](https://x.y/#z) [mail](mailto:a@b.c) ![img](static/logo.png)\n```\n[fenced](nope.md)\n```\n## Intro\n",
    "docs/a.md": "# One\n\n## Two\n\n[up](../README.md#intro) [dir](../scripts/) [t](b.md \"Title\")\n",
  };
  const files = new Set(["README.md", "docs/a.md", "docs/b.md", "static/logo.png", "scripts/x.mjs"]);
  const dirs = new Set(["", "docs", "static", "scripts"]);
  const tracked = { files, dirs, has: (p) => files.has(p) || dirs.has(p.replace(/\/+$/, "")) };
  const findings = checkLinks({ files: Object.keys(docs), read: (f) => docs[f], tracked });
  assert.deepEqual(findings, [
    { file: "README.md", line: 1, target: "docs/a.md#nope", reason: 'anchor "#nope" not in docs/a.md' },
    { file: "README.md", line: 1, target: "#missing", reason: 'anchor "#missing" not in README.md' },
    { file: "README.md", line: 2, target: "docs/gone.md", reason: "not found" },
  ]);
});
