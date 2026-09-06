import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import AxeBuilder from "@axe-core/playwright";
import type { Page, TestInfo } from "@playwright/test";
import type { Result } from "axe-core";

/* axe-core gate against the production build (openspec next-accessibility
 * § axe-core gate). Rules tagged wcag2a/2aa/21aa/22aa are errors; best-practice
 * rules are warnings until the chrome and routes milestones land, then errors
 * (AXE_STRICT_BEST_PRACTICE=1). The vendored shadcn registry examples inside
 * `[data-kitchen-sink]` are scanned in a second pass and tracked as a
 * ratcheting node-count baseline (kitchen-sink-baseline.json) so upstream demo
 * debt is visible without masking regressions in our own code. Every scan
 * writes test-results/axe/<name>.json and attaches it to the test. */
export const ERROR_TAGS = ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] as const;
export const WARNING_TAGS = ["best-practice"] as const;
export const KITCHEN_SINK = "[data-kitchen-sink]";

export interface ScanOutcome {
  errors: Result[];
  warnings: Result[];
  /** Violations inside the vendored kitchen sink (styleguide only). */
  kitchenSink: Result[];
  /** Offending nodes in the kitchen sink — the ratchet. */
  kitchenSinkNodes: number;
}

/* Best-practice rules are errors since the routes milestone (task 6.9);
 * AXE_STRICT_BEST_PRACTICE=0 demotes them to warnings for local triage. */
const strictBestPractice = process.env.AXE_STRICT_BEST_PRACTICE !== "0";
const isError = (v: Result) => v.tags.some((t) => (ERROR_TAGS as readonly string[]).includes(t));

export async function scan(page: Page, testInfo: TestInfo, name: string): Promise<ScanOutcome> {
  const tags = [...ERROR_TAGS, ...WARNING_TAGS];
  const hasSink = (await page.locator(KITCHEN_SINK).count()) > 0;

  const own = await new AxeBuilder({ page }).withTags(tags).exclude(KITCHEN_SINK).analyze();
  const sink = hasSink
    ? await new AxeBuilder({ page }).withTags(tags).include(KITCHEN_SINK).analyze()
    : null;

  const errors = own.violations.filter((v) => isError(v) || strictBestPractice);
  const warnings = own.violations.filter((v) => !isError(v) && !strictBestPractice);
  const kitchenSink = (sink?.violations ?? []).filter((v) => isError(v));
  const kitchenSinkNodes = kitchenSink.reduce((n, v) => n + v.nodes.length, 0);

  const dir = resolve(__dirname, "../../../test-results/axe");
  mkdirSync(dir, { recursive: true });
  const file = resolve(dir, `${name.replace(/[^a-z0-9._-]+/gi, "_")}.json`);
  writeFileSync(
    file,
    JSON.stringify(
      {
        name,
        url: own.url,
        axeVersion: own.testEngine.version,
        timestamp: own.timestamp,
        errors: errors.map(summarize),
        warnings: warnings.map(summarize),
        kitchenSinkNodes,
        kitchenSink: kitchenSink.map(summarize),
        passes: own.passes.length,
        incomplete: own.incomplete.map(summarize),
      },
      null,
      2,
    ),
  );
  await testInfo.attach(`axe:${name}`, { path: file, contentType: "application/json" });
  for (const w of warnings)
    testInfo.annotations.push({
      type: "axe-best-practice",
      description: `${w.id}: ${w.help} (${w.nodes.length} node(s))`,
    });
  if (kitchenSinkNodes > 0)
    testInfo.annotations.push({
      type: "axe-kitchen-sink",
      description: `${kitchenSinkNodes} node(s) in ${kitchenSink.length} rule(s) — vendored shadcn examples`,
    });
  return { errors, warnings, kitchenSink, kitchenSinkNodes };
}

function summarize(v: Result) {
  return {
    id: v.id,
    impact: v.impact,
    help: v.help,
    helpUrl: v.helpUrl,
    tags: v.tags,
    nodes: v.nodes.map((n) => ({
      target: n.target,
      html: n.html,
      failureSummary: n.failureSummary,
    })),
  };
}

export function formatViolations(violations: Result[]): string {
  if (violations.length === 0) return "no axe violations";
  return violations
    .map(
      (v) =>
        `${v.id} [${v.impact}] ${v.help}\n` +
        v.nodes
          .map(
            (n) =>
              `    ${n.target.join(" ")}\n      ${n.failureSummary?.split("\n").join("\n      ")}`,
          )
          .join("\n"),
    )
    .join("\n");
}
