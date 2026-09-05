import { describe, expect, it } from "vitest";
import { createReplayCache } from "@/lib/replay-cache";

/* Replay rejection (openspec next-revalidation-receiver § Replay rejection). */
describe("createReplayCache", () => {
  it("remembers a key for the window and forgets it afterwards", () => {
    const cache = createReplayCache({ windowSeconds: 300 });
    expect(cache.seen("t:sig", 1000)).toBe(false);
    expect(cache.seen("t:sig", 1100)).toBe(true);
    expect(cache.seen("t:sig", 1300)).toBe(true);
    expect(cache.seen("t:sig", 1301)).toBe(false);
  });

  it("evicts the oldest entries past the cap", () => {
    const cache = createReplayCache({ windowSeconds: 300, max: 2 });
    cache.seen("a", 1000);
    cache.seen("b", 1001);
    cache.seen("c", 1002);
    expect(cache.size).toBe(2);
    expect(cache.seen("a", 1003)).toBe(false); // evicted → treated as new
    expect(cache.seen("c", 1003)).toBe(true);
  });
});
