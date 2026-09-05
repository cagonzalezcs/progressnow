#!/usr/bin/env node
/* `npm run dev:mock` — the fixture-backed mock API + `next dev` against it,
 * no WordPress needed. Ctrl-C stops both. */
import { spawn } from "node:child_process";

const port = process.env.MOCK_PORT ?? "8787";
const apiBase = `http://127.0.0.1:${port}/wp-json/progressnow/v1`;
const env = {
  ...process.env,
  MOCK_API: "1",
  MOCK_PORT: port,
  WP_API_BASE: process.env.WP_API_BASE ?? apiBase,
  NEXT_PUBLIC_SITE_ORIGIN: process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "http://localhost:3001",
  CHAPTER_REBUILD_SECRET: process.env.CHAPTER_REBUILD_SECRET ?? "dev-mock-secret",
};

const mock = spawn(process.execPath, ["test/mock/server.mjs"], { stdio: "inherit", env });
const next = spawn("npx", ["next", "dev", "-p", process.env.PORT ?? "3001"], {
  stdio: "inherit",
  env,
  shell: process.platform === "win32",
});

function stop(code = 0) {
  mock.kill();
  next.kill();
  process.exit(code);
}
next.on("exit", (code) => stop(code ?? 0));
mock.on("exit", (code) => (code ? stop(code) : undefined));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => stop(0));
