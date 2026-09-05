import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { gzipSync } from "node:zlib";
import { expect, test } from "@playwright/test";
import { firstLoadScripts, report, staticFileFor } from "../../scripts/bundle-budget.mjs";

/* Front-page first-load JS budget (openspec next-design-system § Client bundle
 * budget). Routes render per request, so the shell HTML is fetched from the
 * running production server and its scripts gzipped from .next/static. */
const budget = JSON.parse(readFileSync(resolve(__dirname, "../../budget.json"), "utf8")) as {
  route: string;
  firstLoadJsGzipBytes: number;
};

test("front page first-load JS stays within budget.json", async ({ request }, testInfo) => {
  const html = await (await request.get(budget.route)).text();
  const root = resolve(__dirname, "../..");
  const rows = firstLoadScripts(html).map((url: string) => {
    const file = resolve(root, staticFileFor(url));
    expect(existsSync(file), `${url} referenced but ${file} missing`).toBe(true);
    return {
      file: staticFileFor(url),
      gzipBytes: gzipSync(readFileSync(file), { level: 9 }).length,
    };
  });
  const result = report(rows, budget.firstLoadJsGzipBytes);
  testInfo.annotations.push({
    type: "bundle-budget",
    description: `${result.total} of ${budget.firstLoadJsGzipBytes} gzipped bytes`,
  });
  console.log(`bundle budget for ${budget.route}:\n${result.text}`);
  expect(result.ok, result.text).toBe(true);
});
