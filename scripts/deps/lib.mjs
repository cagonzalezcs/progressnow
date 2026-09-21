// Shared by verify-pins.mjs and check-vuln-feed.mjs (openspec
// dependency-lifecycle; docs/dependency-lifecycle.md). Dependency-free.
//
// The pins are two files at the repository root. composer.lock: WordPress core
// and the Composer-installed plugins. dependency-pins.json: a licensed plugin
// with no Composer endpoint ("controlled-vendor") and the time-boxed risk
// acceptances — kept out of composer.json because its `extra` is part of the
// lock's content hash, and neither a person nor Renovate's regex manager
// should have to re-lock to move one of these.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const CORE_PACKAGES = new Set(["roots/wordpress-no-content", "roots/wordpress-full", "johnpbloch/wordpress-core"]);

/**
 * @typedef {{type:"core"|"plugin", slug:string, version:string, package:string, mechanism:"composer"|"controlled-vendor", source?:string}} Pin
 * @returns {Pin[]}
 */
export function readPins({ lock, extra = {} }) {
  const pins = [];
  for (const pkg of lock.packages ?? []) {
    const version = String(pkg.version).replace(/^v/, "");
    if (CORE_PACKAGES.has(pkg.name)) {
      pins.push({ type: "core", slug: "wordpress", version, package: pkg.name, mechanism: "composer" });
    } else if (pkg.type === "wordpress-plugin" || pkg.type === "wordpress-muplugin") {
      pins.push({ type: "plugin", slug: pkg.name.split("/").pop(), version, package: pkg.name, mechanism: "composer" });
    }
  }
  const vendored = extra["controlled-vendor"] ?? {};
  for (const [slug, entry] of Object.entries(vendored)) {
    pins.push({ type: "plugin", slug, version: String(entry.version), package: slug, mechanism: "controlled-vendor", source: entry.source });
  }
  return pins.sort((a, b) => (a.type === b.type ? a.slug.localeCompare(b.slug) : a.type === "core" ? -1 : 1));
}

const readJson = (root, file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));

export function readRepoPins(root = REPO_ROOT) {
  return readPins({ lock: readJson(root, "composer.lock"), extra: readJson(root, "dependency-pins.json") });
}

/** dependency-pins.json "vuln-accepted": { "<feed record id>": { reason, until: "YYYY-MM-DD" } }. */
export function readRepoAccepted(root = REPO_ROOT) {
  return readJson(root, "dependency-pins.json")["vuln-accepted"] ?? {};
}

// PHP version_compare() ordering, except that a missing numeric part counts
// as 0 — "7.1" and "7.1.0" are the same release, and a feed range that ends at
// "7.1.0" has to catch a core that reports "7.1".
const RANK = { dev: 0, alpha: 1, a: 1, beta: 2, b: 2, rc: 3, c: 3, "#": 4, pl: 5, p: 5 };

function parts(version) {
  return String(version)
    .trim()
    .toLowerCase()
    .replace(/[-_+]/g, ".")
    .replace(/(\d)([a-z])/g, "$1.$2")
    .replace(/([a-z])(\d)/g, "$1.$2")
    .split(".")
    .filter((p) => p !== "")
    .map((p) => (/^\d+$/.test(p) ? Number(p) : p));
}

const rank = (part) => (typeof part === "number" ? RANK["#"] : (RANK[part] ?? -1));

/** @returns {-1|0|1} */
export function compareVersions(a, b) {
  const pa = parts(a);
  const pb = parts(b);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] ?? 0;
    const y = pb[i] ?? 0;
    if (typeof x === "number" && typeof y === "number") {
      if (x !== y) return x < y ? -1 : 1;
    } else if (rank(x) !== rank(y)) {
      return rank(x) < rank(y) ? -1 : 1;
    }
  }
  return 0;
}

/** A Wordfence Intelligence affected_versions entry; "*" is unbounded. */
export function inRange(version, { from_version, from_inclusive, to_version, to_inclusive }) {
  if (from_version !== "*") {
    const c = compareVersions(version, from_version);
    if (c < 0 || (c === 0 && !from_inclusive)) return false;
  }
  if (to_version !== "*") {
    const c = compareVersions(version, to_version);
    if (c > 0 || (c === 0 && !to_inclusive)) return false;
  }
  return true;
}
