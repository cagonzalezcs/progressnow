import { describe, expect, it } from "vitest";
import { EnvError, readEnv } from "@/lib/env";

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
    expect(env.IMAGE_HOSTS).toEqual(["wp.example"]);
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

  it("MOCK_API=1 supplies the mock defaults and relaxes the secret", () => {
    const env = readEnv({ MOCK_API: "1" });
    expect(env.MOCK_API).toBe(true);
    expect(env.WP_API_BASE).toBe("http://127.0.0.1:8787/wp-json/progressnow/v1");
    expect(env.WP_ORIGIN).toBe("http://127.0.0.1:8787");
    expect(env.CHAPTER_REBUILD_SECRET).toBe("dev-mock-secret-not-for-production");
    expect(env.NEXT_PUBLIC_SITE_ORIGIN).toBe("http://localhost:3000");
  });

  it("parses IMAGE_HOSTS as a trimmed list", () => {
    expect(readEnv({ ...valid, IMAGE_HOSTS: " wp.example, cdn.example ,," }).IMAGE_HOSTS).toEqual([
      "wp.example",
      "cdn.example",
    ]);
  });
});
