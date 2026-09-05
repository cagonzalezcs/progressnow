import { describe, expect, it } from "vitest";
import { shouldReduceMotion, supportsViewTransitions } from "@/lib/motion";

/* openspec next-accessibility § Motion preferences; next-headless-site § Client
 * navigation: reduced when the setting OR the media query says so; instant swap
 * when the browser lacks the View Transitions API. */
describe("motion gate", () => {
  it("reduces when either the setting or the media query asks for it", () => {
    expect(shouldReduceMotion({ reduceMotion: false }, false)).toBe(false);
    expect(shouldReduceMotion({ reduceMotion: true }, false)).toBe(true);
    expect(shouldReduceMotion({ reduceMotion: false }, true)).toBe(true);
  });

  it("detects the View Transitions API", () => {
    expect(supportsViewTransitions({} as Document)).toBe(false);
    expect(supportsViewTransitions({ startViewTransition() {} } as unknown as Document)).toBe(true);
  });
});
