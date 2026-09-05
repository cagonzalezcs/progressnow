import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import categories from "../categories.json";

/* Tailwind v4 @theme can't import JSON, so the --color-cat-* tokens in
 * src/css/tailwind.css are hand-maintained. This test is the drift guard:
 * every token must equal the canonical color in categories.json (the single
 * source of truth shared with PHP via inc/categories.php). */

const CANONICAL_SLUGS = [
  "chapter",
  "poled",
  "mutual",
  "labor",
  "electoral",
  "social",
];

function tailwindCatTokens(): Record<string, string> {
  const css = readFileSync(
    resolve(import.meta.dirname, "../src/css/tailwind.css"),
    "utf8",
  );
  const tokens: Record<string, string> = {};
  for (const match of css.matchAll(
    /--color-cat-([a-z]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g,
  )) {
    tokens[match[1]] = match[2].toLowerCase();
  }
  return tokens;
}

describe("categories.json ↔ tailwind --color-cat-* drift", () => {
  it("defines exactly the six canonical slugs", () => {
    expect(categories.map((c) => c.id)).toEqual(CANONICAL_SLUGS);
  });

  it("has a --color-cat-* token per canonical slug and no strays", () => {
    expect(Object.keys(tailwindCatTokens()).sort()).toEqual(
      [...CANONICAL_SLUGS].sort(),
    );
  });

  it.each(CANONICAL_SLUGS)("--color-cat-%s equals the JSON color", (slug) => {
    const tokens = tailwindCatTokens();
    const entry = categories.find((c) => c.id === slug);
    expect(entry).toBeDefined();
    expect(tokens[slug]).toBe(entry!.color.toLowerCase());
  });
});
