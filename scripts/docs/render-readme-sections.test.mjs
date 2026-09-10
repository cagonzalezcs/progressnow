import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  countTasks,
  firstWhatChangesBullet,
  metadataDescription,
  oneLine,
  readChanges,
  readSpecs,
  render,
  drift,
  main,
} from "./render-readme-sections.mjs";

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "docs-render-"));
  const w = (rel, text) => {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), text);
  };
  w("openspec/changes/beta/tasks.md", "## 1\n\n- [x] 1.1 done\n- [ ] 1.2 open\n  - [ ] nested does not count\n* [X] 1.3 star, capital\n");
  w("openspec/changes/beta/proposal.md", "## Why\n\n- not this\n\n## What Changes\n\n- **First.** Lands `a/b.ts`\n  and continues here.\n- Second bullet\n\n## Impact\n");
  w("openspec/changes/beta/.openspec.yaml", "schema: spec-driven\ncreated: 2026-09-07\n");
  w("openspec/changes/alpha/tasks.md", "- [x] a\n- [x] b\n");
  w("openspec/changes/alpha/.openspec.yaml", 'schema: spec-driven\ndescription: "Curated | scope"\n');
  w("openspec/changes/alpha/proposal.md", "## What Changes\n\n- ignored when description is set\n");
  w("openspec/changes/stub/.openspec.yaml", "schema: spec-driven\n");
  w("openspec/changes/archive/2026-01-01-old/tasks.md", "- [ ] never listed\n");
  w("openspec/specs/one/spec.md", "## Purpose\n\n### Requirement: A\n\n### Requirement: B\n");
  w("openspec/specs/two/spec.md", "### Requirement: C\n");
  w("openspec/specs/no-spec-file/README.md", "not a spec");
  w(
    "README.md",
    "# X\n\n## Roadmap\n\nintro\n\n<!-- openspec:roadmap:start -->\nold\n<!-- openspec:roadmap:end -->\n\n<!-- openspec:capabilities:start -->\nold caps\n<!-- openspec:capabilities:end -->\n\ntail\n",
  );
  return root;
}

test("countTasks mirrors the CLI: top-level - / * checkboxes, case-insensitive x, nested lines ignored", () => {
  assert.deepEqual(countTasks("- [x] a\n- [ ] b\n  - [ ] c\n* [X] d\n-[ ] e\n- [x]f\n"), { total: 4, completed: 3 });
});

test("firstWhatChangesBullet joins continuation lines and stops at the next bullet or section", () => {
  const p = "## What Changes\n\n- **First.** Lands `a/b.ts`\n  and continues here.\n- Second\n";
  assert.equal(firstWhatChangesBullet(p), "**First.** Lands `a/b.ts` and continues here.");
  assert.equal(firstWhatChangesBullet("## Why\n\n- nope\n"), null);
});

test("metadataDescription reads a quoted or bare one-liner", () => {
  assert.equal(metadataDescription('schema: x\ndescription: "Hello | there"\n'), "Hello | there");
  assert.equal(metadataDescription("description: bare text\n"), "bare text");
  assert.equal(metadataDescription("schema: x\n"), null);
});

test("oneLine collapses whitespace, escapes pipes, cuts at a sentence and never inside code", () => {
  assert.equal(oneLine("a  b\n c | d"), "a b c \\| d");
  const long = `${"word ".repeat(30)}end. ${"more ".repeat(30)}`;
  assert.ok(oneLine(long, 180).endsWith("end."));
  const code = `${"w ".repeat(60)}\`some/long/path/that/gets/cut.ts\` ${"z ".repeat(60)}`;
  const cut = oneLine(code, 140);
  assert.equal((cut.match(/`/g) ?? []).length % 2, 0);
  assert.ok(cut.endsWith("…"));
});

test("readChanges: name order, archive skipped, description beats the proposal bullet, stub has no tasks", () => {
  const root = fixture();
  const changes = readChanges(root);
  assert.deepEqual(
    changes.map((c) => [c.name, c.completed, c.total]),
    [
      ["alpha", 2, 2],
      ["beta", 2, 3],
      ["stub", 0, 0],
    ],
  );
  assert.equal(changes[0].scope, "Curated \\| scope");
  assert.equal(changes[1].scope, "**First.** Lands `a/b.ts` and continues here.");
  assert.equal(changes[2].scope, "");
});

test("readSpecs counts Requirement headings and ignores directories without spec.md", () => {
  assert.deepEqual(readSpecs(fixture()), [
    { name: "one", requirements: 2 },
    { name: "two", requirements: 1 },
  ]);
});

test("render replaces only the marked regions; --check reports the stale rows and exits 1", () => {
  const root = fixture();
  const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
  const out = render(readme, { changes: readChanges(root), specs: readSpecs(root) });
  assert.match(out, /^# X\n\n## Roadmap\n\nintro\n/);
  assert.match(out, /\| `alpha` \| 2\/2 ✓ \| Curated \\\| scope \|/);
  assert.match(out, /\| `beta` \| 2\/3 \| \*\*First\.\*\*/);
  assert.match(out, /\| `stub` \| — \| — \|/);
  assert.match(out, /Capabilities on file — 2 specs, 3 requirements .*`one` \(2\), `two` \(1\)\./);
  assert.ok(out.endsWith("<!-- openspec:capabilities:end -->\n\ntail\n"));
  assert.ok(!out.includes("old caps"));

  const d = drift(readme, out);
  assert.ok(d.includes("- old"));
  assert.ok(d.some((l) => l.startsWith("+ | `beta` |")));

  const errors = [];
  const origErr = console.error;
  console.error = (m) => errors.push(String(m));
  try {
    assert.equal(main(["--check"], root), 1);
  } finally {
    console.error = origErr;
  }
  assert.ok(errors.some((l) => l === "- old"));
  assert.equal(fs.readFileSync(path.join(root, "README.md"), "utf8"), readme, "--check must not write");

  assert.equal(main([], root), 0);
  assert.equal(fs.readFileSync(path.join(root, "README.md"), "utf8"), out);
  assert.equal(main(["--check"], root), 0);
});
