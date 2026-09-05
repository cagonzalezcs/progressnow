import { describe, expect, it, vi } from "vitest";
import { createLogger } from "@/lib/log";
import { createReplayCache } from "@/lib/replay-cache";
import { handleRebuild, MAX_BODY_BYTES, type ReceiverDeps } from "@/lib/rebuild-receiver";
import { signatureHeader } from "@/lib/signing";
import vectors from "../fixtures/signing-vectors.json";

/* The receiver core behind POST /api/rebuild (openspec
 * next-revalidation-receiver § Payload and response contract, § Cache
 * invalidation on acceptance, § Replay rejection, § Failure isolation). The
 * route handler only wires real dependencies around `handleRebuild`. */
const SECRET = "playwright-test-secret";
const payload = {
  event: "rebuild",
  requestId: "req-1",
  contentVersion: 8,
  reason: "post_updated",
  siteUrl: "https://wp.example",
  requestedAt: "2026-09-05T12:00:00+00:00",
};

function deps(overrides: Partial<ReceiverDeps> = {}) {
  const lines: string[] = [];
  const revalidate = vi.fn();
  const callback = vi.fn(async () => {});
  return {
    deps: {
      secret: SECRET,
      now: () => 1788604810,
      replayCache: createReplayCache(),
      revalidate,
      callback,
      logger: createLogger({ sink: (l) => lines.push(l) }),
      ...overrides,
    } satisfies ReceiverDeps,
    revalidate,
    callback,
    lines,
  };
}

function signedRequest(
  body: string,
  {
    timestamp = "1788604800",
    secret = SECRET,
    signature,
  }: { timestamp?: string; secret?: string; signature?: string } = {},
) {
  return new Request("http://app.test/api/rebuild", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-chapter-timestamp": timestamp,
      "x-chapter-signature": signature ?? signatureHeader(body, timestamp, secret),
    },
    body,
  });
}

describe("handleRebuild", () => {
  it("accepts a correctly signed dispatcher payload: 202, revalidation, callback", async () => {
    const d = deps();
    const res = await handleRebuild(signedRequest(JSON.stringify(payload)), d.deps);
    expect(res.status).toBe(202);
    const json = await res.json();
    expect(json).toMatchObject({ status: "started" });
    expect(json.buildId).toMatch(/^[0-9a-f-]{36}$/);
    expect(d.revalidate).toHaveBeenCalledWith(["content", "routes", "site"]);
    expect(d.callback).toHaveBeenCalledWith({
      buildId: json.buildId,
      status: "succeeded",
      contentVersion: 8,
    });
    expect(d.lines.join("\n")).toContain('"outcome":"accepted"');
    expect(d.lines.join("\n")).toContain('"requestId":"req-1"');
  });

  it("verifies against the PHP vector byte for byte", async () => {
    const v = vectors.vectors[0]!;
    const d = deps({ now: () => Number(v.timestamp) + 5 });
    const res = await handleRebuild(
      signedRequest(v.body, { timestamp: v.timestamp, signature: `sha256=${v.signature}` }),
      d.deps,
    );
    expect(res.status).toBe(202);
  });

  it("answers 401 for a missing, wrong, or stale signature and invalidates nothing", async () => {
    const body = JSON.stringify(payload);
    for (const req of [
      new Request("http://app.test/api/rebuild", { method: "POST", body }),
      signedRequest(body, { secret: "not-the-shared-secret" }),
      signedRequest(body, { timestamp: "1788604400" }), // 410 s old
      signedRequest(body, { timestamp: "17886048" }),
    ]) {
      const d = deps();
      const res = await handleRebuild(req, d.deps);
      expect(res.status).toBe(401);
      expect(d.revalidate).not.toHaveBeenCalled();
      expect(d.callback).not.toHaveBeenCalled();
      expect(d.lines.join("\n")).toContain('"outcome":"rejected"');
      expect(d.lines.join("\n")).not.toContain(SECRET);
    }
  });

  it("answers 413 for an oversized body before verifying anything", async () => {
    const d = deps();
    const big = JSON.stringify({ ...payload, reason: "x".repeat(MAX_BODY_BYTES) });
    const res = await handleRebuild(signedRequest(big), d.deps);
    expect(res.status).toBe(413);
    expect(d.revalidate).not.toHaveBeenCalled();
  });

  it("answers 400 for malformed JSON or a payload that is not a rebuild event", async () => {
    for (const body of [
      "{not json",
      JSON.stringify({ event: "deploy" }),
      JSON.stringify([1, 2]),
      "",
    ]) {
      const d = deps();
      const res = await handleRebuild(signedRequest(body), d.deps);
      expect(res.status).toBe(400);
      expect(d.revalidate).not.toHaveBeenCalled();
    }
  });

  it("rejects a replayed request with 401 and does not revalidate twice", async () => {
    const d = deps();
    const req = () => signedRequest(JSON.stringify(payload));
    expect((await handleRebuild(req(), d.deps)).status).toBe(202);
    expect((await handleRebuild(req(), d.deps)).status).toBe(401);
    expect(d.revalidate).toHaveBeenCalledTimes(1);
  });

  it("returns 202 even when the status callback fails", async () => {
    const d = deps({
      callback: vi.fn(async () => {
        throw new Error("callback down");
      }),
    });
    const res = await handleRebuild(signedRequest(JSON.stringify(payload)), d.deps);
    expect(res.status).toBe(202);
    expect(d.lines.join("\n")).toContain("callback down");
  });

  it("never answers 5xx for bad input", async () => {
    const d = deps();
    const res = await handleRebuild(
      new Request("http://app.test/api/rebuild", {
        method: "POST",
        headers: { "x-chapter-timestamp": "x", "x-chapter-signature": "y" },
        body: "",
      }),
      d.deps,
    );
    expect(res.status).toBeLessThan(500);
  });
});
