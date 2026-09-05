# Tasks: editor-owned-pages

## 1. Fields (inc/pages.php ACF groups)

- [x] 1.1 Add per-section `*_show` true_false toggles (default 1, ui) to each section tab — About: mission band, chapter, history, counties, committees, governance, FAQ, dues; GI: join, committees, channels, FAQ
- [x] 1.2 Swap prose textareas → wysiwyg (`media_upload => 0`, `toolbar => 'basic'`), same field names — About: intro_p1, intro_p2, history_body, counties_intro, committees_intro, governance_intro, dues_body; GI: steps body sub-field, committees_intro, card_body
- [x] 1.3 Add GI heading text fields on each tab: `gi_join_heading`, `gi_committees_heading`, `gi_channels_heading`, `gi_faq_heading`
- [x] 1.4 Add GI `gi_related_links` repeater (label + url, table layout) on a Sidebar tab; add About `about_committees_link_label` / `about_committees_link_url` fields
- [x] 1.5 Leave FAQ answer sub-fields as textarea (shared shape; island renders plain text)

## 2. Contexts (inc/pages.php builders)

- [x] 2.1 Add tri-state visibility reader (null/'' → true, else bool) and expose `visible` per section in `about.*` / `gi.*`
- [x] 2.2 Route swapped wysiwyg fields through `legacy_pages_text( ..., $kses = true )`
- [x] 2.3 GI headings via `legacy_pages_text` with current hardcoded strings as defaults; expose as `gi.join.heading` etc.
- [x] 2.4 `gi.related` via `legacy_pages_rows` + `legacy_pages_link_row`, defaulted to the current three links; `about.committees.link` (label/url/external) with current defaults
- [x] 2.5 Build `about.nav` / `gi.nav` arrays `{ href, label }` from visible sections only, labels from headings

## 3. Templates

- [x] 3.1 page-about.twig: wrap each section in its `visible` check; both navs loop `about.nav`; nav markup gated on `about.nav|length`
- [x] 3.2 page-about.twig: rich bodies output `|raw` inside prose wrappers (typography classes moved off `<p>` per design D3); committee cross-link from `about.committees.link`
- [x] 3.3 page-get-involved.twig: section `visible` checks; headings from `gi.*.heading`; both navs loop `gi.nav`
- [x] 3.4 page-get-involved.twig: step bodies / committees intro / card body `|raw` in prose wrappers; Related sidebar loops `gi.related` with external target/rel

## 4. Seed + docs

- [x] 4.1 bin/seed.php: confirm About/GI seeding still valid with new fields (toggles unset = visible); add related-links/heading seeds only if seeder writes those pages
- [x] 4.2 Update inc/pages.php header comment (ownership: sections, visibility, nav arrays)

## 5. Tests

- [x] 5.1 New tests/test-pages.php (WorDBless): design-copy fallbacks for both contexts with no ACF values
- [x] 5.2 Kses: script/event-handler markup stripped from rich fields; plain-text legacy values pass through unchanged
- [x] 5.3 `legacy_pages_external`: relative, #anchor, mailto, same-host, cross-host
- [x] 5.4 Repeater row dropping (missing title/label/url) + empty-repeater fallback for gi_related_links
- [x] 5.5 Visibility tri-state (unset/''→true, 0→false) and nav arrays excluding hidden sections / empty when all hidden

## 6. Verify

- [x] 6.1 `composer test` + `npm run build` green
- [x] 6.2 Browser QA vs design handoff: unseeded pages pixel-match prototype; toggle a section off → body + both navs drop it; rich link renders; no nested-`<p>` artifacts
