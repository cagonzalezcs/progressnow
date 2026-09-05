import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/* Shared-source guard (openspec next-design-system § Shared stylesheet /
 * Shared contracts). The theme's `src/` is the source of truth for the zod
 * contracts, the Tailwind v4 token sheet and the category registry; `next-js`
 * carries byte-for-byte copies so every frontend draws from the same tokens
 * and validates the same shapes. Edit the theme copy, then re-copy — this test
 * fails on any drift. The stylesheet is compared after normalizing the only
 * intended difference: font/asset URLs are relative in the theme
 * (`../../static/…`) and absolute here (served same-origin through the
 * `/wp-content/themes/progressnow/static/*` rewrite proxy). */

const THEME = resolve(import.meta.dirname, "../../../wp-content/themes/progressnow");
const APP = resolve(import.meta.dirname, "../..");

const PAIRS: { theme: string; app: string; normalize?: (s: string) => string }[] = [
  { theme: "src/lib/schemas.ts", app: "lib/schemas.ts" },
  { theme: "categories.json", app: "categories.json" },
  { theme: "src/css/tailwind.css", app: "app/globals.css", normalize: normalizeCss },
];

function normalizeCss(css: string): string {
  return css
    .replace(/url\("\.\.\/\.\.\/static\//g, 'url("/static/')
    .replace(/url\("\/wp-content\/themes\/progressnow\/static\//g, 'url("/static/');
}

function firstDifferingLine(a: string, b: string): number {
  const la = a.split("\n");
  const lb = b.split("\n");
  for (let i = 0; i < Math.max(la.length, lb.length); i++) {
    if (la[i] !== lb[i]) return i + 1;
  }
  return -1;
}

describe("theme src ↔ next-js shared source drift", () => {
  for (const pair of PAIRS) {
    it(`${pair.theme} matches ${pair.app} byte for byte`, () => {
      const normalize = pair.normalize ?? ((s: string) => s);
      const themeText = normalize(readFileSync(resolve(THEME, pair.theme), "utf8"));
      const appText = normalize(readFileSync(resolve(APP, pair.app), "utf8"));
      const line = firstDifferingLine(themeText, appText);
      expect(line, `${pair.app} differs from the theme's ${pair.theme} at line ${line}`).toBe(-1);
    });
  }

  it("the app stylesheet serves theme assets through the same-origin proxy path", () => {
    const css = readFileSync(resolve(APP, "app/globals.css"), "utf8");
    expect(css).not.toMatch(/url\("\.\.\//);
    expect(css).toMatch(/url\("\/wp-content\/themes\/progressnow\/static\/fonts\//);
  });
});
