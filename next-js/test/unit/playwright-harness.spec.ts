import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PlaywrightTestConfig } from "@playwright/test";
import pkg from "@/package.json";

/* Playwright harness contract (openspec next-test-harness § Serial project
 * isolation). The config reads process.env at import, so
 * each case loads a fresh module. */
const ENV_KEYS = ["CI"] as const;
const saved: Record<string, string | undefined> = {};

async function load(
  env: Partial<Record<(typeof ENV_KEYS)[number], string>>,
): Promise<PlaywrightTestConfig> {
  for (const k of ENV_KEYS) delete process.env[k];
  Object.assign(process.env, env);
  vi.resetModules();
  return (await import("@/playwright.config")).default;
}

beforeEach(() => {
  for (const k of ENV_KEYS) saved[k] = process.env[k];
});
afterEach(() => {
  for (const k of ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

describe("failure project isolation", () => {
  const args = pkg.scripts["test:failure"].split(/\s+/);

  it("test:failure runs only its own project, serially, without re-running its dependencies", () => {
    expect(args).toContain("--project=failure");
    expect(args).toContain("--workers=1");
    // Playwright runs a project's `dependencies` even under --project; CI must not
    // re-run e2e + a11y on one worker before the four failure tests.
    expect(args).toContain("--no-deps");
  });

  it("the config keeps the dependency so an unfiltered run still orders e2e/a11y first", async () => {
    const config = await load({});
    const failure = config.projects?.find((p) => p.name === "failure");
    expect(failure?.dependencies).toEqual(["e2e", "a11y"]);
  });
});
