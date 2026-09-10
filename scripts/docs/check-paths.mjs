#!/usr/bin/env node
// Every repository path a document names in backticks must exist (openspec
// documentation-accuracy § Documented paths exist).
//
//   node scripts/docs/check-paths.mjs           # exit 1 on any finding
//   node scripts/docs/check-paths.mjs --warn    # report only
//
// Scope (scripts/docs/lib.mjs listDocFiles): README.md, docs/*.md, every
// depth-1 README, the theme README, and each open change's proposal.md.
// A token counts as a path when it has no URL/glob/placeholder characters and
// either contains "/" or looks like a file name (known extension, or a dotfile).
// It resolves when it exists — per `git ls-files`, so the check is case-exact
// and ignores what happens to be built locally (stage a new file before
// documenting it) — relative to the document's
// directory, the repository root, or one of the app roots (the docs name theme
// files as `inc/rest.php`); a bare file name resolves when any tracked file has
// that name. Proposals may mark a line `(planned)`; README.md's generated
// regions are skipped (their sources are checked); everything else goes
// through scripts/docs/paths-allowlist.txt (exact tokens or `prefix/*`).
import path from "node:path";
import { pathToFileURL } from "node:url";
import { APP_DIRS, REPO_ROOT, listDocFiles, readText, stripFences, stripRegions, trackedPaths } from "./lib.mjs";

const ALLOWLIST_FILE = "scripts/docs/paths-allowlist.txt";
const GENERATED = ["roadmap", "capabilities"];
const EXT =
  /\.(md|php|phtml|ts|tsx|js|mjs|cjs|jsx|vue|twig|json|ya?ml|css|scss|sh|toml|txt|lock|xml|html|ics|woff2?|ttf|jpe?g|png|svg|webp|gif|ico|tf|tfvars|dist|example|sample|pem|crt|conf|ini|sql|env)$/i;
const NOT_A_PATH = /[\s:*?#<>{}$…=()[\]|@`'",→\\!]|\.\.|\/\/|^[/~-]|^\.$/;


export function looksLikePath(token) {
  if (!token || NOT_A_PATH.test(token)) return false;
  if (token.includes("/")) return true;
  if (token.startsWith(".")) return true; // .nvmrc, .env.local, .gitignore
  return EXT.test(token);
}

export function parseAllowlist(text) {
  const exact = new Set();
  const prefixes = [];
  for (const raw of text.split("\n")) {
    const line = raw.replace(/\s+#.*$/, "").trim();
    if (!line || line.startsWith("#")) continue;
    if (line.endsWith("/*")) prefixes.push(line.slice(0, -1));
    else exact.add(line);
  }
  return { has: (t) => exact.has(t) || prefixes.some((p) => t.startsWith(p)) };
}

function normalize(rel) {
  const n = path.posix.normalize(rel).replace(/^\.\//, "").replace(/\/+$/, "");
  return n === "." ? "" : n;
}

export function resolves(token, docDir, tracked) {
  const bases = [docDir, "", ...APP_DIRS];
  for (const base of bases) if (tracked.has(normalize(path.posix.join(base, token)))) return true;
  if (!token.includes("/") && tracked.basenames) return tracked.basenames.has(token);
  return false;
}

/** @returns {{file:string,line:number,token:string}[]} */
export function checkPaths({ files, read, tracked, allowlist }) {
  const findings = [];
  for (const file of files) {
    const isProposal = /^openspec\/changes\/[^/]+\/proposal\.md$/.test(file);
    let text = stripFences(read(file));
    if (file === "README.md") text = stripRegions(text, GENERATED);
    const docDir = path.posix.dirname(file);
    text.split("\n").forEach((line, i) => {
      if (isProposal && /\(planned\)/i.test(line)) return;
      for (const m of line.matchAll(/`([^`\n]+)`/g)) {
        const token = m[1].trim();
        if (!looksLikePath(token) || allowlist.has(token) || resolves(token, docDir === "." ? "" : docDir, tracked)) continue;
        findings.push({ file, line: i + 1, token });
      }
    });
  }
  return findings;
}

export function withBasenames(tracked) {
  const basenames = new Set();
  for (const f of tracked.files) basenames.add(path.posix.basename(f));
  return { ...tracked, basenames };
}

export function main(argv = process.argv.slice(2), root = REPO_ROOT) {
  const warn = argv.includes("--warn");
  const files = listDocFiles(root);
  let allowText = "";
  try {
    allowText = readText(root, ALLOWLIST_FILE);
  } catch {
    /* no allowlist yet */
  }
  const findings = checkPaths({
    files,
    read: (f) => readText(root, f),
    tracked: withBasenames(trackedPaths(root)),
    allowlist: parseAllowlist(allowText),
  });
  for (const f of findings) console.log(`${f.file}:${f.line}  ${f.token}`);
  const summary = `check-paths: ${findings.length} unresolved path${findings.length === 1 ? "" : "s"} in ${files.length} documents`;
  if (findings.length === 0) {
    console.log(summary);
    return 0;
  }
  console.log(
    `${summary} — fix the reference, mark the line "(planned)" in a proposal, or list the token in ${ALLOWLIST_FILE} (a new file counts once it is staged: git ls-files)`,
  );

  return warn ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  process.exit(main());
}
