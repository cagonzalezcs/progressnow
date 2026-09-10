#!/usr/bin/env node
/* Vercel build command (vercel.json). Picks the generate target from the
 * environment and fails closed (openspec security-cicd-supply-chain-hardening
 * § CI covers every branch and builds fail closed):
 *   NUXT_PUBLIC_WP_API_BASE set        → `nuxt generate` against that API
 *   unset, VERCEL_ENV=production       → exit 1 before building anything: a
 *                                        production deploy must never ship the
 *                                        fixture mock as if it were the site
 *   unset, preview / development / off Vercel → `generate:mock` (demo content)
 * Exit status is the generate's own, so a failed build never deploys. */
import { spawnSync } from "node:child_process";

const apiBase = process.env.NUXT_PUBLIC_WP_API_BASE?.trim();
const vercelEnv = process.env.VERCEL_ENV ?? "";

if (!apiBase && vercelEnv === "production") {
  console.error(
    "vercel-build: NUXT_PUBLIC_WP_API_BASE is not set for a production build.\n" +
      "A production deployment must read a real WordPress API; the fixture mock is\n" +
      "only for previews. Set the variable in Vercel → Settings → Environment\n" +
      "Variables (Production) or build a preview instead.",
  );
  process.exit(1);
}

const script = apiBase ? "generate" : "generate:mock";
console.log(
  `vercel-build: ${apiBase ? `generate against ${apiBase}` : "generate:mock (no NUXT_PUBLIC_WP_API_BASE)"}` +
    (vercelEnv ? ` [VERCEL_ENV=${vercelEnv}]` : ""),
);
const result = spawnSync("npm", ["run", script], { stdio: "inherit", env: process.env });
if (result.error) {
  console.error(`vercel-build: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
