## Context

Polylang Pro is live: `en_US` default at `/`, `es_ES` at `/es/`; `page`/`post`/`event` are translatable; the front page is a translated pair (`home` ↔ `inicio`, id 294) whose Spanish ACF copy is seeded per-post in `bin/seed.php` (~L987–1060). Header/footer chrome and static strings translate via `pll_register_string`/`pll__`.

The gap: no interior `page` has a Spanish translation. `pll_save_post_translations` only links `home`↔`inicio`; the other pages have language `en` and no `es` sibling. Polylang therefore 301-redirects every untranslated `/es/<slug>/` to its English page (confirmed for calendar, about, get-involved, blog, bylaws, privacy).

Interior pages in scope (published, non-dev). The "Interior page" ACF group (`inc/interior.php`) attaches a `lede` (+ `documents`, `grievance_body`) to **every** `page`; About/Get-Involved add large per-page ACF groups (`inc/pages.php`).

| EN slug | EN title | template | editable content source |
| --- | --- | --- | --- |
| `calendar` | Event Calendar | `page-templates/calendar.php` | title + `lede` (events are REST, already lang-filtered) |
| `about` | About the chapter | `page-templates/about.php` | title + `lede` + "About page" ACF group |
| `get-involved` | Get involved | `page-templates/get-involved.php` | title + `lede` + "Get Involved page" ACF group |
| `blog` | Blog | default (`page_for_posts`) | title + `lede` (`posts_page_lede`); posts are REST, lang-filtered |
| `bylaws-code-of-conduct` | — | default `page.twig` | title + `lede` + `documents` + `grievance_body`; heavy **English fixture prose** fallback |
| `privacy-policy` | — | default `page.twig` | title + editor `post_content` |

`styleguide` and `sample-page` are dev/default WP and are excluded.

Existing seed helpers to model after: `legacy_seed_template_page($slug,$title,$template)` (creates EN page + sets template meta) and `legacy_seed_translate_event($en_id,$es_title)` (inserts ES event, copies meta, `pll_set_post_language` + `pll_save_post_translations`). The new page helper mirrors the latter.

## Goals / Non-Goals

**Goals:**
- Every in-scope interior page has an `es` translation linked to its `en` original, carrying the same page template, resolvable at a `/es/…` URL (no 301 to English).
- Each Spanish page carries real Spanish title + lede + per-page body copy as an **editable draft** (editors own it, independent of English).
- Navigation and in-page links on the Spanish site resolve to `/es/` translations.
- Seeding is idempotent (create-or-update, no duplicates), matching the ES-home pattern.

**Non-Goals:**
- Translating blog **posts** or **events** (separate content changes) — the ES blog archive shows its language-filtered empty state until posts exist.
- Any REST/query changes — interior lists already filter by language (done in the REST i18n fix).
- Machine translation. Spanish copy is human-authored seed values, editable in wp-admin.
- Translating dev pages (styleguide) or `sample-page`.

## Decisions

**1. Seed-driven page pairs, reusing the ES-home mechanism.**
Extend `bin/seed.php` with one create-or-update block per interior page: `pll_get_post($en_id,'es')` guard → `wp_insert_post` (ES title, slug, `post_status` draft) → `pll_set_post_language($es_id,'es')` → `pll_save_post_translations(['en'=>$en_id,'es'=>$es_id])` → **copy `_wp_page_template` meta** → `update_field()` the Spanish ACF/lede values. Rationale: single reproducible source of truth, identical to the front page; alternative (hand-authoring in wp-admin) is not reproducible across environments and drifts. Factor the repeated logic into a small `legacy_seed_translate_page($en_id, $es_title, $es_slug, $es_fields)` helper, modeled on the existing `legacy_seed_translate_event()`.

Copying the template meta is **load-bearing, not cosmetic** (D9): the About/Get-Involved/Calendar context filters gate on `is_page_template(...)` (with a slug fallback of `'about'`/`'get-involved'` that the Spanish slug will *not* match). Without the ES page's `_wp_page_template`, its island/context never wires up and the page renders bare.

**2. Translated Spanish slugs** (`/es/calendario/`, `/es/acerca-de/`, `/es/participa/`, `/es/blog/`, `/es/estatutos-y-codigo-de-conducta/`, `/es/politica-de-privacidad/`).
Polylang stores a slug per translation; Spanish slugs read better and match the front page precedent (`inicio`). Alternative (reuse English slugs under `/es/`) is less work but worse UX/SEO. Slugs are seeded once and editor-overridable. *(See Open Questions — easy to switch to English slugs.)*

**3. `page_for_posts` resolved per language.**
Link the ES blog page as the translation of the EN `blog` page; Polylang Pro maps `page_for_posts` from the translation link, so `/es/blog/` serves the Spanish posts page. Verify the ES blog archive renders (its language-filtered empty state) rather than 301-ing; if Polylang doesn't auto-resolve it in this setup, register the ES page as the ES posts page explicitly.

**6. Static Twig chrome — translate the shared labels, rely on ACF/`post_content` for body.**
The interior views carry hardcoded English that is *neither* ACF nor a `pll__()` string: `views/page.twig` sidebar/labels ("On this page", "Governing documents", "Related", the grievance callout, and the **English fixture prose** shown when `post.content` is empty) and static fallback labels in `page-calendar.twig` / `page-about.twig` / `page-get-involved.twig`. On `/es/` these render English unless addressed. Decision: wrap the shared, user-facing chrome labels in `pll__()` and register them via `legacy_i18n_strings()` (the established D4 mechanism); rely on the seeded ES ACF values / `post_content` for body copy so seeded pages never hit the English fixture fallback. Bylaws' governance prose and Privacy's legal `post_content` are heavy human-authored copy — see Non-Goals / Open Questions for whether their full bodies land in this change or a follow-up.

**4. Language-aware navigation.**
`legacy_i18n_header_menus()` currently hardcodes English hrefs (`/calendar/`, `/blog/`, `/about/#…`) with only labels translated. On the Spanish site these must point at `/es/` equivalents. Prefer resolving each nav target's translated permalink via Polylang (`pll_get_post` + `get_permalink`, or `pll_home_url`-relative), so hrefs follow the translation links rather than a hardcoded map. Same for the front page's `who_link_url` (`/about/`) and other inter-page ACF links seeded for the ES home. Alternative (per-language WP nav menus, as the i18n spec mentions) is heavier; the programmatic approach reuses existing translation links.

**5. Published, matching the ES home.** ES pages are seeded `publish` (the ES home is published, and a draft would 404 / not resolve at its `/es/` URL, defeating the fix). Review happens on the dev site before the production deploy; the non-clobber guard means a re-seed never overwrites an editor's Spanish edits.

**7. Vue-island UI strings are out of scope (discovered during apply).** The `EventCalendar` and `BlogArchive` islands carry hardcoded English UI copy (Month/List/FILTER/category labels/subscribe/empty states) that is neither ACF nor `pll__()`. On the new `/es/` calendar/blog pages the page title + lede render Spanish but this island chrome stays English until localized (props from `pll__()` + a rebuild, or Vue i18n). Tracked as a follow-up (tasks §8), proposed as its own change rather than ballooning this one.

## Risks / Trade-offs

- **Untranslated deep links / anchors** (e.g. `/about/#mission`) → the ES nav should point at `/es/acerca-de/#mission`; anchor ids are language-neutral so only the path localizes. Mitigation: resolve the base permalink via Polylang, keep the `#fragment`.
- **Seed drift vs editor edits** → re-running the seed could overwrite editor changes to ES pages. Mitigation: the create-or-update guard only sets ACF values on **create** (or behind an explicit `--force`), never clobbering an existing ES page's fields — mirror how the ES-home block behaves.
- **Slug collisions / rewrite cache** → new pages need a rewrite flush and Polylang languages-cache clear (already part of the seed's post-run steps per `polylang-translations`). Mitigation: run the existing `PLL()->model->clean_languages_cache()` + `flush_rewrite_rules()` step after seeding.
- **Per-page ACF stored as `option` vs per-post** → if any interior ACF reads from `'option'` storage, the ES page can't carry independent values. Mitigation: confirm interior content is per-post; note any `option`-scoped fields as shared (language-neutral) or requiring string translation instead.

## Migration Plan

1. Add the `legacy_seed_translate_page()` helper + one seeding block per interior page to `bin/seed.php`.
2. Localize nav/link hrefs in `inc/i18n.php` (and ES-home seeded link fields).
3. Run the seed; run the rewrite-flush + Polylang cache-clear step.
4. Verify each `/es/<slug>/` resolves (200, Spanish title/lede) and the switcher round-trips EN↔ES on every interior page.
5. Rollback: unpublish/trash the ES pages and revert `bin/seed.php` + `inc/i18n.php`; English pages are untouched throughout.

## Open Questions

- ES slugs translated (`/es/calendario/`) or English-under-`/es/` (`/es/calendar/`)? Design assumes translated.
- Is `privacy-policy` in scope now, or deferred (legal copy may need review)?
- Seed the Spanish body copy for `about` / `get-involved` in full, or seed title+lede only and leave body sections for editors? (Front page seeded full copy.)
