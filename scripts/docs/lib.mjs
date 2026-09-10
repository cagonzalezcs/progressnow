// Shared helpers for the docs checks (openspec documentation-accuracy).
// Dependency-free ESM: the `docs` CI job runs these with Node alone, no npm ci.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/** The PHP theme: docs name its files by theme-relative path (`inc/rest.php`). */
export const THEME_DIR = "wp-content/themes/progressnow";
/** Roots a bare or relative path may be resolved against, besides the document's own directory. */
export const APP_DIRS = [THEME_DIR, "nuxt-js", "next-js"];

const ROADMAP_MARK = "openspec";

function readdirSafe(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

/** Change directories the way the OpenSpec CLI lists them: every directory under
 *  openspec/changes except `archive`, by name. */
export function listChangeDirs(root = REPO_ROOT) {
  return readdirSafe(path.join(root, "openspec", "changes"))
    .filter((e) => e.isDirectory() && e.name !== "archive" && !e.name.startsWith("."))
    .map((e) => e.name)
    .sort();
}

/** Spec directories: every openspec/specs/<name>/spec.md, by name. */
export function listSpecDirs(root = REPO_ROOT) {
  return readdirSafe(path.join(root, "openspec", "specs"))
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(root, "openspec", "specs", e.name, "spec.md")))
    .map((e) => e.name)
    .sort();
}

/** The documents the checks read (design: an explicit, narrow scope). Repo-relative POSIX paths, sorted:
 *  README.md, docs/*.md, every depth-1 README, the theme README, and each open change's proposal. */
export function listDocFiles(root = REPO_ROOT) {
  const out = new Set();
  const add = (rel) => {
    if (fs.existsSync(path.join(root, rel))) out.add(rel);
  };
  add("README.md");
  for (const e of readdirSafe(path.join(root, "docs"))) if (e.isFile() && e.name.endsWith(".md")) add(`docs/${e.name}`);
  for (const e of readdirSafe(root)) if (e.isDirectory() && !e.name.startsWith(".")) add(`${e.name}/README.md`);
  add(`${THEME_DIR}/README.md`);
  for (const c of listChangeDirs(root)) add(`openspec/changes/${c}/proposal.md`);
  return [...out].sort();
}

/** Tracked paths from `git ls-files` — case-exact on every OS, and independent of
 *  what happens to be built or ignored locally. Directories are derived from the files. */
export function trackedPaths(root = REPO_ROOT) {
  const raw = execFileSync("git", ["-C", root, "ls-files", "-z"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const files = new Set();
  const dirs = new Set([""]);
  for (const f of raw.split("\0")) {
    if (!f) continue;
    files.add(f);
    let d = path.posix.dirname(f);
    while (d && d !== "." && !dirs.has(d)) {
      dirs.add(d);
      d = path.posix.dirname(d);
    }
  }
  return {
    files,
    dirs,
    has(rel) {
      const p = rel.replace(/\/+$/, "");
      return files.has(p) || dirs.has(p);
    },
  };
}

/** Blank out fenced code blocks (``` or ~~~), keeping line numbers stable. */
export function stripFences(text) {
  const out = [];
  let fence = null;
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*(`{3,}|~{3,})/);
    if (fence) {
      if (m && m[1][0] === fence[0] && m[1].length >= fence.length) fence = null;
      out.push("");
      continue;
    }
    if (m) {
      fence = m[1];
      out.push("");
      continue;
    }
    out.push(line);
  }
  return out.join("\n");
}

/** ATX headings outside code fences: [{ level, text, line }] (1-based line). */
export function headings(text) {
  const out = [];
  stripFences(text)
    .split("\n")
    .forEach((line, i) => {
      const m = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
      if (m) out.push({ level: m[1].length, text: m[2], line: i + 1 });
    });
  return out;
}

/** GitHub's heading → anchor rule: drop formatting, lowercase, keep letters,
 *  numbers, spaces, `-` and `_`, spaces → `-`; repeats get -1, -2, … */
export function githubSlug(heading) {
  return heading
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[`*]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/\s/g, "-");
}

export function anchorsOf(text) {
  const seen = new Map();
  const out = new Set();
  for (const h of headings(text)) {
    const base = githubSlug(h.text);
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    out.add(n === 0 ? base : `${base}-${n}`);
  }
  return out;
}

/** Level-2 sections: [{ heading, line, body }] — body is the text up to the next H1/H2. */
export function sections(text) {
  const lines = text.split("\n");
  const hs = headings(text).filter((h) => h.level <= 2);
  const out = [];
  for (let i = 0; i < hs.length; i++) {
    if (hs[i].level !== 2) continue;
    const start = hs[i].line; // body starts on the line after the heading
    const end = i + 1 < hs.length ? hs[i + 1].line - 1 : lines.length;
    out.push({ heading: hs[i].text, line: hs[i].line, body: lines.slice(start, end).join("\n") });
  }
  return out;
}

export function markers(name) {
  return { start: `<!-- ${ROADMAP_MARK}:${name}:start -->`, end: `<!-- ${ROADMAP_MARK}:${name}:end -->` };
}

/** Replace the text between a region's markers (markers stay). Throws when a marker is missing. */
export function replaceRegion(text, name, body) {
  const { start, end } = markers(name);
  const a = text.indexOf(start);
  const b = text.indexOf(end);
  if (a < 0 || b < 0 || b < a) throw new Error(`README markers for "${name}" not found (${start} … ${end})`);
  return `${text.slice(0, a + start.length)}\n${body}\n${text.slice(b)}`;
}

/** Blank out generated regions (their sources are checked instead), keeping line numbers. */
export function stripRegions(text, names) {
  let out = text;
  for (const name of names) {
    const { start, end } = markers(name);
    const a = out.indexOf(start);
    const b = out.indexOf(end);
    if (a < 0 || b < 0 || b < a) continue;
    const inner = out.slice(a + start.length, b);
    out = out.slice(0, a + start.length) + inner.replace(/[^\n]/g, "") + out.slice(b);
  }
  return out;
}

export function readText(root, rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}
