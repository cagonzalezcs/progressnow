import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import AxeBuilder from "@axe-core/playwright";
import type { Page, TestInfo } from "@playwright/test";
import type { Result } from "axe-core";

/* axe-core gate against the production build (openspec next-accessibility
 * § axe-core gate). Rules tagged wcag2a/2aa/21aa/22aa are errors; best-practice
 * rules are warnings until the chrome and routes milestones land, then errors
 * (AXE_STRICT_BEST_PRACTICE=1, flipped in CI at that point). Every scan writes
 * a JSON report to test-results/axe/<name>.json and attaches it to the test. */
export const ERROR_TAGS = ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] as const;
export const WARNING_TAGS = ["best-practice"] as const;

export interface ScanOutcome {
  errors: Result[];
  warnings: Result[];
}

const strictBestPractice = process.env.AXE_STRICT_BEST_PRACTICE === "1";

export async function scan(page: Page, testInfo: TestInfo, name: string): Promise<ScanOutcome> {
  const results = await new AxeBuilder({ page })
    .withTags([...ERROR_TAGS, ...WARNING_TAGS])
    .analyze();

  const isError = (v: Result) => v.tags.some((t) => (ERROR_TAGS as readonly string[]).includes(t));
  const errors = results.violations.filter((v) => isError(v) || strictBestPractice);
  const warnings = results.violations.filter((v) => !isError(v) && !strictBestPractice);

  // Playwright compiles specs to CommonJS, so resolve from __dirname (next-js/test/e2e/a11y).
  const dir = resolve(__dirname, "../../../test-results/axe");
  mkdirSync(dir, { recursive: true });
  const file = `${dir}/${name.replace(/[^a-z0-9._-]+/gi, "_")}.json`;
  writeFileSync(
    file,
    JSON.stringify(
      {
        name,
        url: results.url,
        axeVersion: results.testEngine.version,
        timestamp: results.timestamp,
        errors: errors.map(summarize),
        warnings: warnings.map(summarize),
        passes: results.passes.length,
        incomplete: results.incomplete.map(summarize),
      },
      null,
      2,
    ),
  );
  await testInfo.attach(`axe:${name}`, { path: file, contentType: "application/json" });
  for (const w of warnings) {
    testInfo.annotations.push({
      type: "axe-best-practice",
      description: `${w.id}: ${w.help} (${w.nodes.length} node(s))`,
    });
  }
  return { errors, warnings };
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
