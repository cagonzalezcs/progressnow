import { randomUUID } from "node:crypto";
import type { Logger } from "@/lib/log";
import type { ReplayCache } from "@/lib/replay-cache";
import { verify } from "@/lib/signing";

/* Framework-agnostic core of POST /api/rebuild (openspec
 * next-revalidation-receiver; design D9). The route handler supplies the real
 * dependencies: the shared secret, the process-wide replay cache, Next's
 * revalidateTag, and the optional signed /build-status callback. Bad input is
 * never a 5xx; every outcome is logged with the dispatcher's requestId. */

export const MAX_BODY_BYTES = 16 * 1024;
export const CONTENT_TAGS = ["content", "routes", "site"] as const;

export interface RebuildPayload {
  event: "rebuild";
  requestId?: string;
  contentVersion?: number;
  reason?: string;
  siteUrl?: string;
  requestedAt?: string;
}

export interface BuildStatusPayload {
  buildId: string;
  status: "succeeded" | "failed" | "started";
  contentVersion: number;
}

export interface ReceiverDeps {
  secret: string;
  /** Unix seconds. */
  now: () => number;
  replayCache: ReplayCache;
  revalidate: (tags: string[]) => void;
  /** Signed /build-status callback; absent when WP_BUILD_STATUS_URL is unset. */
  callback?: (payload: BuildStatusPayload) => Promise<void>;
  logger: Logger;
}

function json(status: number, body: unknown): Response {
  return Response.json(body, { status, headers: { "cache-control": "no-store" } });
}

/** `application/json` (parameters ignored), the only media type the dispatcher sends. */
export function isJsonContentType(value: string | null): boolean {
  return (value ?? "").split(";")[0]!.trim().toLowerCase() === "application/json";
}

/** Reads at most `max` bytes of the body (openspec next-revalidation-receiver
 * § Body size is enforced while streaming): the stream is cancelled the moment
 * the ceiling is crossed, whatever Content-Length claimed, so an unsigned
 * client can never make the receiver buffer more than the cap. */
export async function readBodyBounded(
  request: Request,
  max: number,
): Promise<{ ok: true; body: string } | { ok: false }> {
  if (!request.body) return { ok: true, body: "" };
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > max) {
        await reader.cancel("payload too large").catch(() => {});
        return { ok: false };
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return { ok: true, body: Buffer.concat(chunks).toString("utf8") };
}

function parsePayload(text: string): RebuildPayload | null {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const obj = data as Record<string, unknown>;
  if (obj.event !== "rebuild") return null;
  return {
    event: "rebuild",
    requestId: typeof obj.requestId === "string" ? obj.requestId : undefined,
    contentVersion:
      typeof obj.contentVersion === "number" && Number.isFinite(obj.contentVersion)
        ? obj.contentVersion
        : undefined,
    reason: typeof obj.reason === "string" ? obj.reason : undefined,
    siteUrl: typeof obj.siteUrl === "string" ? obj.siteUrl : undefined,
    requestedAt: typeof obj.requestedAt === "string" ? obj.requestedAt : undefined,
  };
}

export async function handleRebuild(request: Request, deps: ReceiverDeps): Promise<Response> {
  const { logger } = deps;
  if (!isJsonContentType(request.headers.get("content-type"))) {
    logger.warn("receiver", { outcome: "rejected", reason: "content-type", status: 415 });
    return json(415, { error: "expected content-type: application/json" });
  }
  // Fast path: an honest Content-Length above the cap is refused before a byte is read…
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) {
    logger.warn("receiver", { outcome: "rejected", reason: "size", status: 413, declared });
    return json(413, { error: "payload too large" });
  }
  // …and a missing or lying one is caught while streaming, never after buffering it all.
  const read = await readBodyBounded(request, MAX_BODY_BYTES);
  if (!read.ok) {
    logger.warn("receiver", { outcome: "rejected", reason: "size", status: 413 });
    return json(413, { error: "payload too large" });
  }
  const body = read.body;

  const timestamp = request.headers.get("x-chapter-timestamp") ?? "";
  const signature = request.headers.get("x-chapter-signature") ?? "";
  const verdict = verify({ body, timestamp, signature, secret: deps.secret, now: deps.now() });
  if (!verdict.ok) {
    logger.warn("receiver", { outcome: "rejected", reason: verdict.reason, status: 401 });
    return json(401, { error: "invalid or stale signature" });
  }

  const replayKey = `${timestamp}:${signature
    .trim()
    .replace(/^sha256=/i, "")
    .toLowerCase()}`;
  if (deps.replayCache.seen(replayKey, deps.now())) {
    logger.warn("receiver", { outcome: "rejected", reason: "replay", status: 401 });
    return json(401, { error: "replayed request" });
  }

  const payload = parsePayload(body);
  if (!payload) {
    logger.warn("receiver", { outcome: "rejected", reason: "shape", status: 400 });
    return json(400, { error: 'expected a JSON object with event: "rebuild"' });
  }

  const buildId = randomUUID();
  deps.revalidate([...CONTENT_TAGS]);
  logger.info("receiver", {
    outcome: "accepted",
    status: 202,
    buildId,
    requestId: payload.requestId,
    contentVersion: payload.contentVersion,
    reason: payload.reason,
  });

  if (deps.callback) {
    try {
      await deps.callback({
        buildId,
        status: "succeeded",
        contentVersion: payload.contentVersion ?? 0,
      });
    } catch (error) {
      logger.error("build-status", {
        outcome: "failed",
        buildId,
        requestId: payload.requestId,
        error,
      });
    }
  }

  return json(202, { buildId, status: "started" });
}
