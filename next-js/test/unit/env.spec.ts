import { describe, expect, it } from "vitest";
import { EnvError, imageRemotePatterns, readEnv } from "@/lib/env";

/* Fail-fast environment contract (openspec next-deployment § Environment
 * contract and startup validation). `readEnv` is pure; `getEnv` memoizes it
 * over process.env and is called from instrumentation.ts at startup. */
const valid = {
  WP_API_BASE: "https://wp.example/wp-json/progressnow/v1",
  NEXT_PUBLIC_SITE_ORIGIN: "https://app.example",
  CHAPTER_REBUILD_SECRET: "0123456789abcdef0123456789abcdef",
};

describe("readEnv", () => {
  it("accepts a complete production environment and derives WP_ORIGIN", () => {
    const env = readEnv(valid);
    expect(env.WP_API_BASE).toBe("https://wp.example/wp-json/progressnow/v1");
    expect(env.WP_ORIGIN).toBe("https://wp.example");
    expect(env.NEXT_PUBLIC_SITE_ORIGIN).toBe("https://app.example");
    expect(env.MOCK_API).toBe(false);
    // The default carries the WordPress scheme: https-only for the optimizer.
    expect(env.IMAGE_HOSTS).toEqual(["https://wp.example"]);
    expect(env.WP_BUILD_STATUS_URL).toBeUndefined();
  });

  it("strips a trailing slash from the API base and honors an explicit WP_ORIGIN", () => {
    const env = readEnv({
      ...valid,
      WP_API_BASE: "https://wp.example/wp-json/progressnow/v1/",
      WP_ORIGIN: "https://cdn.example/",
    });
    expect(env.WP_API_BASE).toBe("https://wp.example/wp-json/progressnow/v1");
    expect(env.WP_ORIGIN).toBe("https://cdn.example");
  });

  it("names every missing required variable", () => {
    expect(() => readEnv({})).toThrow(EnvError);
    try {
      readEnv({});
    } catch (e) {
      const message = (e as Error).message;
      expect(message).toContain("WP_API_BASE");
      expect(message).toContain("CHAPTER_REBUILD_SECRET");
      expect(message).toContain("NEXT_PUBLIC_SITE_ORIGIN");
    }
  });

  it("rejects malformed values", () => {
    expect(() => readEnv({ ...valid, WP_API_BASE: "not a url" })).toThrow(/WP_API_BASE/);
    expect(() => readEnv({ ...valid, CHAPTER_REBUILD_SECRET: "short" })).toThrow(
      /CHAPTER_REBUILD_SECRET/,
    );
    expect(() => readEnv({ ...valid, WP_BUILD_STATUS_URL: "ftp://x" })).toThrow(
      /WP_BUILD_STATUS_URL/,
    );
  });

  /* openspec rebuild-credential-boundary § Shared secrets meet a minimum
   * strength: 32 characters on both sides; the theme enforces the same floor. */
  it("requires a rebuild secret of at least 32 characters", () => {
    const thirtyOne = "a".repeat(31);
    expect(() => readEnv({ ...valid, CHAPTER_REBUILD_SECRET: thirtyOne })).toThrow(
      /CHAPTER_REBUILD_SECRET must be at least 32 characters/,
    );
    // The old 16-character minimum is no longer enough, even with MOCK_API set.
    expect(() =>
      readEnv({ ...valid, MOCK_API: "1", CHAPTER_REBUILD_SECRET: "a".repeat(16) }),
    ).toThrow(/CHAPTER_REBUILD_SECRET/);
    expect(
      readEnv({ ...valid, CHAPTER_REBUILD_SECRET: "a".repeat(32) }).CHAPTER_REBUILD_SECRET,
    ).toBe("a".repeat(32));
  });

  it("MOCK_API=1 supplies the mock defaults and relaxes the secret", () => {
    const env = readEnv({ MOCK_API: "1" });
    expect(env.MOCK_API).toBe(true);
    expect(env.WP_API_BASE).toBe("http://127.0.0.1:8787/wp-json/progressnow/v1");
    expect(env.WP_ORIGIN).toBe("http://127.0.0.1:8787");
    expect(env.CHAPTER_REBUILD_SECRET).toBe("dev-mock-secret-not-for-production");
    expect(env.NEXT_PUBLIC_SITE_ORIGIN).toBe("http://localhost:3000");
  });

  it("parses IMAGE_HOSTS as a trimmed list of bare hosts or http(s) origins", () => {
    expect(
      readEnv({ ...valid, IMAGE_HOSTS: " wp.example, cdn.example ,, http://cms.local:8890" })
        .IMAGE_HOSTS,
    ).toEqual(["wp.example", "cdn.example", "http://cms.local:8890"]);
    for (const bad of ["ftp://cdn.example", "https://cdn.example/uploads", "cdn example"]) {
      expect(() => readEnv({ ...valid, IMAGE_HOSTS: bad }), bad).toThrow(/IMAGE_HOSTS/);
    }
  });
});

/* openspec next-edge-trust-boundaries § Image optimization uses HTTPS
 * upstreams in production. */
describe("imageRemotePatterns", () => {
  it("maps a bare host to https only", () => {
    expect(imageRemotePatterns(["cms.example.org", "CDN.example.org"])).toEqual([
      { protocol: "https", hostname: "cms.example.org" },
      { protocol: "https", hostname: "cdn.example.org" },
    ]);
  });

  it("honors a scheme-qualified entry as written, port included, and de-duplicates", () => {
    expect(
      imageRemotePatterns([
        "http://cms.local:8890",
        "https://cdn.example.org",
        "cdn.example.org",
        "",
      ]),
    ).toEqual([
      { protocol: "http", hostname: "cms.local", port: "8890" },
      { protocol: "https", hostname: "cdn.example.org" },
    ]);
  });
});
