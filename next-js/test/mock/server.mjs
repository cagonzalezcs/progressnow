#!/usr/bin/env node
/* Standalone fixture-backed WordPress REST stand-in (openspec next-test-harness
 * § Fixture-backed mock API). Not part of the production bundle. Serves:
 *
 *   GET  /wp-json/progressnow/v1/*      contract-valid envelopes (404 in the
 *                                       WordPress error shape for unknown content)
 *   POST /wp-json/progressnow/v1/build-status   records the receiver's callback
 *   GET  /wp-content/themes/progressnow/static/*  the theme's fonts/brand art
 *                                       (the app proxies this path same-origin)
 *   GET  /__mock/requests               request log (paths) — e2e asserts on it
 *   GET  /__mock/build-status           recorded callbacks
 *   POST /__mock/posts/{slug}           { title } overlay for the webhook e2e
 *   POST /__mock/canonical-origin       { origin } → seo.canonical/hreflang origin
 *   POST /__mock/fail                   { failing: boolean } → 503 for every envelope
 *   POST /__mock/reset                  clear overlays and logs
 *
 * MOCK_PORT (default 8787). MOCK_ORIGIN defaults to the listen origin so the
 * envelopes' absolute URLs point back at this server. */
import { createServer } from "node:http";
import { createReadStream, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { createMock } from "./api.mjs";

const PORT = Number(process.env.MOCK_PORT ?? 8787);
const HOST = process.env.MOCK_HOST ?? "127.0.0.1";
const ORIGIN = process.env.MOCK_ORIGIN ?? `http://${HOST}:${PORT}`;
const API_PREFIX = "/wp-json/progressnow/v1/";
const STATIC_PREFIX = "/wp-content/themes/progressnow/static/";
const STATIC_ROOT = fileURLToPath(
  new URL("../../../wp-content/themes/progressnow/static/", import.meta.url),
);
const MIME = {
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".css": "text/css",
  ".json": "application/json",
  ".txt": "text/plain",
};

const mock = createMock({ origin: ORIGIN });
/** @type {unknown[]} */
const buildStatus = [];

/** @param {import("node:http").IncomingMessage} req */
async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString("utf8");
  return text ? JSON.parse(text) : {};
}

/** @param {import("node:http").ServerResponse} res @param {number} status @param {unknown} body */
function json(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(body));
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", ORIGIN);
  const { pathname } = url;

  // --- e2e control surface -------------------------------------------------
  if (pathname.startsWith("/__mock/")) {
    const op = pathname.slice("/__mock/".length).replace(/\/+$/, "");
    if (req.method === "GET" && op === "requests") return json(res, 200, mock.requests);
    if (req.method === "GET" && op === "build-status") return json(res, 200, buildStatus);
    if (req.method === "GET" && op === "health")
      return json(res, 200, { ok: true, origin: ORIGIN });
    if (req.method === "POST") {
      const body = await readJson(req).catch(() => null);
      if (body === null) return json(res, 400, { error: "invalid JSON" });
      if (op.startsWith("posts/")) {
        mock.setPostTitle(op.slice("posts/".length), String(body.title ?? ""));
        return json(res, 200, { ok: true });
      }
      if (op === "canonical-origin") {
        mock.setCanonicalOrigin(body.origin ? String(body.origin) : null);
        return json(res, 200, { ok: true });
      }
      if (op === "fail") {
        mock.setFailing(Boolean(body.failing));
        return json(res, 200, { ok: true });
      }
      if (op === "reset") {
        mock.reset();
        buildStatus.length = 0;
        return json(res, 200, { ok: true });
      }
    }
    return json(res, 404, { error: "unknown mock op" });
  }

  // --- theme static assets (fonts, brand placeholders) ----------------------
  if (pathname.startsWith(STATIC_PREFIX) && req.method === "GET") {
    const rel = normalize(decodeURIComponent(pathname.slice(STATIC_PREFIX.length))).replace(
      /^(\.\.[/\\])+/,
      "",
    );
    const file = join(STATIC_ROOT, rel);
    if (!file.startsWith(STATIC_ROOT)) return json(res, 403, { error: "forbidden" });
    try {
      const stat = statSync(file);
      if (!stat.isFile()) throw new Error("not a file");
      res.writeHead(200, {
        "Content-Type": MIME[extname(file).toLowerCase()] ?? "application/octet-stream",
        "Content-Length": String(stat.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      });
      createReadStream(file).pipe(res);
    } catch {
      json(res, 404, { error: "not found" });
    }
    return;
  }

  // --- REST API -------------------------------------------------------------
  if (pathname.startsWith(API_PREFIX)) {
    const path = pathname.slice(API_PREFIX.length).replace(/\/+$/, "");
    mock.log(`${path}${url.search}`);

    if (req.method === "POST" && path === "build-status") {
      const body = await readJson(req).catch(() => null);
      buildStatus.push({
        body,
        timestamp: req.headers["x-chapter-timestamp"] ?? null,
        signature: req.headers["x-chapter-signature"] ?? null,
      });
      res.writeHead(204, { "Cache-Control": "no-store" });
      return res.end();
    }

    if (req.method !== "GET")
      return json(res, 405, {
        code: "rest_no_route",
        message: "Method not allowed",
        data: { status: 405 },
      });
    if (mock.failing)
      return json(res, 503, {
        code: "progressnow_mock_failing",
        message: "Simulated upstream failure",
        data: { status: 503 },
      });

    const query = Object.fromEntries(url.searchParams.entries());
    const body = mock.dispatch(path, query);
    if (body === null) {
      return json(res, 404, {
        code: "progressnow_not_found",
        message: `No fixture for /${path}`,
        data: { status: 404 },
      });
    }
    return json(res, 200, body);
  }

  json(res, 404, { error: "not found" });
});

server.listen(PORT, HOST, () => {
  console.log(
    `[mock] progressnow/v1 fixture API on ${ORIGIN}${API_PREFIX} (static: ${STATIC_PREFIX})`,
  );
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
