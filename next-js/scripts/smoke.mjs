#!/usr/bin/env node
/* Deployment smoke (openspec next-deployment § Container smoke; task 8.3):
 * waits for /api/health inside the readiness window, then checks that the
 * English and Spanish front pages render from the running server.
 *
 *   node scripts/smoke.mjs http://127.0.0.1:3000 [--timeout 60]
 *
 * Exit 0 when every check passes; 1 with the failing check named. Used by CI
 * against the container + mock API and by operators after a deploy. */
const args = process.argv.slice(2);
const origin = (args.find((a) => !a.startsWith("--")) ?? "http://127.0.0.1:3000").replace(
  /\/+$/,
  "",
);
const timeoutIdx = args.indexOf("--timeout");
const readinessSeconds = timeoutIdx >= 0 ? Number(args[timeoutIdx + 1]) : 60;

/** @param {string} message */
function fail(message) {
  console.error(`smoke: FAIL ${message}`);
  process.exit(1);
}

/** @param {string} path @param {RequestInit} [init] */
async function get(path, init) {
  return fetch(origin + path, { redirect: "follow", ...init });
}

// 1. Readiness: /api/health answers { ok: true, buildId } within the window.
const deadline = Date.now() + readinessSeconds * 1000;
let health = null;
while (Date.now() < deadline) {
  try {
    const res = await get("/api/health", { signal: AbortSignal.timeout(3_000) });
    if (res.ok) {
      health = await res.json();
      break;
    }
  } catch {
    /* not up yet */
  }
  await new Promise((r) => setTimeout(r, 500));
}
if (!health) fail(`/api/health did not answer 200 within ${readinessSeconds}s`);
if (health.ok !== true || typeof health.buildId !== "string")
  fail(`/api/health body unexpected: ${JSON.stringify(health)}`);
console.log(`smoke: /api/health ok (buildId ${health.buildId})`);

// 2. The front page renders in English…
for (const [path, lang] of [
  ["/", "en"],
  ["/es/", "es"],
]) {
  const res = await get(path, { headers: { accept: "text/html" } });
  if (res.status !== 200) fail(`${path} answered ${res.status}`);
  const html = await res.text();
  if (!new RegExp(`<html[^>]*\\blang="${lang}"`).test(html)) fail(`${path} is not lang="${lang}"`);
  if (!/<main\b[^>]*id="main"/.test(html)) fail(`${path} has no <main id="main">`);
  if (!/data-route-kind="front"/.test(html)) fail(`${path} did not render the front route`);
  const csp = res.headers.get("content-security-policy") ?? "";
  if (!/'nonce-[^']+'/.test(csp)) fail(`${path} carries no nonce CSP`);
  console.log(`smoke: ${path} ok (${lang}, ${new URL(res.url).pathname})`);
}
console.log("smoke: PASS");
