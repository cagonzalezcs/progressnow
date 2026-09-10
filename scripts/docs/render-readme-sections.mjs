#!/usr/bin/env node
// Renders the root README's Roadmap and Capabilities sections from the OpenSpec
// trees (openspec documentation-accuracy § Status sections are generated).
//
//   node scripts/docs/render-readme-sections.mjs          # rewrite README.md in place
//   node scripts/docs/render-readme-sections.mjs --check  # exit 1 when the committed README is stale
//
// Sources, read the way the `openspec` CLI reads them so `openspec list` and the
// README agree: every directory under openspec/changes except archive/, task
// counts from the top-level `- [ ]` / `- [x]` lines of tasks.md, and every
// openspec/specs/<name>/spec.md with its `### Requirement:` headings. The
// one-line scope is `.openspec.yaml` `description` when present, else the
// first bullet under the proposal's "## What Changes". The CLI itself is not
// invoked: its `list --specs --json` prints a table in 1.2.0 and there is no
// root package.json to pin it in, and the counting rule is four lines.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { REPO_ROOT, listChangeDirs, listSpecDirs, replaceRegion } from "./lib.mjs";

// Mirrors @fission-ai/openspec dist/utils/task-progress.js.
const TASK = /^[-*]\s+\[[\sx]\]/i;
const DONE = /^[-*]\s+\[x\]/i;
const SCOPE_MAX = 220;

export function countTasks(content) {
  let total = 0;
  let completed = 0;
  for (const line of content.split("\n")) {
    if (!TASK.test(line)) continue;
    total++;
    if (DONE.test(line)) completed++;
  }
  return { total, completed };
}

/** `description:` from a change's .openspec.yaml (one line, quotes optional), or null. */
export function metadataDescription(yamlText) {
  const m = yamlText.match(/^description:\s*(.+?)\s*$/m);
  if (!m) return null;
  let v = m[1];
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  return v || null;
}

/** First top-level bullet under "## What Changes" (continuation lines joined), or null. */
export function firstWhatChangesBullet(proposal) {
  const lines = proposal.split("\n");
  let inSection = false;
  let bullet = null;
  for (const line of lines) {
    if (/^##\s/.test(line)) {
      if (bullet !== null) break;
      inSection = /^##\s+What Changes\b/i.test(line);
      continue;
    }
    if (!inSection) continue;
    if (bullet === null) {
      const m = line.match(/^[-*]\s+(.*)$/);
      if (m) bullet = m[1];
      continue;
    }
    if (/^\s+\S/.test(line) && !/^\s+[-*]\s/.test(line)) {
      bullet += ` ${line.trim()}`;
      continue;
    }
    break;
  }
  return bullet;
}

/** One table cell: whitespace collapsed, pipes escaped, cut at a sentence or word
 *  boundary before SCOPE_MAX, never inside inline code. */
export function oneLine(text, max = SCOPE_MAX) {
  let t = (text ?? "").replace(/\s+/g, " ").trim().replace(/(?<!\\)\|/g, "\\|");
  if (t.length <= max) return t;
  const sentence = t.lastIndexOf(". ", max);
  if (sentence > max / 2) return t.slice(0, sentence + 1);
  t = t.slice(0, t.lastIndexOf(" ", max));
  if ((t.match(/`/g) ?? []).length % 2 === 1) t = t.slice(0, t.lastIndexOf("`")).trimEnd();
  return `${t.replace(/[,;:(]$/, "")}…`;
}

function readIf(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

export function readChanges(root = REPO_ROOT) {
  return listChangeDirs(root).map((name) => {
    const dir = path.join(root, "openspec", "changes", name);
    const { total, completed } = countTasks(readIf(path.join(dir, "tasks.md")));
    const scope =
      metadataDescription(readIf(path.join(dir, ".openspec.yaml"))) ??
      firstWhatChangesBullet(readIf(path.join(dir, "proposal.md"))) ??
      "";
    return { name, total, completed, scope: oneLine(scope) };
  });
}

export function readSpecs(root = REPO_ROOT) {
  return listSpecDirs(root).map((name) => {
    const text = readIf(path.join(root, "openspec", "specs", name, "spec.md"));
    const requirements = (text.match(/^###\s+Requirement:/gm) ?? []).length;
    return { name, requirements };
  });
}

export function renderRoadmap(changes) {
  const rows = changes.map((c) => {
    const tasks = c.total === 0 ? "—" : c.completed === c.total ? `${c.completed}/${c.total} ✓` : `${c.completed}/${c.total}`;
    return `| \`${c.name}\` | ${tasks} | ${c.scope || "—"} |`;
  });
  return ["| Change | Tasks | Scope |", "|---|---|---|", ...rows].join("\n");
}

export function renderCapabilities(specs) {
  const total = specs.reduce((n, s) => n + s.requirements, 0);
  const list = specs.map((s) => `\`${s.name}\` (${s.requirements})`).join(", ");
  return `Capabilities on file — ${specs.length} specs, ${total} requirements (count in parentheses): ${list}.`;
}

export function render(readme, { changes, specs }) {
  let out = replaceRegion(readme, "roadmap", renderRoadmap(changes));
  out = replaceRegion(out, "capabilities", renderCapabilities(specs));
  return out;
}

/** Lines that differ between the committed README and a fresh render: `- stale`, `+ fresh`. */
export function drift(current, fresh) {
  const a = current.split("\n");
  const b = fresh.split("\n");
  const inB = new Set(b);
  const inA = new Set(a);
  return [...a.filter((l) => !inB.has(l)).map((l) => `- ${l}`), ...b.filter((l) => !inA.has(l)).map((l) => `+ ${l}`)];
}

export function main(argv = process.argv.slice(2), root = REPO_ROOT) {
  const check = argv.includes("--check");
  const readmePath = path.join(root, "README.md");
  const current = fs.readFileSync(readmePath, "utf8");
  const fresh = render(current, { changes: readChanges(root), specs: readSpecs(root) });
  if (fresh === current) {
    console.log("README.md: generated sections are current");
    return 0;
  }
  if (check) {
    console.error("README.md: generated sections are stale — run `node scripts/docs/render-readme-sections.mjs` and commit:");
    for (const line of drift(current, fresh)) console.error(line);
    return 1;
  }
  fs.writeFileSync(readmePath, fresh);
  console.log("README.md: generated sections rewritten");
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  process.exit(main());
}

