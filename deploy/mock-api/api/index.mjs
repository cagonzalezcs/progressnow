/* Serves the WordPress read API from snapshot.json (see ../snapshot.mjs).
 * Vercel rewrites /wp-json/progressnow/v1/(.*) here with ?__path=$1; the
 * original query string is preserved. Runs locally too: `node server.mjs`. */
import { readFileSync } from "node:fs";

const SNAPSHOT = JSON.parse(readFileSync(new URL("../snapshot.json", import.meta.url), "utf8"));
const ENTRIES = SNAPSHOT.entries;
const PER_PAGE = 24;

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
    return {
      status: 200,
      body: {
        posts: posts.slice((page - 1) * PER_PAGE, page * PER_PAGE),
        page,
        perPage: PER_PAGE,
        total: posts.length,
        totalPages: Math.max(1, Math.ceil(posts.length / PER_PAGE)),
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

export default function handler(req, res) {
  const url = new URL(req.url, "http://x");
  const query = Object.fromEntries(url.searchParams);
  let path = "/" + (query.__path ?? url.pathname.replace(/^\/wp-json\/progressnow\/v1\/?/, ""));
  delete query.__path;
  path = path.replace(/\/+$/, "") || "/";

  if (req.method === "POST" && path === "/build-status") {
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    res.end();
    return;
  }

  const { status, body } = resolve(path, query);
  const proto = req.headers["x-forwarded-proto"] ?? "http";
  const host = req.headers["x-forwarded-host"] ?? req.headers.host ?? "localhost";
  const text = JSON.stringify(body)
    .replaceAll("__ORIGIN__", `${proto}://${host}`)
    .replaceAll("__HOST_ENC__", encodeURIComponent(host));
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", status === 200 ? "public, max-age=60, s-maxage=300" : "no-store");
  res.setHeader("x-snapshot-taken-at", SNAPSHOT.takenAt);
  res.end(text);
}
