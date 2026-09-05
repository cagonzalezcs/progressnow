import { defineConfig, devices } from "@playwright/test";

/* Two projects (openspec next-test-harness): `e2e` (functional, both
 * languages) and `a11y` (axe-core over the route × language × mode × state
 * matrix). Both run against the PRODUCTION build served by `next start`, with
 * WP_API_BASE pointed at the fixture-backed mock server — no WordPress.
 *
 *   PW_SKIP_BUILD=1   reuse an existing `.next` build (developer loop)
 *   CI=1              no server reuse, retries, GitHub reporter */
const CI = Boolean(process.env.CI);
const MOCK_PORT = Number(process.env.MOCK_PORT ?? 8787);
const APP_PORT = Number(process.env.PW_APP_PORT ?? 3100);
const MOCK_ORIGIN = `http://127.0.0.1:${MOCK_PORT}`;
const APP_ORIGIN = `http://127.0.0.1:${APP_PORT}`;

const appEnv = {
  MOCK_API: "1",
  WP_API_BASE: `${MOCK_ORIGIN}/wp-json/progressnow/v1`,
  NEXT_PUBLIC_SITE_ORIGIN: APP_ORIGIN,
  CHAPTER_REBUILD_SECRET: "playwright-test-secret",
  WP_BUILD_STATUS_URL: `${MOCK_ORIGIN}/wp-json/progressnow/v1/build-status`,
  NEXT_TELEMETRY_DISABLED: "1",
};

export default defineConfig({
  testDir: "test/e2e",
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: CI
    ? [["github"], ["html", { open: "never" }], ["list"]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: APP_ORIGIN,
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
  },
  projects: [
    { name: "e2e", testMatch: /.*\.spec\.ts$/, testIgnore: /a11y\// },
    { name: "a11y", testMatch: /a11y\/.*\.spec\.ts$/ },
  ],
  webServer: [
    {
      command: "node test/mock/server.mjs",
      url: `${MOCK_ORIGIN}/__mock/health`,
      reuseExistingServer: !CI,
      env: { MOCK_PORT: String(MOCK_PORT), MOCK_ORIGIN },
      stdout: "ignore",
      stderr: "pipe",
    },
    {
      // The deployed artifact, not `next start` (which does not pair with output: "standalone").
      command:
        process.env.PW_SKIP_BUILD === "1"
          ? "node scripts/start-standalone.mjs"
          : "npm run build && node scripts/start-standalone.mjs",
      url: `${APP_ORIGIN}/`,
      reuseExistingServer: !CI,
      timeout: 300_000,
      env: { ...appEnv, PORT: String(APP_PORT), HOSTNAME: "127.0.0.1" },
      stdout: "ignore",
      stderr: "pipe",
    },
  ],
});
