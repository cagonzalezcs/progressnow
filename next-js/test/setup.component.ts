import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { toHaveNoViolations } from "jest-axe";
import { afterEach, expect } from "vitest";

/* Component project setup: jest-dom matchers, axe-core matcher (jest-axe,
 * pinned to the same axe-core as the Playwright gate via package overrides),
 * and DOM cleanup between tests. */
expect.extend(toHaveNoViolations);
afterEach(() => cleanup());

/* jsdom has no matchMedia; components read prefers-reduced-motion through it.
 * Default: no preference. Tests can override `window.matchMedia` per case. */
if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string): MediaQueryList =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList,
  });
}
