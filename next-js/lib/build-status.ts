import type { Logger } from "@/lib/log";
import type { BuildStatusPayload } from "@/lib/rebuild-receiver";
import { signatureHeader } from "@/lib/signing";

/* Signed POST /progressnow/v1/build-status (openspec next-revalidation-receiver
 * § Optional status callback). WordPress marks the build live, purges its page
 * cache and shows it in the admin "Site build" panel. Never throws. */
export interface SendBuildStatusOptions {
  url: string;
  secret: string;
  payload: BuildStatusPayload;
  fetchImpl?: typeof fetch;
  /** Unix seconds. */
  now?: () => number;
  backoffMs?: number[];
  logger: Logger;
}

export async function sendBuildStatus({
  url,
  secret,
  payload,
  fetchImpl = fetch,
  now = () => Math.floor(Date.now() / 1000),
  backoffMs = [500, 2000, 5000],
  logger,
}: SendBuildStatusOptions): Promise<void> {
  const body = JSON.stringify(payload);
  const attempts = backoffMs.length;
  let lastStatus: number | undefined;
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const timestamp = String(now());
    try {
      const res = await fetchImpl(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "progressnow-next/1.0",
          "X-Chapter-Timestamp": timestamp,
          "X-Chapter-Signature": signatureHeader(body, timestamp, secret),
        },
        body,
        signal: AbortSignal.timeout(10_000),
      });
      lastStatus = res.status;
      if (res.ok) {
        logger.info("build-status", {
          outcome: "sent",
          buildId: payload.buildId,
          status: res.status,
          attempt,
        });
        return;
      }
      if (res.status < 500) break; // WordPress rejected it; retrying will not help
    } catch (error) {
      lastError = error;
    }
    if (attempt < attempts) await new Promise((r) => setTimeout(r, backoffMs[attempt - 1]));
  }
  logger.error("build-status", {
    outcome: "failed",
    buildId: payload.buildId,
    status: lastStatus,
    attempts,
    error: lastError,
  });
}
