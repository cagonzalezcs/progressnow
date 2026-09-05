#!/usr/bin/env node
/* Signed build-status callback to WordPress (inc/rebuild.php):
 *   POST <url> { buildId, status, requestId?, contentVersion?, error? }
 *   X-Chapter-Timestamp: <unix seconds>
 *   X-Chapter-Signature: sha256=HMAC_SHA256(secret, timestamp + "." + body)
 *
 * Usage: build-status.mjs <url> <started|succeeded|failed> <buildId> [requestId] [contentVersion] [error]
 * Env:   CHAPTER_REBUILD_SECRET
 */
import { createHmac } from "node:crypto";

const [url, status, buildId, requestId = "", contentVersion = "", error = ""] = process.argv.slice(2);
const secret = process.env.CHAPTER_REBUILD_SECRET ?? "";

if (!url || !status || !buildId) {
  console.error("usage: build-status.mjs <url> <status> <buildId> [requestId] [contentVersion] [error]");
  process.exit(2);
}
if (!secret) {
  console.error("CHAPTER_REBUILD_SECRET is not set; skipping the build-status callback");
  process.exit(0);
}

const payload = { buildId, status };
if (requestId) payload.requestId = requestId;
if (contentVersion !== "") payload.contentVersion = Number.parseInt(contentVersion, 10) || 0;
if (error) payload.error = error;

const body = JSON.stringify(payload);
const timestamp = String(Math.floor(Date.now() / 1000));
const signature = "sha256=" + createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");

const res = await fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Chapter-Timestamp": timestamp,
    "X-Chapter-Signature": signature,
  },
  body,
});

if (!res.ok && res.status !== 204) {
  console.error(`build-status ${status}: HTTP ${res.status} ${await res.text()}`);
  process.exit(1);
}
console.log(`build-status ${status} → ${res.status}`);
