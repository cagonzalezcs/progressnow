import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NextConfig } from "next";

/* next.config.ts policy (openspec next-deployment § Image optimization policy,
 * § Security headers and CSP, § Standalone build). The config reads process.env
 * at import, so each case loads a fresh module. */
const ENV_KEYS = ["WP_API_BASE", "WP_ORIGIN", "IMAGE_HOSTS", "MOCK_API", "VERCEL"] as const;
const saved: Record<string, string | undefined> = {};

async function load(env: Partial<Record<(typeof ENV_KEYS)[number], string>>): Promise<NextConfig> {
  for (const k of ENV_KEYS) delete process.env[k];
  Object.assign(process.env, env);
  vi.resetModules();
  return (await import("@/next.config")).default;
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

describe("images", () => {
  const patterns = (c: NextConfig) =>
    c.images?.remotePatterns?.map(
      (p) => `${p.protocol}://${p.hostname}${"port" in p && p.port ? `:${p.port}` : ""}`,
    );

  it("serves AVIF/WebP, keeps SVG out of the optimizer, and allows only the WordPress host — https only — by default", async () => {
    const c = await load({ WP_API_BASE: "https://cms.example.org/wp-json/progressnow/v1" });
    expect(c.images?.formats).toEqual(["image/avif", "image/webp"]);
    expect(c.images?.dangerouslyAllowSVG).toBe(false);
    expect(c.images?.dangerouslyAllowLocalIP).toBe(false);
    expect(patterns(c)).toEqual(["https://cms.example.org"]);
  });

  it("lets the optimizer reach the loopback mock, over http, only under MOCK_API=1", async () => {
    const c = await load({ MOCK_API: "1" });
    expect(c.images?.dangerouslyAllowLocalIP).toBe(true);
    expect(patterns(c)).toEqual(["http://127.0.0.1:8787"]);
  });

  /* openspec next-edge-trust-boundaries § Image optimization uses HTTPS
   * upstreams in production: a bare IMAGE_HOSTS entry never allows http. */
  it("IMAGE_HOSTS replaces the default allowlist; bare entries are https-only", async () => {
    const c = await load({
      WP_API_BASE: "https://cms.example.org/wp-json/progressnow/v1",
      IMAGE_HOSTS: "uploads.example.org, cdn.example.org",
    });
    expect(patterns(c)).toEqual(["https://uploads.example.org", "https://cdn.example.org"]);
  });

  it("a scheme-qualified IMAGE_HOSTS entry is honored as written, port included", async () => {
    const c = await load({
      WP_API_BASE: "https://cms.example.org/wp-json/progressnow/v1",
      IMAGE_HOSTS: "http://cms.local:8890, https://cdn.example.org, cdn.example.org",
    });
    expect(patterns(c)).toEqual(["http://cms.local:8890", "https://cdn.example.org"]);
  });
});

describe("deployment", () => {
  it("builds standalone (except on Vercel), hides X-Powered-By, keeps WordPress' trailing slash", async () => {
    const c = await load({ WP_API_BASE: "https://cms.example.org/wp-json/progressnow/v1" });
    expect(c.output).toBe("standalone");
    expect(c.poweredByHeader).toBe(false);
    expect(c.trailingSlash).toBe(true);
    const vercel = await load({
      WP_API_BASE: "https://cms.example.org/wp-json/progressnow/v1",
      VERCEL: "1",
    });
    expect(vercel.output).toBeUndefined();
  });

  it("proxies the theme's static root same-origin with immutable caching and static security headers everywhere", async () => {
    const c = await load({ WP_API_BASE: "https://cms.example.org/wp-json/progressnow/v1" });
    const rewrites = await c.rewrites!();
    expect(rewrites).toEqual([
      {
        source: "/wp-content/themes/progressnow/static/:path*",
        destination: "https://cms.example.org/wp-content/themes/progressnow/static/:path*",
      },
    ]);
    const headers = await c.headers!();
    const all = headers.find((h) => h.source === "/:path*")!;
    expect(all.headers.map((h) => h.key)).toEqual([
      "Strict-Transport-Security",
      "X-Content-Type-Options",
      "Referrer-Policy",
      "Permissions-Policy",
    ]);
    const fonts = headers.find((h) => h.source === "/wp-content/themes/progressnow/static/:path*")!;
    expect(fonts.headers).toEqual([
      { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
    ]);
  });
});
