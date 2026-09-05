#!/usr/bin/env node
/* Run the production build the way it is deployed (openspec next-deployment
 * § Standalone build): copy `public/` and `.next/static` next to the traced
 * server, then start `node .next/standalone/server.js`. PORT / HOSTNAME pass
 * through (defaults 3000 / 127.0.0.1). Used by Playwright's webServer and the
 * container smoke test. */
import { spawn } from "node:child_process";
import { cpSync, existsSync } from "node:fs";

const root = new URL("../", import.meta.url);
const standalone = new URL(".next/standalone/", root);
if (!existsSync(new URL("server.js", standalone))) {
  console.error(
    "start-standalone: .next/standalone/server.js missing — run `next build` (output: 'standalone') first.",
  );
  process.exit(2);
}
if (existsSync(new URL("public/", root)))
  cpSync(new URL("public/", root), new URL("public/", standalone), { recursive: true });
cpSync(new URL(".next/static/", root), new URL(".next/static/", standalone), { recursive: true });

const child = spawn(process.execPath, [new URL("server.js", standalone).pathname], {
  stdio: "inherit",
  env: {
    ...process.env,
    PORT: process.env.PORT ?? "3000",
    HOSTNAME: process.env.HOSTNAME ?? "127.0.0.1",
  },
});
child.on("exit", (code) => process.exit(code ?? 0));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
