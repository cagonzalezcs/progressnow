# Editor-Owned Pages: Richer Control for About / Get Involved

## Why

About and Get Involved landed with per-section ACF fields (`inc/pages.php`, commit 913099c), but editor control is shallow: prose fields are plain textareas (no links/emphasis), several Get Involved headings and both pages' nav/sidebar labels are hardcoded in Twig, and there is no way to hide a section that isn't ready (e.g. the timeline still shipping `20XX` placeholder years). Editors still need a developer for routine copy operations. The layer also has zero spec and zero test coverage.

## What Changes

- Upgrade prose textareas to basic-toolbar WYSIWYG (links, bold/italic, lists) on both pages: About chapter paragraphs, history intro, counties intro, committees intro, governance intro, dues body; Get Involved step bodies, committees intro, sidebar-card body. FAQ answers stay plain text — both pages share one FAQ field shape and the Get Involved FAQ hydrates the FaqAccordion island, which renders answers as text (rich answers would force an island change). Output passes `wp_kses_post` and renders unescaped in Twig.
- Per-section show/hide toggles: About (mission band, chapter, history, counties, committees, governance, FAQ, dues callout) and Get Involved (join steps, committees, channels, FAQ). Hidden sections drop out of the rendered page AND both on-this-page navs (mobile chip row + sticky sidebar). Section reorder is out of scope (fixed template order stays).
- Editable Get Involved section headings ("How to join", "Committees", "Communication channels", "Common questions") — parity with About, whose headings are already fields. On-page nav labels follow the headings on both pages.
- Editable Get Involved sidebar "Related" links (repeater, defaulted to current three links) and About "Join a committee →" cross-link (label + URL).
- Baseline hardening that this change touches anyway: PHPUnit coverage for `pages.php` context building (design-copy fallbacks, kses filtering, external-URL detection, empty-row dropping) — currently untested.

## Capabilities

### New Capabilities

- `editable-page-sections`: section-level editor control on templated interior pages (About, Get Involved) — WYSIWYG prose, visibility toggles wired to on-page navigation, editable headings/labels/links, with design-copy fallbacks so an unseeded page still renders the full prototype.

### Modified Capabilities

<!-- none — chapter-editable-content requirements (counties strip, lede, footer email, hero) are unchanged -->

## Impact

- `inc/pages.php` — field-group additions (WYSIWYG swaps, toggles, GI headings, related-links repeater) + context changes (visibility keys, kses'd rich bodies)
- `views/page-about.twig`, `views/page-get-involved.twig` — conditional sections, nav filtering, `|raw` on kses'd bodies
- `bin/seed.php` — seed rows for any new fields if seeded pages exist
- New `tests/test-pages.php` (WorDBless/PHPUnit)
- No REST, island, or schema changes — pages stay server-rendered Twig; FaqAccordion island props shape unchanged
