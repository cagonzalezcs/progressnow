// @vitest-environment happy-dom
import { computed } from "vue";
import { describe, expect, it, beforeEach } from "vitest";
import { readLanguagesFromDoc } from "@/ts/navigation";
import { languageState, setLanguages } from "@/lib/languages";
import type { LanguageLink } from "@/components/site/LanguageToggle.vue";

/* Regression cover for the header language switcher pointing at a stale page
 * after client-side (SPA) navigation. SiteHeader stays mounted across #main
 * swaps, so its mount-time `languages` prop froze at the entry page's URLs;
 * ts/navigation.ts now re-reads them from the fetched document's header island
 * on every commit and pushes them into lib/languages, which SiteHeader consumes
 * via a computed that falls back to the SSR prop. This exercises both seams
 * without the flaky full-header UI deps. */

/** A minimal page matching views/base.twig's baked SiteHeader island. */
function pageWithLanguages(langs: LanguageLink[]): Document {
  const props = JSON.stringify({ languages: langs, currentPath: "/x/" });
  const attr = props.replace(/&/g, "&amp;").replace(/'/g, "&#39;");
  const html = `<!doctype html><html><body>
    <div data-vue-island="SiteHeader" data-props='${attr}'></div>
    <main id="main"></main>
  </body></html>`;
  return new DOMParser().parseFromString(html, "text/html");
}

const HOME: LanguageLink[] = [
  { code: "en", label: "EN", name: "English", active: true, url: "https://x.test/" },
  { code: "es", label: "ES", name: "Español", active: false, url: "https://x.test/es/inicio/" },
];
const ABOUT: LanguageLink[] = [
  { code: "en", label: "EN", name: "English", active: true, url: "https://x.test/about/" },
  { code: "es", label: "ES", name: "Español", active: false, url: "https://x.test/es/about/" },
];

describe("readLanguagesFromDoc", () => {
  it("extracts the current page's switcher URLs from the fetched header island", () => {
    const langs = readLanguagesFromDoc(pageWithLanguages(ABOUT));
    expect(langs?.find((l) => l.code === "es")?.url).toBe("https://x.test/es/about/");
  });

  it("returns null when the island or its props are missing/unparseable", () => {
    const noIsland = new DOMParser().parseFromString("<main id=main></main>", "text/html");
    expect(readLanguagesFromDoc(noIsland)).toBeNull();

    const bad = new DOMParser().parseFromString(
      `<div data-vue-island="SiteHeader" data-props='{oops'></div>`,
      "text/html",
    );
    expect(readLanguagesFromDoc(bad)).toBeNull();
  });
});

describe("switcher stays in sync across client navigation", () => {
  beforeEach(() => setLanguages([]));

  it("SiteHeader's computed follows the store after a navigation commit", () => {
    const prop = HOME; // the SSR mount-time prop (never changes)
    // Mirrors SiteHeader.vue: seed from prop, then prefer the reactive store.
    if (!languageState.list.length) setLanguages(prop);
    const currentLanguages = computed(() =>
      languageState.list.length ? languageState.list : prop,
    );

    // On the entry page the switcher points at the home translation.
    expect(currentLanguages.value.find((l) => l.code === "es")?.url).toBe(
      "https://x.test/es/inicio/",
    );

    // A client navigation to /about/ commits: navigation.ts reads the fetched
    // page's languages and updates the store.
    const fresh = readLanguagesFromDoc(pageWithLanguages(ABOUT));
    expect(fresh).not.toBeNull();
    setLanguages(fresh!);

    // The switcher now points at the *current* page's translation, not the
    // frozen entry-page one — the bug is fixed.
    expect(currentLanguages.value.find((l) => l.code === "es")?.url).toBe(
      "https://x.test/es/about/",
    );
  });
});
