import { test } from "node:test";
import assert from "node:assert/strict";
import { MIN_WORDS, compareSections, normalizeHeading, similarity, words } from "./check-duplicate-sections.mjs";
import { sections } from "./lib.mjs";

test("normalizeHeading: case, formatting and a trailing parenthetical are ignored", () => {
  assert.equal(normalizeHeading("Testing"), "testing");
  assert.equal(normalizeHeading("**Testing** (theme)"), "testing");
  assert.equal(normalizeHeading("REST API (`/wp-json/progressnow/v1`)"), "rest api");
});

test("similarity: identical 1, disjoint 0, one word in five changed ≈ 0.8", () => {
  const a = words("one two three four five six seven eight nine ten");
  assert.equal(similarity(a, a), 1);
  assert.equal(similarity(a, words("alpha beta gamma")), 0);
  const b = words("one two three four X six seven eight nine Y");
  assert.equal(similarity(a, b), 0.8);
});

test("sections: H2 bodies run to the next H1/H2, H3 stays inside, fenced headings ignored", () => {
  const s = sections("# T\n\nintro\n\n## A\n\na body\n\n### A.1\n\nsub\n\n```\n## not a heading\n```\n\n## B\n\nb body\n");
  assert.deepEqual(
    s.map((x) => [x.heading, x.line, x.body.includes("sub"), x.body.includes("not a heading")]),
    [
      ["A", 5, true, true],
      ["B", 17, false, false],
    ],
  );
});

test("compareSections: same heading across files scored, short bodies skipped, same-file pairs skipped", () => {
  const body = Array.from({ length: MIN_WORDS + 5 }, (_, i) => `w${i}`).join(" ");
  const docs = {
    "a.md": `## Testing\n\n${body}\n\n## Short\n\nsee b.md\n`,
    "b.md": `## Testing\n\n${body} extra\n\n## Short\n\nsee a.md\n\n## Other\n\n${body}\n`,
    "c.md": `## testing (app)\n\nnothing alike here at all, ${"z ".repeat(MIN_WORDS)}\n`,
  };
  const pairs = compareSections({ files: Object.keys(docs), read: (f) => docs[f] });
  assert.deepEqual(
    pairs.map((p) => [p.a.file, p.b.file, p.heading, p.score > 0.8]),
    [
      ["a.md", "b.md", "Testing", true],
      ["a.md", "c.md", "Testing", false],
      ["b.md", "c.md", "Testing", false],
    ],
  );
});
