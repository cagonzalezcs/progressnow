// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { A11Y_BOOTSTRAP_SCRIPT } from "@/lib/a11y-bootstrap";
import { STORAGE_KEY, STYLE_ID } from "@/lib/a11y-settings";

/* The inline bootstrap runs before first paint (openspec next-accessibility
 * § Persisted before paint): given stored settings, the document already
 * carries them when React hydrates. Evaluated here against jsdom. */
function run(script: string) {
  // Evaluating the generated inline script under test.
  new Function("window", "document", "localStorage", script)(window, document, localStorage);
}

describe("a11y bootstrap script", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("style");
    document.documentElement.className = "";
    document.getElementById(STYLE_ID)?.remove();
  });

  it("applies stored settings synchronously", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ textSize: "xl", highContrast: true, reduceMotion: true }),
    );
    run(A11Y_BOOTSTRAP_SCRIPT);
    expect(document.documentElement.style.fontSize).toBe("20px");
    expect(document.documentElement.dataset.textSize).toBe("xl");
    expect(document.documentElement.classList.contains("a11y-contrast")).toBe(true);
    expect(document.documentElement.dataset.motion).toBe("reduce");
    expect(document.getElementById(STYLE_ID)!.textContent).toContain("animation:none");
  });

  it("migrates the legacy key and defaults cleanly", () => {
    localStorage.setItem("rgv-dsa-a11y", JSON.stringify({ textSize: "large" }));
    run(A11Y_BOOTSTRAP_SCRIPT);
    expect(document.documentElement.style.fontSize).toBe("18px");
    expect(localStorage.getItem("rgv-dsa-a11y")).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toContain("large");
  });

  it("is inert without storage or with corrupt data", () => {
    localStorage.setItem(STORAGE_KEY, "{nope");
    expect(() => run(A11Y_BOOTSTRAP_SCRIPT)).not.toThrow();
    expect(document.documentElement.style.fontSize).toBe("16px");
    expect(document.documentElement.dataset.motion).toBe("auto");
  });

  it("contains no template placeholders and is CSP-nonce friendly (no external refs)", () => {
    expect(A11Y_BOOTSTRAP_SCRIPT).not.toMatch(/\$\{|import |require\(/);
  });
});
