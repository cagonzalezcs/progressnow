#!/usr/bin/env node
/**
 * Twig output-escaping audit (openspec security-template-output-escaping).
 * No dependencies; `node bin/twig-audit.mjs` from the theme root, exit 1 on
 * any finding. tests/test-twig-audit.php runs the same rules under PHPUnit
 * so `composer test` alone catches a regression.
 *
 * Rules:
 *  1. Autoescape is on with the theme's strategy: src/StarterSite.php sets
 *     `$options['autoescape'] = 'esc_html';` (progressnow_esc_html — esc_html
 *     semantics, no double-encoding of kses-normalized storage). A bare `|e`
 *     / `|escape` or `|e('html')` in views/ is Twig's double-encoding built-in
 *     and is a finding: write `|e('esc_html')` (attribute/JSON contexts keep
 *     `|e('html_attr')`).
 *  2. Every `|raw` in views/ carries a same-line marker naming its sanitizer:
 *     `{# raw: kses #}` (wp_kses'd editor HTML), `{# raw: encoder #}`
 *     (progressnow_json_for_script output), `{# raw: markup #}` (HTML authored
 *     by the theme/core whose interpolated values are escaped explicitly).
 *     A comma list (`{# raw: encoder, markup #}`) covers a line with several.
 *  3. Inline <script> bodies in views/ interpolate only encoder output (the
 *     ENCODED context keys below); PHP never concatenates json_encode output
 *     into a <script> line — inc/escaping.php's encoder is the one path.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Context keys produced by progressnow_json_for_script (inc/shell.php). */
const ENCODED = ["shell_data_json"];
const MARKER =
  /\{#\s*raw:\s*(?:kses|encoder|markup)(?:\s*,\s*(?:kses|encoder|markup))*\s*#\}/;
const RAW = /\|\s*raw\b/;
const AUTOESCAPE = /^\s*\$options\['autoescape'\]\s*=\s*'esc_html';/m;
// `|e`, `|escape`, `|e()`, `|e('html')` / `|e("html")` — Twig's built-in html strategy.
const BUILTIN_ESCAPE = /\|\s*e(?:scape)?(?:\s*\(\s*(?:['"]html['"])?\s*\))?(?![\w(])/;

function walk(dir, ext, out = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, ext, out);
    else if (path.endsWith(ext)) out.push(path);
  }
  return out.sort();
}

/** @returns {string[]} findings as `file:line message` */
export function audit(root = ROOT) {
  const findings = [];
  const rel = (p) => relative(root, p);

  const starter = readFileSync(join(root, "src/StarterSite.php"), "utf8");
  if (!AUTOESCAPE.test(starter)) {
    findings.push(
      "src/StarterSite.php:1 Twig autoescape is not set to the theme strategy ($options['autoescape'] = 'esc_html')",
    );
  }

  for (const file of walk(join(root, "views"), ".twig")) {
    const source = readFileSync(file, "utf8");
    const lines = source.split("\n");
    // Comments blanked (newlines kept) so `|raw` in prose is not a finding.
    const codeLines = source
      .replace(/\{#[\s\S]*?#\}/g, (c) => c.replace(/[^\n]/g, " "))
      .split("\n");
    let inScript = false;
    lines.forEach((line, i) => {
      const at = `${rel(file)}:${i + 1}`;
      const code = codeLines[i];
      if (RAW.test(code) && !MARKER.test(line)) {
        findings.push(
          `${at} |raw without a {# raw: kses|encoder|markup #} marker`,
        );
      }
      if (BUILTIN_ESCAPE.test(code)) {
        findings.push(
          `${at} built-in |e double-encodes stored entities — use |e('esc_html')`,
        );
      }
      // <script> element bodies (open and close may share a line).
      let scanFrom = 0;
      while (scanFrom < code.length) {
        if (!inScript) {
          const open = code.indexOf("<script", scanFrom);
          if (open === -1) break;
          const gt = code.indexOf(">", open);
          if (gt === -1) break;
          inScript = true;
          scanFrom = gt + 1;
        } else {
          const close = code.indexOf("</script>", scanFrom);
          const body =
            close === -1 ? code.slice(scanFrom) : code.slice(scanFrom, close);
          for (const m of body.matchAll(/\{\{\s*([^}]*?)\s*\}\}/g)) {
            const expr = m[1];
            const name = expr.split("|")[0].trim();
            if (!ENCODED.includes(name) || !/\|\s*raw\b/.test(expr)) {
              findings.push(
                `${at} <script> interpolates \`${expr}\` — only encoder output (${ENCODED.join(", ")}) may be inlined`,
              );
            }
          }
          if (close === -1) break;
          inScript = false;
          scanFrom = close + "</script>".length;
        }
      }
    });
  }

  for (const file of [
    ...walk(join(root, "inc"), ".php"),
    ...walk(join(root, "src"), ".php"),
  ]) {
    if (rel(file) === "inc/escaping.php") continue;
    readFileSync(file, "utf8")
      .split("\n")
      .forEach((line, i) => {
        if (/<script\b/.test(line) && /json_encode\s*\(/.test(line)) {
          findings.push(
            `${rel(file)}:${i + 1} json_encode inside a <script> line — use progressnow_json_for_script()`,
          );
        }
      });
  }

  return findings;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const findings = audit();
  if (findings.length) {
    console.error(
      `twig-audit: ${findings.length} finding(s)\n` +
        findings.map((f) => "  " + f).join("\n"),
    );
    process.exit(1);
  }
  console.log(
    "twig-audit: ok (autoescape on, every |raw marked, inline JSON via the encoder)",
  );
}
