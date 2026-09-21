#!/usr/bin/env node
// Parity between the pins (composer.lock + dependency-pins.json) and a WordPress
// docroot (openspec dependency-lifecycle § Plugins and core are declared and
// version-pinned; docs/dependency-lifecycle.md § Verifying an environment).
//
//   node scripts/deps/verify-pins.mjs                    # this checkout is the docroot
//   node scripts/deps/verify-pins.mjs --docroot <dir>    # another environment's files
//   node scripts/deps/verify-pins.mjs --list             # print the pins, check nothing
//
// Exit 1 when core or a pinned plugin is missing or on another version, or when
// a plugin is installed that the manifest does not declare; exit 2 when <dir>
// holds no WordPress. Reads files only — no database, no WP-CLI.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { REPO_ROOT, compareVersions, readRepoPins } from "./lib.mjs";

export function coreVersion(docroot) {
  const file = path.join(docroot, "wp-includes/version.php");
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, "utf8").match(/^\$wp_version\s*=\s*'([^']+)'/m)?.[1] ?? null;
}

/** The Version header of the file in <dir> that carries a Plugin Name header. */
export function pluginVersion(dir) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return null;
  for (const name of fs.readdirSync(dir).filter((f) => f.endsWith(".php")).sort()) {
    const head = fs.readFileSync(path.join(dir, name), "utf8").slice(0, 8192);
    if (!/^[ \t/*#@]*Plugin Name:/im.test(head)) continue;
    return head.match(/^[ \t/*#@]*Version:\s*(\S+)/im)?.[1] ?? null;
  }
  return null;
}

export function installedPluginSlugs(docroot) {
  const dir = path.join(docroot, "wp-content/plugins");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() || e.isSymbolicLink())
    .map((e) => e.name)
    .filter((name) => pluginVersion(path.join(dir, name)) !== null)
    .sort();
}

function fix(pin) {
  if (pin.type === "core") return `wp core update --version=${pin.version} --force`;
  if (pin.mechanism === "composer") return "composer install";
  return `install ${pin.slug} ${pin.version} from ${pin.source ?? "the vendor account"} (wp plugin install <zip> --force)`;
}

/** @returns {{pin?:object, slug:string, status:"ok"|"mismatch"|"missing"|"undeclared", found:string|null, fix?:string}[]} */
export function verify({ pins, docroot }) {
  const rows = pins.map((pin) => {
    const found = pin.type === "core" ? coreVersion(docroot) : pluginVersion(path.join(docroot, "wp-content/plugins", pin.slug));
    const status = found === null ? "missing" : compareVersions(found, pin.version) === 0 ? "ok" : "mismatch";
    return { pin, slug: pin.slug, status, found, ...(status === "ok" ? {} : { fix: fix(pin) }) };
  });
  const declared = new Set(pins.filter((p) => p.type === "plugin").map((p) => p.slug));
  for (const slug of installedPluginSlugs(docroot)) {
    if (declared.has(slug)) continue;
    const found = pluginVersion(path.join(docroot, "wp-content/plugins", slug));
    rows.push({ slug, status: "undeclared", found, fix: `remove it (wp plugin delete ${slug}) or declare it (composer.json / dependency-pins.json)` });
  }
  return rows;
}

function main(argv) {
  const pins = readRepoPins();
  if (argv.includes("--list")) {
    for (const p of pins) console.log(`${p.type.padEnd(6)} ${p.slug.padEnd(28)} ${p.version.padEnd(10)} ${p.mechanism}`);
    return 0;
  }
  const at = argv.indexOf("--docroot");
  const docroot = path.resolve(at >= 0 ? argv[at + 1] ?? "" : REPO_ROOT);
  if (coreVersion(docroot) === null) {
    console.error(`verify-pins: no WordPress at ${docroot} (wp-includes/version.php not found)`);
    return 2;
  }
  const rows = verify({ pins, docroot });
  for (const r of rows) {
    const pinned = r.pin ? r.pin.version : "—";
    console.log(`${r.status.padEnd(10)} ${r.slug.padEnd(28)} pinned ${pinned.padEnd(10)} found ${r.found ?? "—"}${r.fix ? `\n           → ${r.fix}` : ""}`);
  }
  const bad = rows.filter((r) => r.status !== "ok");
  console.log(bad.length ? `\nverify-pins: ${bad.length} of ${rows.length} out of parity` : `\nverify-pins: ${rows.length} dependencies match their pins`);
  return bad.length ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) process.exit(main(process.argv.slice(2)));
