#!/usr/bin/env node
// One owner per topic (openspec documentation-accuracy § One canonical owner
// per topic; README § Documentation): two documents that carry the same H2
// heading with near-identical bodies fail — the non-owner keeps a sentence
// and a link instead.
//
//   node scripts/docs/check-duplicate-sections.mjs           # exit 1 on any finding
//   node scripts/docs/check-duplicate-sections.mjs --warn    # report only
//   node scripts/docs/check-duplicate-sections.mjs --all     # also print every compared pair with its score
//
// Scope: README.md, docs/*.md, the app READMEs and the theme README (open
// change proposals are excluded — every proposal shares "## Why" / "## What
// Changes" / "## Impact" by schema). Headings compare case-insensitively with a
// trailing parenthetical dropped, so "Testing" meets "Testing (theme)". Bodies
// are compared as word sequences: similarity = 2·LCS / (|a| + |b|); above
// THRESHOLD fails. Bodies under MIN_WORDS are skipped — a sentence plus a link
// is exactly what the rule prescribes.
import path from "node:path";
import { pathToFileURL } from "node:url";
import { REPO_ROOT, listDocFiles, readText, sections } from "./lib.mjs";

export const THRESHOLD = 0.8;
export const MIN_WORDS = 40;

export function normalizeHeading(h) {
  return h
    .replace(/[`*]/g, "")
    .replace(/\s*\([^)]*\)\s*$/, "")
    .trim()
    .toLowerCase();
}

export function words(body) {
  return body
    .toLowerCase()
    .replace(/[`*_#|>]/g, " ")
    .split(/[^\p{L}\p{N}./-]+/u)
    .filter(Boolean);
}

/** 2·LCS(a, b) / (|a| + |b|), on word tokens. */
export function similarity(a, b) {
  if (a.length === 0 && b.length === 0) return 1;
  if (a.length === 0 || b.length === 0) return 0;
  let prev = new Uint32Array(b.length + 1);
  let cur = new Uint32Array(b.length + 1);
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]);
    }
    [prev, cur] = [cur, prev];
  }
  return (2 * prev[b.length]) / (a.length + b.length);
}

/** @returns {{a:{file,line},b:{file,line},heading:string,score:number}[]} every compared pair, sorted by score desc */
export function compareSections({ files, read }) {
  const byHeading = new Map();
  for (const file of files) {
    for (const s of sections(read(file))) {
      const w = words(s.body);
      if (w.length < MIN_WORDS) continue;
      const key = normalizeHeading(s.heading);
      if (!byHeading.has(key)) byHeading.set(key, []);
      byHeading.get(key).push({ file, line: s.line, heading: s.heading, words: w });
    }
  }
  const pairs = [];
  for (const [, list] of byHeading) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        if (list[i].file === list[j].file) continue;
        pairs.push({
          a: { file: list[i].file, line: list[i].line },
          b: { file: list[j].file, line: list[j].line },
          heading: list[i].heading,
          score: similarity(list[i].words, list[j].words),
        });
      }
    }
  }
  return pairs.sort((x, y) => y.score - x.score);
}

export function main(argv = process.argv.slice(2), root = REPO_ROOT) {
  const warn = argv.includes("--warn");
  const all = argv.includes("--all");
  const files = listDocFiles(root).filter((f) => !f.startsWith("openspec/changes/"));
  const pairs = compareSections({ files, read: (f) => readText(root, f) });
  const findings = pairs.filter((p) => p.score > THRESHOLD);
  const fmt = (p) => `${p.a.file}:${p.a.line} ↔ ${p.b.file}:${p.b.line}  "${p.heading}"  ${Math.round(p.score * 100)}% identical`;
  for (const p of all ? pairs : findings) console.log(fmt(p));
  console.log(
    `check-duplicate-sections: ${findings.length} duplicated section${findings.length === 1 ? "" : "s"} (> ${THRESHOLD * 100}% identical body under the same H2) across ${files.length} documents, ${pairs.length} pairs compared`,
  );
  if (findings.length) console.log("Keep one owner (README § Documentation); the other document keeps a sentence and a link.");
  return findings.length === 0 || warn ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  process.exit(main());
}
