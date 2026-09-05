import { createHmac, timingSafeEqual } from "node:crypto";

/* HMAC scheme shared with the theme's inc/rebuild.php (openspec
 * next-revalidation-receiver § Signed request verification):
 *   signature = hex(hmac_sha256(secret, `${timestamp}.${body}`))
 *   header    X-Chapter-Signature: sha256=<signature>
 *   header    X-Chapter-Timestamp: unix seconds (9–11 digits), |now − ts| ≤ 300
 * The same scheme signs the optional /build-status callback. */

export const REPLAY_WINDOW_SECONDS = 300;

const TIMESTAMP = /^\d{9,11}$/;
const HEX64 = /^[0-9a-f]{64}$/;

export function sign(body: string, timestamp: string, secret: string): string {
  return createHmac("sha256", secret).update(`${timestamp}.${body}`, "utf8").digest("hex");
}

export function signatureHeader(body: string, timestamp: string, secret: string): string {
  return `sha256=${sign(body, timestamp, secret)}`;
}

export type VerifyFailure = "secret" | "timestamp" | "stale" | "signature";
export type VerifyResult = { ok: true } | { ok: false; reason: VerifyFailure };

export interface VerifyInput {
  body: string;
  timestamp: string;
  signature: string;
  secret: string;
  /** Unix seconds; defaults to the current time. */
  now?: number;
}

export function verify({
  body,
  timestamp,
  signature,
  secret,
  now = Date.now() / 1000,
}: VerifyInput): VerifyResult {
  if (!secret) return { ok: false, reason: "secret" };
  if (!TIMESTAMP.test(timestamp)) return { ok: false, reason: "timestamp" };
  if (Math.abs(now - Number(timestamp)) > REPLAY_WINDOW_SECONDS)
    return { ok: false, reason: "stale" };

  const given = signature
    .trim()
    .replace(/^sha256=/i, "")
    .toLowerCase();
  if (!HEX64.test(given)) return { ok: false, reason: "signature" };
  const expected = sign(body, timestamp, secret);
  const ok = timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(given, "hex"));
  return ok ? { ok: true } : { ok: false, reason: "signature" };
}
