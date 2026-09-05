import { describe, expect, it, vi } from "vitest";
import { createLogger } from "@/lib/log";

/* Structured logging (openspec next-deployment § Observability,
 * next-revalidation-receiver § Failure isolation and logging): one JSON line
 * per event, secrets and signatures never appear. */
describe("createLogger", () => {
  it("writes one JSON line per event with level and time", () => {
    const sink = vi.fn();
    const log = createLogger({ sink, now: () => new Date("2026-09-05T12:00:00Z") });
    log.info("receiver", { outcome: "accepted", requestId: "req-1", status: 202 });
    expect(sink).toHaveBeenCalledTimes(1);
    const line = JSON.parse(sink.mock.calls[0]![0] as string);
    expect(line).toEqual({
      level: "info",
      time: "2026-09-05T12:00:00.000Z",
      event: "receiver",
      outcome: "accepted",
      requestId: "req-1",
      status: 202,
    });
  });

  it("redacts secret material by key name, at any depth", () => {
    const sink = vi.fn();
    const log = createLogger({ sink });
    log.warn("receiver", {
      reason: "signature",
      secret: "s3cr3t",
      signature: "sha256=deadbeef",
      headers: {
        "x-chapter-signature": "sha256=deadbeef",
        authorization: "Bearer x",
        accept: "json",
      },
      CHAPTER_REBUILD_SECRET: "nope",
    });
    const text = sink.mock.calls[0]![0] as string;
    expect(text).not.toContain("s3cr3t");
    expect(text).not.toContain("deadbeef");
    expect(text).not.toContain("Bearer");
    expect(text).not.toContain("nope");
    expect(text).toContain('"accept":"json"');
    expect(JSON.parse(text).secret).toBe("[redacted]");
  });

  it("serializes errors without their stack leaking secrets", () => {
    const sink = vi.fn();
    const log = createLogger({ sink });
    log.error("upstream", { error: new Error("boom") });
    expect(JSON.parse(sink.mock.calls[0]![0] as string).error).toEqual({
      name: "Error",
      message: "boom",
    });
  });
});
