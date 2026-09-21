#!/usr/bin/env node
// Pinned WordPress core and plugin versions against the Wordfence Intelligence
// vulnerability feed (openspec dependency-lifecycle § Known-vulnerable
// dependencies fail CI — "post-pin disclosure is surfaced";
// docs/dependency-lifecycle.md § Vulnerability feed). composer audit and
// npm audit know nothing about WordPress plugins; this does.
//
//   WORDFENCE_INTEL_API_KEY=… node scripts/deps/check-vuln-feed.mjs
//   node scripts/deps/check-vuln-feed.mjs --feed <file.json>     # a saved feed, no network
//   … --report <file.md>                                          # markdown for the alert issue
//
// Exit 1 when a pin falls in a record's affected range (informational records
// and unexpired acceptances excepted), 0 when clean. Without a key and without
// --feed it warns and exits 0: forks and adopters who have not created the
// secret get a visible skip, not a red scheduled run. The key is only ever
// sent in the Authorization header and is never printed.
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import { inRange, readRepoAccepted, readRepoPins } from "./lib.mjs";

const FEED_URL = "https://www.wordfence.com/api/intelligence/v3/vulnerabilities/production";

// docs/dependency-lifecycle.md § Patch SLA — keep the two in step.
export const SLA_DAYS = { critical: 7, high: 7, medium: 30, low: 90 };

/** @returns {{pin:object, id:string, title:string, rating:string, score:number|null, cve:string|null, patched:string[], remediation:string, reference:string, copyrights:string[], accepted?:{reason:string,until:string}}[]} */
export function matchFeed({ pins, feed, accepted = {}, today = new Date().toISOString().slice(0, 10) }) {
  const findings = [];
  for (const record of Object.values(feed)) {
    if (record.informational) continue;
    for (const software of record.software ?? []) {
      const pin = pins.find((p) => p.type === software.type && (p.type === "core" || p.slug === software.slug));
      if (!pin) continue;
      if (!Object.values(software.affected_versions ?? {}).some((range) => inRange(pin.version, range))) continue;
      const acceptance = accepted[record.id];
      findings.push({
        pin,
        id: record.id,
        title: record.title,
        rating: record.cvss?.rating ?? "Unrated",
        score: record.cvss?.score ?? null,
        cve: record.cve ?? null,
        patched: software.patched_versions ?? [],
        remediation: software.remediation ?? "",
        reference: (record.references ?? [])[0] ?? `https://www.wordfence.com/threat-intel/vulnerabilities/id/${record.id}`,
        copyrights: Object.values(record.copyrights ?? {}).filter((c) => c?.notice).map((c) => `${c.notice} (${c.license_url})`),
        ...(acceptance && acceptance.until >= today ? { accepted: acceptance } : {}),
      });
    }
  }
  const order = ["critical", "high", "medium", "low", "unrated"];
  return findings.sort((a, b) => order.indexOf(a.rating.toLowerCase()) - order.indexOf(b.rating.toLowerCase()) || a.pin.slug.localeCompare(b.pin.slug));
}

// Feed text is third-party data on its way into a workflow command and an
// issue body: one line, nobody mentioned; in markdown, no table, HTML, code or
// link syntax ("<=" in a title survives as an entity).
const plain = (s) => String(s ?? "").replace(/\s+/g, " ").replace(/@/g, "(at)").trim();
const md = (s) => plain(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\|/g, "&#124;").replace(/`/g, "'").replace(/\[/g, "(").replace(/\]/g, ")");
const commandData = (s) => plain(s).replace(/%/g, "%25");
const commandProperty = (s) => commandData(s).replace(/:/g, "%3A").replace(/,/g, "%2C");

const windowOf = (f) => (SLA_DAYS[f.rating.toLowerCase()] ? `${SLA_DAYS[f.rating.toLowerCase()]} days` : "triage");

export function renderReport(findings, pins) {
  const open = findings.filter((f) => !f.accepted);
  const lines = [
    `${open.length} pinned WordPress ${open.length === 1 ? "dependency version is" : "dependency versions are"} in the affected range of a published vulnerability. Patch windows: docs/dependency-lifecycle.md § Patch SLA.`,
    "",
    "| Severity | Dependency | Pinned | Patched in | Window | Vulnerability |",
    "|---|---|---|---|---|---|",
    ...open.map((f) => `| ${md(f.rating)}${f.score === null ? "" : ` ${f.score}`} | ${f.pin.slug} | ${f.pin.version} | ${md(f.patched.join(", ")) || "no patch yet"} | ${windowOf(f)} | [${md(f.title)}](${encodeURI(f.reference)})${f.cve ? ` (${md(f.cve)})` : ""} |`),
  ];
  const accepted = findings.filter((f) => f.accepted);
  if (accepted.length) {
    lines.push("", "Accepted until the date shown (dependency-pins.json `vuln-accepted`):", "");
    for (const f of accepted) lines.push(`- ${f.pin.slug} ${f.pin.version} — [${md(f.title)}](${encodeURI(f.reference)}) — until ${md(f.accepted.until)}: ${md(f.accepted.reason)}`);
  }
  lines.push("", `Checked: ${pins.map((p) => `${p.slug} ${p.version}`).join(", ")}.`);
  const notices = [...new Set(findings.flatMap((f) => f.copyrights))];
  if (notices.length) lines.push("", `Vulnerability data: Wordfence Intelligence. ${notices.map(plain).join("; ")}.`);
  return lines.join("\n") + "\n";
}

async function loadFeed({ file, key }) {
  if (file) return JSON.parse(fs.readFileSync(file, "utf8"));
  const res = await fetch(FEED_URL, { headers: { Authorization: `Bearer ${key}`, Accept: "application/json" } });
  if (!res.ok) throw new Error(`feed request failed: HTTP ${res.status}${res.status === 401 || res.status === 403 ? " (check WORDFENCE_INTEL_API_KEY)" : ""}`);
  return res.json();
}

async function main(argv) {
  const arg = (name) => (argv.includes(name) ? argv[argv.indexOf(name) + 1] : undefined);
  const key = process.env.WORDFENCE_INTEL_API_KEY ?? "";
  const gha = process.env.GITHUB_ACTIONS === "true";
  if (!arg("--feed") && !key) {
    console.log(`${gha ? "::warning title=Vulnerability feed check skipped::" : ""}WORDFENCE_INTEL_API_KEY is not set — pinned plugin versions were NOT checked (docs/dependency-lifecycle.md § Vulnerability feed)`);
    return 0;
  }
  const pins = readRepoPins();
  const findings = matchFeed({ pins, feed: await loadFeed({ file: arg("--feed"), key }), accepted: readRepoAccepted() });
  const open = findings.filter((f) => !f.accepted);

  for (const f of open) {
    const line = `${f.pin.slug} ${f.pin.version}: ${plain(f.title)} [${plain(f.rating)}${f.cve ? `, ${plain(f.cve)}` : ""}] patched in ${plain(f.patched.join(", ")) || "—"} — ${f.reference}`;
    console.log(gha ? `::error title=${commandProperty(`${f.rating}: ${f.pin.slug} ${f.pin.version}`)}::${commandData(line)}` : line);
  }
  const report = renderReport(findings, pins);
  if (arg("--report")) fs.writeFileSync(arg("--report"), report);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, open.length ? report : `Vulnerability feed: clean. Checked ${pins.map((p) => `${p.slug} ${p.version}`).join(", ")}.\n`);
  console.log(open.length ? `\ncheck-vuln-feed: ${open.length} finding(s)` : `check-vuln-feed: ${pins.length} pins clean${findings.length ? ` (${findings.length} accepted)` : ""}`);
  return open.length ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main(process.argv.slice(2)).then(
    (code) => process.exit(code),
    (err) => {
      console.error(`check-vuln-feed: ${err.message}`);
      process.exit(2);
    },
  );
}
