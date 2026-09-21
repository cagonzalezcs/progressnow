#!/usr/bin/env node
// Relative markdown links and their anchors must resolve (openspec
// documentation-accuracy § Documented paths exist — "relative links and
// anchors SHALL resolve"). Same scope as check-paths.mjs.
//
//   node scripts/docs/check-links.mjs           # exit 1 on any finding
//   node scripts/docs/check-links.mjs --warn    # report only
//
// Inline links and images, `[text](target "title")`. Targets with a scheme
// (http:, https:, mailto:, …) are not checked. A relative target must be a
// tracked file or directory; an anchor must match a heading of the target
// document (GitHub's slug rule, lib.mjs githubSlug) — `#anchor` alone means
// this document.
import path from "node:path";
import { pathToFileURL } from "node:url";
import { REPO_ROOT, anchorsOf, listDocFiles, readText, stripFences, trackedPaths } from "./lib.mjs";

const LINK = /\]\(\s*<?([^\s<>)]+)>?(?:\s+"[^"]*")?\s*\)/g;
const SCHEME = /^[a-z][a-z0-9+.-]*:/i;

function normalize(rel) {
  const n = path.posix.normalize(rel).replace(/^\.\//, "").replace(/\/+$/, "");
  return n === "." ? "" : n;
}

/** @returns {{file:string,line:number,target:string,reason:string}[]} */
export function checkLinks({ files, read, tracked }) {
  const findings = [];
  const anchorCache = new Map();
  const anchors = (file) => {
    if (!anchorCache.has(file)) anchorCache.set(file, anchorsOf(read(file)));
    return anchorCache.get(file);
  };
  for (const file of files) {
    const docDir = path.posix.dirname(file);
    stripFences(read(file))
      .split("\n")
      .forEach((line, i) => {
        for (const m of line.matchAll(LINK)) {
          const target = m[1];
          if (SCHEME.test(target) || target.startsWith("//")) continue;
          const hash = target.indexOf("#");
          const filePart = hash >= 0 ? target.slice(0, hash) : target;
          const anchor = hash >= 0 ? target.slice(hash + 1) : "";
          let resolved = file;
          if (filePart) {
            resolved = normalize(path.posix.join(docDir === "." ? "" : docDir, decodeURIComponent(filePart)));
            if (!tracked.has(resolved)) {
              findings.push({ file, line: i + 1, target, reason: "not found" });
              continue;
            }
          }
          if (anchor) {
            if (!resolved.endsWith(".md") || !tracked.files?.has(resolved)) {
              if (!resolved.endsWith(".md")) continue; // anchors into non-markdown files are not checked
            }
            if (!anchors(resolved).has(decodeURIComponent(anchor))) {
              findings.push({ file, line: i + 1, target, reason: `anchor "#${anchor}" not in ${resolved}` });
            }
          }
        }
      });
  }
  return findings;
}

export function main(argv = process.argv.slice(2), root = REPO_ROOT) {
  const warn = argv.includes("--warn");
  const files = listDocFiles(root);
  const findings = checkLinks({ files, read: (f) => readText(root, f), tracked: trackedPaths(root) });
  for (const f of findings) console.log(`${f.file}:${f.line}  ${f.target}  (${f.reason})`);
  const summary = `check-links: ${findings.length} broken link${findings.length === 1 ? "" : "s"} in ${files.length} documents`;
  console.log(summary);
  return findings.length === 0 || warn ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  process.exit(main());
}
