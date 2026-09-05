import { execSync } from "node:child_process";
import type { NextConfig } from "next";

/* Headless Next.js frontend for the Progress Now theme (openspec design
 * next-js-site-implementation D1, D4, D11).
 *
 * Environment (see .env.example):
 *   WP_API_BASE            absolute …/wp-json/progressnow/v1 (server-only)
 *   WP_ORIGIN              WordPress origin; derived from WP_API_BASE when unset
 *   NEXT_PUBLIC_SITE_ORIGIN public origin of this app (sitemap, robots, OG)
 *   IMAGE_HOSTS            comma-separated hosts allowed for next/image
 *   MOCK_API=1             fixture-backed mock API (dev / e2e)
 *
 * Runtime validation of the full env contract lives in lib/env.ts; this file
 * only needs the origin to wire the static-asset proxy and image hosts. */

const apiBase =
  process.env.WP_API_BASE ??
  (process.env.MOCK_API === "1" ? "http://127.0.0.1:8787/wp-json/progressnow/v1" : "");
const wpOrigin = process.env.WP_ORIGIN ?? (apiBase ? new URL(apiBase).origin : "");

/** Hosts next/image may optimize from: IMAGE_HOSTS, else the WordPress host. */
const imageHosts = (process.env.IMAGE_HOSTS ?? (wpOrigin ? new URL(wpOrigin).hostname : ""))
  .split(",")
  .map((h) => h.trim())
  .filter(Boolean);

/** Build identity for /api/health, logs and the cache key: CI passes
 * NEXT_PUBLIC_BUILD_ID; locally the git sha; otherwise a timestamp. */
function resolveBuildId(): string {
  if (process.env.NEXT_PUBLIC_BUILD_ID) return process.env.NEXT_PUBLIC_BUILD_ID;
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return `local-${Date.now().toString(36)}`;
  }
}
const buildId = resolveBuildId();

/** The theme's static root (fonts, brand placeholders). Served same-origin
 * through a rewrite so `@font-face` never crosses origins (design D4). */
export const THEME_STATIC = "/wp-content/themes/progressnow/static";

const nextConfig: NextConfig = {
  // Portable deployment: Vercel, a container, or a VPS (design D11).
  output: "standalone",
  poweredByHeader: false,
  generateBuildId: () => buildId,
  env: { NEXT_PUBLIC_BUILD_ID: buildId },
  // WordPress permalinks end with a slash; canonical paths must match byte for byte (design D3).
  trailingSlash: true,
  // Cache Components: `'use cache'` + cacheTag/cacheLife, PPR for searchParams fragments (design D1).
  cacheComponents: true,
  cacheLife: {
    /** Route envelopes: served from cache until the rebuild webhook revalidates. */
    content: { stale: 300, revalidate: 86400, expire: 31536000 },
    /** Per-query search results: short-lived, never prerendered. */
    search: { stale: 30, revalidate: 60, expire: 300 },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: false,
    remotePatterns: imageHosts.flatMap((hostname) => [
      { protocol: "https" as const, hostname },
      { protocol: "http" as const, hostname },
    ]),
  },
  async rewrites() {
    if (!wpOrigin) return [];
    return [{ source: `${THEME_STATIC}/:path*`, destination: `${wpOrigin}${THEME_STATIC}/:path*` }];
  },
  async headers() {
    return [
      {
        source: `${THEME_STATIC}/:path*`,
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
