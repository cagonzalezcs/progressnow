import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import allowlist from "../../html-sinks.allowlist.json";

/* HTML sink governance (openspec next-edge-trust-boundaries § HTML sinks are
 * enumerated and justified). Lint (`react/no-danger`) rejects a sink outside
 * html-sinks.allowlist.json; this test keeps the allowlist itself honest: the
 * set of files and the count per file must match the tree, every sink must
 * carry a `// html-sink: <sanitizer>` comment right above it, and every
 * allowlisted file must still contain a sink (no stale entries). */
const ROOT = fileURLToPath(new URL("../../", import.meta.url));
/** Application code; components/ui (vendored shadcn) and the styleguide examples are excluded. */
const SCOPES = [
  "app",
  "components/site",
  "components/layout",
  "components/seo",
  "components/routes",
];
const SINK = "dangerouslySetInnerHTML";
const JUSTIFICATION = /\/\/\s*html-sink:\s*(kses|encoder|static)\b/;

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(name)) out.push(p);
  }
  return out;
}

interface Sink {
  file: string;
  line: number;
  justified: boolean;
}

function findSinks(): Sink[] {
  const sinks: Sink[] = [];
  for (const scope of SCOPES) {
    for (const file of walk(join(ROOT, scope))) {
      const lines = readFileSync(file, "utf8").split("\n");
      lines.forEach((text, i) => {
        if (!text.includes(SINK)) return;
        // The justification sits on the sink line or one of the two lines above it.
        const window = lines.slice(Math.max(0, i - 2), i + 1).join("\n");
        sinks.push({
          file: relative(ROOT, file),
          line: i + 1,
          justified: JUSTIFICATION.test(window),
        });
      });
    }
  }
  return sinks;
}

describe("dangerouslySetInnerHTML sinks", () => {
  const sinks = findSinks();
  const counts = new Map<string, number>();
  for (const s of sinks) counts.set(s.file, (counts.get(s.file) ?? 0) + 1);

  it("exist only in allowlisted files, with the allowlisted count per file", () => {
    expect(Object.fromEntries([...counts].sort())).toEqual(allowlist.files);
  });

  it("each carry a `// html-sink: kses|encoder|static` justification", () => {
    const unjustified = sinks.filter((s) => !s.justified).map((s) => `${s.file}:${s.line}`);
    expect(unjustified).toEqual([]);
  });

  it("total matches the documented count (update the allowlist deliberately when a sink is added or removed)", () => {
    const expected = Object.values(allowlist.files).reduce((a, b) => a + b, 0);
    expect(sinks.length).toBe(expected);
    expect(expected).toBe(8);
  });
});
