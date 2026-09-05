import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

/* Shell/app parity guard (openspec progress-now-v4-foundation-chrome, design D8).
 * The theme's `src/` is the source of truth for the shared site components,
 * the a11y composable, the zod contracts and the Tailwind stylesheet; `nuxt-js/app`
 * carries byte-for-byte copies so the PHP first paint and the Nuxt rendition
 * draw the same pixels. Edit the theme copy, then re-copy — this test fails on
 * any drift. The stylesheet is compared after normalizing the only intended
 * differences: font/asset URLs (relative in the theme, absolute in the app) and
 * the app-only `@source` block that scans the theme's Twig/PHP class literals. */

const THEME = resolve(import.meta.dirname, "../../../wp-content/themes/progressnow/src");
const APP = resolve(import.meta.dirname, "../../app");

const PAIRS: { theme: string; app: string }[] = [
  { theme: "components/site", app: "components/site" },
  { theme: "composables/useA11ySettings.ts", app: "composables/useA11ySettings.ts" },
  { theme: "lib/schemas.ts", app: "lib/schemas.ts" },
  { theme: "css/tailwind.css", app: "assets/css/tailwind.css" },
];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

/** Files under a pair entry, as paths relative to that entry (a single file → [""]). */
function entries(root: string): string[] {
  return statSync(root).isDirectory()
    ? walk(root).map((f) => relative(root, f)).sort()
    : [""];
}

function normalizeCss(css: string): string {
  return (
    css
      // theme: url("../../static/…")  ↔  app: url("/wp-content/themes/progressnow/static/…")
      .replace(/url\("\.\.\/\.\.\/static\//g, 'url("/static/')
      .replace(/url\("\/wp-content\/themes\/progressnow\/static\//g, 'url("/static/')
      // app-only: the @source block (a leading comment + the two @source lines)
      .replace(/\/\* The PHP shell[\s\S]*?@source "[^"]*\/inc";\n\n/, "")
  );
}

describe("theme src ↔ nuxt-js/app shared source drift", () => {
  for (const pair of PAIRS) {
    const themeRoot = join(THEME, pair.theme);
    const appRoot = join(APP, pair.app);

    it(`${pair.theme} has the same file set as app/${pair.app}`, () => {
      expect(entries(appRoot)).toEqual(entries(themeRoot));
    });

    it(`${pair.theme} matches app/${pair.app} byte for byte`, () => {
      for (const rel of entries(themeRoot)) {
        const a = readFileSync(join(themeRoot, rel), "utf8");
        const b = readFileSync(join(appRoot, rel), "utf8");
        const isCss = rel.endsWith(".css") || pair.theme.endsWith(".css");
        expect(isCss ? normalizeCss(b) : b, `${pair.app}/${rel} drifted from the theme copy`).toBe(
          isCss ? normalizeCss(a) : a,
        );
      }
    });
  }
});
