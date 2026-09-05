import { describe, expect, it, vi } from "vitest";
import { sendBuildStatus } from "@/lib/build-status";
import { createLogger } from "@/lib/log";
import { verify } from "@/lib/signing";

/* Optional signed /build-status callback (openspec next-revalidation-receiver
 * § Optional status callback): same HMAC scheme, at most 3 attempts with
 * backoff, failures logged and never thrown. */
const URL_ = "https://wp.example/wp-json/progressnow/v1/build-status";
const SECRET = "another-shared-secret-32-chars-long!!";

describe("sendBuildStatus", () => {
  it("posts a signed JSON body WordPress can verify", async () => {
    const fetchImpl = vi.fn(async () => new Response(null, { status: 204 }));
    await sendBuildStatus({
      url: URL_,
      secret: SECRET,
      payload: { buildId: "b1", status: "succeeded", contentVersion: 8 },
      fetchImpl,
      now: () => 1788604900,
      logger: createLogger({ sink: () => {} }),
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0]! as unknown as [string, RequestInit];
    expect(url).toBe(URL_);
    expect(init.method).toBe("POST");
    const headers = init.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBe("application/json");
    expect(headers["X-Chapter-Timestamp"]).toBe("1788604900");
    expect(
      verify({
        body: String(init.body),
        timestamp: headers["X-Chapter-Timestamp"]!,
        signature: headers["X-Chapter-Signature"]!,
        secret: SECRET,
        now: 1788604900,
      }),
    ).toEqual({ ok: true });
    expect(JSON.parse(String(init.body))).toEqual({
      buildId: "b1",
      status: "succeeded",
      contentVersion: 8,
    });
  });

  it("retries on 5xx and network errors, at most 3 attempts, then logs", async () => {
    const lines: string[] = [];
    let n = 0;
    const fetchImpl = vi.fn(async () => {
      n++;
      if (n === 1) throw new TypeError("fetch failed");
      return new Response("busy", { status: 503 });
    });
    await sendBuildStatus({
      url: URL_,
      secret: SECRET,
      payload: { buildId: "b2", status: "succeeded", contentVersion: 1 },
      fetchImpl,
      backoffMs: [0, 0, 0],
      logger: createLogger({ sink: (l) => lines.push(l) }),
    });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
    expect(lines.at(-1)).toContain('"outcome":"failed"');
    expect(lines.at(-1)).toContain('"attempts":3');
  });

  it("does not retry a 4xx (WordPress rejected the signature or shape)", async () => {
    const lines: string[] = [];
    const fetchImpl = vi.fn(async () => new Response("bad", { status: 401 }));
    await sendBuildStatus({
      url: URL_,
      secret: SECRET,
      payload: { buildId: "b3", status: "succeeded", contentVersion: 1 },
      fetchImpl,
      backoffMs: [0, 0, 0],
      logger: createLogger({ sink: (l) => lines.push(l) }),
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(lines.at(-1)).toContain('"status":401');
  });
});
