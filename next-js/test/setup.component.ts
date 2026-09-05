import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { toHaveNoViolations } from "jest-axe";
import { afterEach, expect } from "vitest";

/* Component project setup: jest-dom matchers, axe-core matcher (jest-axe,
 * pinned to the same axe-core as the Playwright gate via package overrides),
 * and DOM cleanup between tests. */
expect.extend(toHaveNoViolations);
afterEach(() => cleanup());
