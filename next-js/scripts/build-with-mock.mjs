#!/usr/bin/env node
/* `npm run build:mock` — production build against the fixture-backed mock API
 * (openspec next-test-harness § CI job). `next build` prerenders every
 * manifest route via generateStaticParams, so — like `nuxt generate` — it needs
 * the API reachable. Starts test/mock/server.mjs, waits for its health check,
 * runs the build with the Playwright environment, then stops the mock. */
import { spawn, spawnSync } from "node:child_process";

const port = process.env.MOCK_PORT ?? "8787";
const origin = `http://127.0.0.1:${port}`;
const env = {
  ...process.env,
  MOCK_API: "1",
  MOCK_PORT: port,
  MOCK_ORIGIN: origin,
  WP_API_BASE: `${origin}/wp-json/progressnow/v1`,
  NEXT_PUBLIC_SITE_ORIGIN: process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "http://127.0.0.1:3100",
  CHAPTER_REBUILD_SECRET: process.env.CHAPTER_REBUILD_SECRET ?? "playwright-test-secret",
  WP_BUILD_STATUS_URL:
    process.env.WP_BUILD_STATUS_URL ?? `${origin}/wp-json/progressnow/v1/build-status`,
  NEXT_TELEMETRY_DISABLED: "1",
};

const mock = spawn(process.execPath, ["test/mock/server.mjs"], {
  stdio: ["ignore", "ignore", "inherit"],
  env,
});
const deadline = Date.now() + 15_000;
let ready = false;
while (Date.now() < deadline) {
  try {
    const res = await fetch(`${origin}/__mock/health`);
    if (res.ok) {
      ready = true;
      break;
    }
  } catch {
    /* not up yet */
  }
  await new Promise((r) => setTimeout(r, 150));
}
if (!ready) {
  mock.kill();
  console.error(`build:mock: mock API did not come up on ${origin}`);
  process.exit(2);
}

const build = spawnSync("npx", ["next", "build", ...process.argv.slice(2)], {
  stdio: "inherit",
  env,
  shell: process.platform === "win32",
});
mock.kill();
process.exit(build.status ?? 1);
