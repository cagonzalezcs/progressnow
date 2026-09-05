// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  applySettings,
  createA11yStore,
  DEFAULTS,
  FONT_SIZES,
  LEGACY_STORAGE_KEY,
  loadSettings,
  STORAGE_KEY,
  STYLE_ID,
} from "@/lib/a11y-settings";

/* Parity with the theme's useA11ySettings.ts (openspec next-accessibility
 * § Accessibility settings widget parity): same storage key and JSON shape,
 * one-time legacy migration, 16/18/20 px, html[data-text-size],
 * html.a11y-contrast + the injected tone/motion style block. */
describe("a11y settings store", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("style");
    document.documentElement.removeAttribute("data-text-size");
    document.documentElement.classList.remove("a11y-contrast");
    document.getElementById(STYLE_ID)?.remove();
  });
  afterEach(() => localStorage.clear());

  it("exposes the theme's constants", () => {
    expect(STORAGE_KEY).toBe("chapter-a11y");
    expect(LEGACY_STORAGE_KEY).toBe("rgv-dsa-a11y");
    expect(FONT_SIZES).toEqual({ default: "16px", large: "18px", xl: "20px" });
    expect(DEFAULTS).toEqual({ textSize: "default", highContrast: false, reduceMotion: false });
  });

  it("loads defaults, merges stored values, and survives corrupt storage", () => {
    expect(loadSettings(localStorage)).toEqual(DEFAULTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ textSize: "xl" }));
    expect(loadSettings(localStorage)).toEqual({ ...DEFAULTS, textSize: "xl" });
    localStorage.setItem(STORAGE_KEY, "{nope");
    expect(loadSettings(localStorage)).toEqual(DEFAULTS);
  });

  it("migrates the legacy key once", () => {
    localStorage.setItem(
      LEGACY_STORAGE_KEY,
      JSON.stringify({ highContrast: true, textSize: "large" }),
    );
    expect(loadSettings(localStorage)).toEqual({
      textSize: "large",
      highContrast: true,
      reduceMotion: false,
    });
    expect(localStorage.getItem(LEGACY_STORAGE_KEY)).toBeNull();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({
      highContrast: true,
      textSize: "large",
    });
  });

  it("applies text size, contrast class and the injected style block like the theme", () => {
    applySettings(
      { textSize: "xl", highContrast: true, reduceMotion: false },
      { prefersReducedMotion: false },
    );
    const html = document.documentElement;
    expect(html.style.fontSize).toBe("20px");
    expect(html.dataset.textSize).toBe("xl");
    expect(html.classList.contains("a11y-contrast")).toBe(true);
    const css = document.getElementById(STYLE_ID)!.textContent!;
    expect(css).toContain(
      '[data-tone="white"],[data-tone="alt"]{background:#FFFFFF !important; color:#000000 !important}',
    );
    expect(css).toContain('[data-tone="blue"]{background:#0F2E9C !important}');
    expect(css).not.toContain("animation:none");

    applySettings(
      { textSize: "default", highContrast: false, reduceMotion: true },
      { prefersReducedMotion: false },
    );
    expect(html.style.fontSize).toBe("16px");
    expect(html.classList.contains("a11y-contrast")).toBe(false);
    expect(document.getElementById(STYLE_ID)!.textContent).toContain(
      "*{animation:none !important; transition:none !important}",
    );
  });

  it("honors prefers-reduced-motion even when the setting is off", () => {
    applySettings(DEFAULTS, { prefersReducedMotion: true });
    expect(document.getElementById(STYLE_ID)!.textContent).toContain("animation:none");
    expect(html().dataset.motion).toBe("reduce");
    applySettings(DEFAULTS, { prefersReducedMotion: false });
    expect(html().dataset.motion).toBe("auto");
  });

  it("store: subscribe, mutate, persist", () => {
    const store = createA11yStore({ storage: localStorage, prefersReducedMotion: () => false });
    const seen: string[] = [];
    const unsubscribe = store.subscribe(() => seen.push(JSON.stringify(store.getSnapshot())));
    store.setTextSize("large");
    store.toggleHighContrast();
    store.toggleReduceMotion();
    expect(store.getSnapshot()).toEqual({
      textSize: "large",
      highContrast: true,
      reduceMotion: true,
    });
    expect(seen).toHaveLength(3);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({
      textSize: "large",
      highContrast: true,
      reduceMotion: true,
    });
    expect(document.documentElement.style.fontSize).toBe("18px");
    unsubscribe();
    store.setTextSize("xl");
    expect(seen).toHaveLength(3);
  });
});

function html() {
  return document.documentElement;
}
