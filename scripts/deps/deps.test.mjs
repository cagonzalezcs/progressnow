import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { compareVersions, inRange, readPins, readRepoPins } from "./lib.mjs";
import { matchFeed, renderReport } from "./check-vuln-feed.mjs";
import { verify } from "./verify-pins.mjs";

const extra = { "controlled-vendor": { "licensed-plugin": { version: "3.8.9", source: "https://vendor.test/account/" } } };
const lock = {
  packages: [
    { name: "composer/installers", version: "v2.3.0", type: "composer-plugin" },
    { name: "roots/wordpress", version: "7.1.1", type: "metapackage" },
    { name: "roots/wordpress-no-content", version: "7.1.1", type: "wordpress-core" },
    { name: "wpackagist-plugin/open-plugin", version: "9.0.1", type: "wordpress-plugin" },
  ],
};
const pins = readPins({ lock, extra });

test("readPins: one core pin, composer plugins by slug, controlled-vendor pins from dependency-pins.json; tooling packages are not pins", () => {
  assert.deepEqual(
    pins.map((p) => [p.type, p.slug, p.version, p.mechanism]),
    [
      ["core", "wordpress", "7.1.1", "composer"],
      ["plugin", "licensed-plugin", "3.8.9", "controlled-vendor"],
      ["plugin", "open-plugin", "9.0.1", "composer"],
    ],
  );
});

test("the repository's own manifest pins core and every plugin to an exact version", () => {
  const repo = readRepoPins();
  assert.equal(repo.filter((p) => p.type === "core").length, 1);
  assert.ok(repo.filter((p) => p.type === "plugin").length >= 2);
  for (const p of repo) assert.match(p.version, /^\d+(\.\d+)+$/, `${p.slug} is pinned to an exact release`);
});

test("compareVersions: numeric parts, missing parts are 0, pre-release ordering", () => {
  assert.equal(compareVersions("6.8.10", "6.8.9"), 1);
  assert.equal(compareVersions("7.1", "7.1.0"), 0);
  assert.equal(compareVersions("3.8.9", "3.8.9"), 0);
  assert.equal(compareVersions("1.0.0-beta2", "1.0.0"), -1);
  assert.equal(compareVersions("1.0.0-beta2", "1.0.0-rc1"), -1);
  assert.equal(compareVersions("1.0.0-beta2", "1.0.0-beta10"), -1);
});

test("inRange: inclusive and exclusive bounds, * is unbounded", () => {
  const range = { from_version: "1.0.0", from_inclusive: true, to_version: "1.2.3", to_inclusive: true };
  assert.equal(inRange("1.2.3", range), true);
  assert.equal(inRange("1.2.4", range), false);
  assert.equal(inRange("1.2.3", { ...range, to_inclusive: false }), false);
  assert.equal(inRange("0.9", { ...range, from_version: "*" }), true);
  assert.equal(inRange("99", { ...range, to_version: "*" }), true);
});

const record = (id, software, extra = {}) => ({
  id,
  title: `Record ${id}`,
  software,
  informational: false,
  references: [`https://www.wordfence.com/threat-intel/vulnerabilities/id/${id}`],
  cvss: { score: 9.8, rating: "Critical" },
  cve: "CVE-1998-1000",
  copyrights: { message: "…", defiant: { notice: "Copyright 2012-2026 Defiant Inc.", license_url: "https://www.wordfence.com/wti-community-edition-terms-and-conditions/" } },
  ...extra,
});
const affected = (slug, type, to) => ({ type, slug, name: slug, affected_versions: { [`* - ${to}`]: { from_version: "*", from_inclusive: true, to_version: to, to_inclusive: true } }, patched: true, patched_versions: ["99.0"] });

const feed = {
  a: record("a", [affected("open-plugin", "plugin", "9.0.1")]), // the planted vulnerable pin
  b: record("b", [affected("open-plugin", "plugin", "9.0.0")]), // already patched at the pin
  c: record("c", [affected("some-other-plugin", "plugin", "99")]), // not installed
  d: record("d", [affected("wordpress", "core", "7.1.1")], { cvss: { score: 5.3, rating: "Medium" } }),
  e: record("e", [affected("licensed-plugin", "plugin", "3.8.9")], { informational: true }),
  f: record("f", [affected("open-plugin", "theme", "99")]), // same slug, different software type
};

test("matchFeed: a pin inside an affected range is a finding; patched, foreign, informational and wrong-type records are not", () => {
  const findings = matchFeed({ pins, feed });
  assert.deepEqual(findings.map((f) => [f.id, f.pin.slug, f.rating]), [["a", "open-plugin", "Critical"], ["d", "wordpress", "Medium"]]);
});

test("matchFeed: an acceptance silences a finding until its date, then it fails again", () => {
  const accepted = { a: { reason: "no patch; feature disabled", until: "2026-12-01" } };
  assert.equal(matchFeed({ pins, feed, accepted, today: "2026-12-01" }).find((f) => f.id === "a").accepted.until, "2026-12-01");
  assert.equal(matchFeed({ pins, feed, accepted, today: "2026-12-02" }).find((f) => f.id === "a").accepted, undefined);
});

test("renderReport: severity, window, link and the feed's copyright notice; feed text cannot break the table or mention anyone", () => {
  const hostile = { x: record("x", [affected("open-plugin", "plugin", "99")], { title: "Plugin <= 9.0.1 | <img> `code` [x](y) @someone\nsecond line" }) };
  const report = renderReport(matchFeed({ pins, feed: hostile }), pins);
  assert.ok(report.includes("| Critical 9.8 | open-plugin | 9.0.1 | 99.0 | 7 days | [Plugin &lt;= 9.0.1 &#124; &lt;img&gt; 'code' (x)(y) (at)someone second line](https://"));
  assert.match(report, /Copyright 2012-2026 Defiant Inc\./);
  assert.match(report, /Checked: wordpress 7\.1\.1, licensed-plugin 3\.8\.9, open-plugin 9\.0\.1\./);
});

test("verify: ok, mismatch, missing and undeclared plugins against a docroot", () => {
  const docroot = fs.mkdtempSync(path.join(os.tmpdir(), "verify-pins-"));
  const write = (rel, text) => {
    fs.mkdirSync(path.dirname(path.join(docroot, rel)), { recursive: true });
    fs.writeFileSync(path.join(docroot, rel), text);
  };
  write("wp-includes/version.php", "<?php\n$wp_version = '7.1.1';\n");
  write("wp-content/plugins/open-plugin/open-plugin.php", "<?php\n/**\n * Plugin Name: Open Plugin\n * Version: 9.0.0\n */\n");
  write("wp-content/plugins/stray/main.php", "<?php\n/*\nPlugin Name: Stray\nVersion: 1.0\n*/\n");
  write("wp-content/plugins/not-a-plugin/readme.txt", "no header here");
  try {
    assert.deepEqual(
      verify({ pins, docroot }).map((r) => [r.slug, r.status, r.found]),
      [
        ["wordpress", "ok", "7.1.1"],
        ["licensed-plugin", "missing", null],
        ["open-plugin", "mismatch", "9.0.0"],
        ["stray", "undeclared", "1.0"],
      ],
    );
  } finally {
    fs.rmSync(docroot, { recursive: true, force: true });
  }
});
