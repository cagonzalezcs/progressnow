// node --test ".github/scripts/*.test.mjs" — openspec next-test-harness § Change-scoped pipeline.
import assert from "node:assert/strict";
import { test } from "node:test";
import { affectsNext } from "./next-paths.mjs";

const THEME = "wp-content/themes/progressnow";

test("theme PHP only → next-js untouched", () => {
  assert.equal(
    affectsNext([`${THEME}/inc/rebuild.php`, `${THEME}/templates/page.twig`]),
    false,
  );
});

test("nuxt-js only → next-js untouched", () => {
  assert.equal(
    affectsNext(["nuxt-js/app/app.vue", "nuxt-js/package-lock.json"]),
    false,
  );
});

test("docs only → next-js untouched", () => {
  assert.equal(affectsNext(["README.md", "docs/security-gates.md"]), false);
});

test("anything under next-js/", () => {
  assert.equal(affectsNext(["next-js/app/page.tsx"]), true);
  assert.equal(affectsNext(["next-js/package-lock.json"]), true);
});

test("contract fixtures the mock and contract tests read", () => {
  assert.equal(
    affectsNext([`${THEME}/tests/fixtures/single-event.json`]),
    true,
  );
});

test("drift-test sources in the theme", () => {
  for (const f of [
    "src/lib/schemas.ts",
    "src/css/tailwind.css",
    "categories.json",
  ])
    assert.equal(affectsNext([`${THEME}/${f}`]), true, f);
});

test("the workflow and its scripts", () => {
  assert.equal(affectsNext([".github/workflows/ci.yml"]), true);
  assert.equal(affectsNext([".github/scripts/next-paths.mjs"]), true);
});

test("a theme-only change plus one fixture → runs", () => {
  assert.equal(
    affectsNext([`${THEME}/inc/x.php`, `${THEME}/tests/fixtures/site.json`]),
    true,
  );
});

test("empty list (unknown base) → runs", () => {
  assert.equal(affectsNext([]), true);
});

test("blank lines and whitespace are ignored, not matched", () => {
  assert.equal(affectsNext(["", "  ", "docs/x.md"]), false);
});
