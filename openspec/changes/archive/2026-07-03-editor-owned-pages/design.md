# Design: editor-owned-pages

## Context

`inc/pages.php` (commit 913099c) owns two template-keyed ACF groups ("About page", "Get Involved page") and builds fully-defaulted Twig contexts (`about.*`, `gi.*`) — every field falls back to design copy so an unseeded page renders the prototype exactly. The Twigs (`page-about.twig`, `page-get-involved.twig`) render fixed section sequences with hardcoded on-page navs duplicated twice per page (mobile chip row + lg sticky sidebar). Helpers already exist for text-with-fallback (`legacy_pages_text`, with optional kses), repeater-with-fallback (`legacy_pages_rows`), and external-URL detection (`legacy_pages_external`). Committee rows live in Chapter Settings (`chapter.committees`), not in scope here. No PHPUnit coverage exists for any of it.

Constraints: pages stay server-rendered Twig (locked decision A — only BlogArchive/EventCalendar are REST-fed); FaqAccordion island props shape must not change; the always-set / designed-fallback context convention (island-empty-states) applies to every new key.

## Goals / Non-Goals

**Goals:**
- Editors can add links/emphasis/lists to prose bodies without a developer.
- Editors can hide any major section per page; the on-page navs follow automatically.
- Get Involved reaches heading-editability parity with About; hardcoded nav labels, Related links, and the About committee cross-link become fields.
- `pages.php` context building gets PHPUnit coverage.

**Non-Goals:**
- Section reordering (fixed template order stays; revisit only if editors ask).
- Flexible-content / Gutenberg page bodies (bigger rework, contradicts just-landed pages.php investment).
- Rich FAQ answers (would force FaqAccordion island change).
- New sections or design changes; committees editing (Chapter Settings owns it).

## Decisions

### D1: PHP-computed nav arrays replace hardcoded Twig navs
Add `about.nav` / `gi.nav` — ordered arrays of `{ href, label }` built in PHP from only the *visible* sections, labels sourced from the (editable) headings. Both nav copies in each Twig loop over the same array.
- *Why*: visibility filtering must hit page body + two nav copies in lockstep; one PHP source of truth beats three Twig conditionals per section. Also fixes the existing About bug class where nav labels and section headings can drift (nav already interpolates `about.*.heading`, GI nav is fully hardcoded).
- *Alternative rejected*: per-section `{% if %}` around each nav link in both navs — 2 pages × 2 navs × ~6 sections of duplicated conditions.

### D2: Visibility = ACF `true_false` per section, default on, tri-state-safe
One `*_show` toggle per section tab (e.g. `about_show_history`, `gi_show_channels`), read with the `interior.php` `show_grievance` pattern: `null`/`''` (field never saved) → visible. Context exposes booleans (e.g. `about.history.visible`); Twig wraps each section in one `{% if %}`.
- *Why*: existing pages must not change appearance on deploy; default-on tri-state handling is already proven in `inc/interior.php`.
- *Alternative rejected*: a single "sections" checkbox/multi-select field — worse editor UX than a toggle sitting on the section's own tab.

### D3: WYSIWYG swap keeps field names; kses at context-build time
Swap the listed textareas to `wysiwyg` (`media_upload => 0`, `toolbar => 'basic'`, `tabs => 'all'`) keeping the same field `name`s, so existing saved values survive (ACF stores both as post-meta strings). Contexts run `wp_kses_post` via the existing `legacy_pages_text( ..., $kses = true )` path; Twig outputs switch to `|raw`.
- *Why*: no migration needed; sanitization stays server-side in one place (matches `grievance_body` precedent).
- *Risk accepted*: WYSIWYG wraps content in `<p>` tags — templates that currently emit their own `<p class="...">` around the value must move the typography classes to a wrapper `div` with prose-styled descendants (e.g. `[&_p]:...` utilities or a small `@layer` rule), not keep the raw string inside a `<p>` (nested-`<p>` breakage).

### D4: New link fields reuse existing helpers
GI "Related" links: repeater mapped through the existing `legacy_pages_link_row`, defaulted to the current three hardcoded links. About "Join a committee →" cross-link: label + URL text fields through `legacy_pages_text` + `legacy_pages_external`. GI headings: plain text fields with current hardcoded strings as defaults.

### D5: Tests target context functions, not rendered Twig
New `tests/test-pages.php` (WorDBless, matching existing suite) calls `legacy_about_context()` / `legacy_get_involved_context()` / helpers directly: design-copy fallbacks when ACF absent/empty, kses stripping of disallowed markup, external-URL detection (relative, anchor, mailto, cross-host), empty-row dropping, visibility tri-state, nav array reflecting hidden sections.
- *Why*: Twig rendering needs Timber bootstrapping the suite doesn't do elsewhere; context shape is the contract the templates consume.

## Risks / Trade-offs

- [WYSIWYG output changes markup structure (`<p>` wrapping) and could regress the pixel-exact v2 skin] → move typography classes to wrappers per D3; browser-QA both pages against the design handoff after the swap.
- [Editor hides every section → page is just header + sidebar] → acceptable; each page keeps at least PageHeader + sidebar card. Empty nav renders nothing (nav markup gated on `nav|length`).
- [kses'd `|raw` output widens XSS surface if a future field skips the helper] → rule stays "every `|raw` in these templates must come from `legacy_pages_text(..., true)` or a kses'ing row mapper"; test asserts script tags are stripped.
- [Field-name reuse on type change: old plain-text values render as unwrapped text in WYSIWYG output] → fine — kses passes plain text through; renders identically inside the new wrapper.

## Migration Plan

No data migration. Deploy is additive: new fields default-empty (fallbacks fire), toggles default-on, WYSIWYG reads existing meta. Rollback = revert commit; saved rich-text meta degrades to escaped plain text under old templates (cosmetic only).

## Open Questions

- None blocking. Deferred by scope: section reorder; rich FAQ answers.
