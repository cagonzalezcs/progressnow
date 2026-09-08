## Context

Timber 2 constructs the Twig environment with `autoescape => false` unless a theme flips it via `timber/twig/environment/options`. The starter theme's hook is present but inert. Context builders in `inc/*.php` and `src/StarterSite.php` hand Twig a mix of raw strings (titles, ACF text fields, menu labels, alt text) and kses'd HTML (prose fields). Templates escape attribute-context JSON with `|e("html_attr")` and mark prose with `|raw`; everything else is emitted verbatim.

Confirmed script-context sinks:

| Sink | Encoding today | Safe? |
|---|---|---|
| `inc/seo.php` JSON-LD | `JSON_UNESCAPED_SLASHES \| JSON_UNESCAPED_UNICODE` | **No** — `</script>` passes through |
| `inc/shell.php` `__SHELL_DATA__` | `JSON_HEX_TAG \| JSON_HEX_AMP \| …` | Yes |
| `inc/shell.php` `__NUXT__.config`, importmap | same | Yes |
| Twig `data-props='…'` | `\|json_encode\|e("html_attr")` | Yes (attribute context) |
| `next-js` `serializeJsonLd` | `replace(/</g, "\\u003c")` | Yes for `<`; `>`/`&`/U+2028 not covered (harmless in `<script>` but keep parity) |

Twig's own escaping is the standard answer for the 400+ plain interpolations; the 24 `|raw` sites are already kses'd upstream.

## Goals / Non-Goals

**Goals:**
- No string reaches an HTML, attribute, or script context unescaped unless it was deliberately sanitized for that context and is marked as such.
- The safe pattern is enforced by a test and a CI gate, not by convention.
- Zero visible change for legitimate content (no double escaping).

**Non-Goals:**
- Changing what kses allows (that is `security-authoring-least-privilege`).
- Adding a CSP to the PHP theme (that is `security-headers-and-cicd-gates`).
- Escaping in the Vue/React apps beyond the JSON-LD parity test — they already bind text safely and treat `v-html`/`dangerouslySetInnerHTML` as kses'd HTML.

## Decisions

- **Global `autoescape: 'html'`, not per-template `{% autoescape %}` blocks.** One switch, one behavior; templates opt *out* with `|raw`. Alternative (keep autoescape off, add `|e` everywhere) rejected: 431 sites to touch and every future site is a regression risk.
- **Marker comment on every `|raw`.** `{# raw: kses #}` (or `raw: encoder` for the shell JSON) on the same line. The audit script and a PHPUnit test both read it. Rationale: a reviewer sees the justification where the risk is; the gate stays dependency-free.
- **Encoder flags.** `JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE`. `JSON_UNESCAPED_SLASHES` is dropped everywhere: `\/` is valid JSON and is what stops `</script>`. `JSON_UNESCAPED_UNICODE` stays for readable JSON-LD; U+2028/2029 are harmless inside `<script>` in HTML5 but the encoder replaces them anyway for parity with the TS side.
- **Fix the confirmed sink first, in its own commit.** `inc/seo.php` moves to the encoder before autoescape lands; it is a one-line, zero-risk change that closes the live breakout.
- **Double-escape detection is a test, not a review.** The regression suite seeds `Tom & Jerry's "Quotes"` into every field family and asserts exactly one level of escaping in the rendered HTML (`&amp;` not `&amp;amp;`).
- **Hostile fixtures live beside the existing sanitization tests** (`tests/test-blog-sanitization.php` pattern) and reuse WorDBless; no new harness.

## Risks / Trade-offs

- [Autoescape double-escapes values that PHP already escaped] → the sweep + the single-escape test; expected touch points are `inc/options.php`, `inc/identity.php`, `inc/pages.php` where `esc_html` is applied before handing to Twig.
- [A `|raw` is added later without kses] → the marker gate fails the build; the marker text names the sanitizer so review can check it.
- [Twig `html_attr` strategy differences] → existing `|e("html_attr")` sites are unaffected by the global `html` strategy (explicit filter wins).
- [Performance] → Twig escaping is negligible against page render; compiled templates are cached.

## Migration Plan

1. Add `inc/escaping.php` + encoder tests; switch `inc/seo.php` and `inc/shell.php` to it. Ship.
2. Add `tests/test-output-escaping.php` with hostile fixtures — red for the plain interpolations.
3. Enable autoescape; mark the 24 `|raw` sites; run the sweep until the suite is green and the single-escape assertions hold.
4. Add `bin/twig-audit.mjs` and its CI step; add the Next.js parity vector.
5. Re-run the theme's full suite + a manual pass over every template in both languages.

## Open Questions

- Should the ICS feed and RSS/feeds get the same hostile fixtures? (ICS escaping is already RFC 5545-correct; recommend adding the fixture anyway so it stays that way.)
- Keep `JSON_UNESCAPED_UNICODE` in JSON-LD, or emit pure ASCII for maximum safety? (Recommend keep; `HEX_*` flags cover the breakout.)
