/* Serves the WordPress read API from snapshot.json (see ../snapshot.mjs).
 * Vercel rewrites /wp-json/progressnow/v1/(.*) here with ?__path=$1; the
 * original query string is preserved. Runs locally too: `node server.mjs`.
 *
 * DEMO BACKEND, NOT PRODUCTION (openspec next-edge-trust-boundaries § Public
 * helper endpoints and demo backends have a written abuse posture): it is
 * reachable from the public internet, so the one write endpoint,
 * POST /build-status, requires the same HMAC as the real API
 * (CHAPTER_REBUILD_SECRET; 401 otherwise), and URLs in the snapshot are
 * re-homed only to this deployment's own origin (PUBLIC_ORIGIN, else Vercel's
 * production URL), never to a request's X-Forwarded-Host. */
import { createHmac, timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";

const SNAPSHOT = JSON.parse(readFileSync(new URL("../snapshot.json", import.meta.url), "utf8"));
const ENTRIES = SNAPSHOT.entries;
/* /posts page size, mirroring inc/blog.php PROGRESSNOW_ARCHIVE_PER_PAGE (one
 * featured card + a 24-card grid); `per_page` is honoured up to the real
 * endpoint's cap of 50. */
const PER_PAGE = 25;
const MAX_PER_PAGE = 50;

function key(path, query) {
  const qs = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join("&");
  return qs ? `${path}?${qs}` : path;
}

function iso(d) {
  return d.toISOString().slice(0, 10);
}
function shiftMonths(d, n) {
  const x = new Date(d);
  x.setUTCMonth(x.getUTCMonth() + n);
  return x;
}

/** @returns {{ status: number, body: unknown }} */
export function resolve(path, query) {
  const lang = query.lang || "en";
  const exact = ENTRIES[key(path, { lang: query.lang })] ?? ENTRIES[key(path, {})];
  if (exact && !["/posts", "/events"].includes(path)) return { status: 200, body: exact };

  if (path === "/posts") {
    const all = ENTRIES[key("/posts", { all: 1, lang })]?.posts ?? [];
    const s = (query.s ?? "").trim().toLowerCase();
    const category = query.category && query.category !== "all" ? query.category : "";
    const posts = all.filter(
      (p) =>
        (!category || p.cat === category) &&
        (!s || `${p.title} ${p.excerpt} ${p.author ?? ""}`.toLowerCase().includes(s)),
    );
    const page = Math.max(1, Number(query.page) || 1);
    const perPage = Math.min(MAX_PER_PAGE, Math.max(1, Number(query.per_page) || PER_PAGE));
    return {
      status: 200,
      body: {
        posts: posts.slice((page - 1) * perPage, page * perPage),
        page,
        perPage,
        total: posts.length,
        totalPages: Math.max(1, Math.ceil(posts.length / perPage)),
      },
    };
  }

  if (path === "/events") {
    const src = ENTRIES[key("/events", { lang, after: "2000-01-01", before: "2100-12-31" })];
    const now = new Date();
    const after = query.after || iso(shiftMonths(now, -1));
    const before = query.before || iso(shiftMonths(now, 12));
    const events = (src?.events ?? []).filter((e) => e.date >= after && e.date <= before);
    return { status: 200, body: { events, categories: src?.categories ?? [] } };
  }

  const kind = path.startsWith("/posts/") ? "post" : path.startsWith("/events/") ? "event" : "page";
  return {
    status: 404,
    body: {
      code: `progressnow_${kind}_not_found`,
      message: `No published ${kind} matches that ${kind === "page" ? "path" : "slug"}.`,
      data: { status: 404 },
    },
  };
}

/** The origin every snapshot URL is re-homed to: configured, else this Vercel
 * project's production URL, else the deployment URL — never a request header. */
export function publicOrigin(env = process.env) {
  if (env.PUBLIC_ORIGIN) return env.PUBLIC_ORIGIN.replace(/\/+$/, "");
  const vercel = env.VERCEL_PROJECT_PRODUCTION_URL || env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return `http://127.0.0.1:${env.PORT ?? 8787}`;
}

const REPLAY_WINDOW_SECONDS = 300;

/** Same scheme as the theme's inc/rebuild.php and next-js/lib/signing.ts:
 * hex(hmac_sha256(secret, `${timestamp}.${body}`)), header `sha256=<hex>`. */
export function verifySignature({ body, timestamp, signature, secret, now = Date.now() / 1000 }) {
  if (!secret) return false;
  if (!/^\d{9,11}$/.test(timestamp ?? "")) return false;
  if (Math.abs(now - Number(timestamp)) > REPLAY_WINDOW_SECONDS) return false;
  const given = String(signature ?? "")
    .trim()
    .replace(/^sha256=/i, "")
    .toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(given)) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${body}`, "utf8").digest("hex");
  return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(given, "hex"));
}

const MAX_BODY_BYTES = 16 * 1024;

/** Raw request body, capped. Vercel's Node helpers may have consumed the stream
 * into `req.body` already; a Buffer/string is used as-is, a parsed object is
 * re-serialized (the callback is compact JSON.stringify output, so it round-trips). */
async function rawBody(req) {
  if (req.body !== undefined && req.body !== null) {
    if (Buffer.isBuffer(req.body)) return req.body.toString("utf8");
    if (typeof req.body === "string") return req.body;
    return JSON.stringify(req.body);
  }
  const chunks = [];
  let received = 0;
  for await (const chunk of req) {
    received += chunk.length;
    if (received > MAX_BODY_BYTES) return null;
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  const url = new URL(req.url, "http://x");
  const query = Object.fromEntries(url.searchParams);
  let path = "/" + (query.__path ?? url.pathname.replace(/^\/wp-json\/progressnow\/v1\/?/, ""));
  delete query.__path;
  path = path.replace(/\/+$/, "") || "/";

  if (req.method === "POST" && path === "/build-status") {
    const body = await rawBody(req);
    if (body === null) return json(res, 413, { error: "payload too large" });
    const ok = verifySignature({
      body,
      timestamp: req.headers["x-chapter-timestamp"],
      signature: req.headers["x-chapter-signature"],
      secret: process.env.CHAPTER_REBUILD_SECRET,
    });
    if (!ok) return json(res, 401, { error: "invalid or stale signature" });
    return json(res, 200, { ok: true });
  }
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    res.end();
    return;
  }

  const { status, body } = resolve(path, query);
  const origin = publicOrigin();
  const text = JSON.stringify(body)
    .replaceAll("__ORIGIN__", origin)
    .replaceAll("__HOST_ENC__", encodeURIComponent(new URL(origin).host));
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", status === 200 ? "public, max-age=60, s-maxage=300" : "no-store");
  res.setHeader("x-snapshot-taken-at", SNAPSHOT.takenAt);
  res.end(text);
}
