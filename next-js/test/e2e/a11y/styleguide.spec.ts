import { expect, test } from "@playwright/test";
import baseline from "./kitchen-sink-baseline.json";
import { formatViolations, scan } from "./scan";

/* axe-core over the styleguide in every a11y-widget mode (openspec
 * next-accessibility § axe-core gate): the kitchen sink is the widest surface
 * the tokens ever have to hold up under. Our code is held at zero; the vendored
 * registry examples ratchet down through kitchen-sink-baseline.json (task 4.10). */
const MODES = {
  default: {},
  "high-contrast": { highContrast: true },
  "xl-text": { textSize: "xl" },
  "reduce-motion": { reduceMotion: true },
} as const;

for (const [mode, settings] of Object.entries(MODES)) {
  test(`styleguide has no axe-core violations (${mode})`, async ({ page }, testInfo) => {
    test.setTimeout(180_000);
    await page.addInitScript(
      (value) => localStorage.setItem("chapter-a11y", value),
      JSON.stringify(settings),
    );
    await page.goto("/styleguide/");
    // Guard against scanning a 404 by mistake — the gate must scan the real surface.
    await expect(page.locator("main#main")).toHaveAttribute("data-route-kind", "styleguide");
    await page.waitForLoadState("networkidle");
    const { errors, warnings, kitchenSink, kitchenSinkNodes } = await scan(
      page,
      testInfo,
      `styleguide-${mode}`,
    );
    expect(errors, formatViolations(errors)).toEqual([]);
    expect(
      kitchenSinkNodes,
      `kitchen-sink a11y debt grew past the baseline (${baseline.maxKitchenSinkNodes}):\n${formatViolations(kitchenSink)}`,
    ).toBeLessThanOrEqual(baseline.maxKitchenSinkNodes);
    testInfo.annotations.push({ type: "axe-warnings", description: String(warnings.length) });
  });
}
