/* Local runner for api/index.mjs + public/: `node server.mjs` (PORT, default 8787).
 * Point next-js at it with WP_API_BASE=http://127.0.0.1:8787/wp-json/progressnow/v1. */
import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import handler from "./api/index.mjs";

const PORT = Number(process.env.PORT ?? 8787);
const PUBLIC = new URL("./public/", import.meta.url).pathname;
const TYPES = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml",
  ".webp": "image/webp", ".avif": "image/avif", ".woff2": "font/woff2", ".woff": "font/woff",
  ".pdf": "application/pdf", ".html": "text/html", ".css": "text/css", ".ics": "text/calendar",
};

createServer((req, res) => {
  const { pathname } = new URL(req.url, "http://x");
  if (pathname.startsWith("/wp-json/progressnow/v1")) return handler(req, res);
  const file = join(PUBLIC, decodeURIComponent(pathname));
  if (file.startsWith(PUBLIC) && existsSync(file) && statSync(file).isFile()) {
    res.setHeader("content-type", TYPES[extname(file)] ?? "application/octet-stream");
    res.setHeader("cache-control", "public, max-age=31536000, immutable");
    createReadStream(file).pipe(res);
    return;
  }
  res.statusCode = 404;
  res.end("not found");
}).listen(PORT, () => console.log(`snapshot API on http://127.0.0.1:${PORT}/wp-json/progressnow/v1`));
