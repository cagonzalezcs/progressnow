import { describe, expect, it } from "vitest";
import { createUpstreamHealth } from "@/lib/upstream-health";

/* openspec next-headless-site § Error and empty surfaces: the signal proxy.ts
 * uses to answer a real 500 on the request after a data-layer failure. */
describe("upstream health", () => {
  it("remembers a failure inside the window and forgets it on success or expiry", () => {
    let t = 1_000;
    const health = createUpstreamHealth({ now: () => t });
    expect(health.recentlyFailed()).toBe(false);
    health.markFailure();
    expect(health.recentlyFailed(30_000)).toBe(true);
    t += 29_000;
    expect(health.recentlyFailed(30_000)).toBe(true);
    t += 2_000;
    expect(health.recentlyFailed(30_000)).toBe(false);
    health.markFailure();
    health.markSuccess();
    expect(health.recentlyFailed(30_000)).toBe(false);
  });
});
