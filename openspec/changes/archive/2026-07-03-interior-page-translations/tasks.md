## 1. Seed helper

- [x] 1.1 Add `legacy_seed_translate_page($en_id, $es_title, $es_slug, $es_fields = [])` to `bin/seed.php`, modeled on `legacy_seed_translate_event()`: `pll_get_post` guard → `wp_insert_post` (page, ES title/slug) → `pll_set_post_language('es')` → `pll_save_post_translations` → copy `_wp_page_template` meta → `update_field()` each entry in `$es_fields`.
- [x] 1.2 Idempotent + non-clobbering: on an existing ES page, only refresh the template link; never overwrite existing ES copy (fields written on create only).

## 2. ES page pairs — template/ACF-driven

- [x] 2.1 Calendar → ES title "Calendario de eventos" (slug `calendario`) + Spanish `lede`; template `page-templates/calendar.php` copied by the helper.
- [x] 2.2 About → ES title "Acerca de the chapter" (slug `acerca-de`), `lede`, and full "About page" ACF group in Spanish; internal links use `/es/` slugs; county/city proper nouns kept.
- [x] 2.3 Get Involved → ES title "Participa" (slug `participa`), `lede`, and full "Get Involved page" ACF group in Spanish.
- [x] 2.4 Blog posts page → ES title "Blog" (slug `blog`) + Spanish `lede`. *(Verify Polylang serves it as the ES `page_for_posts` after the seed run — task 7.2.)*
- [x] 2.5 EN-language backfill: already handled by the existing 6.9a block (`pll_set_post_language('en')` on untagged posts).

## 3. ES page pairs — prose-heavy (DEFERRED)

- [ ] 3.1 Bylaws & Code of Conduct — **deferred**. Body is governance prose that renders from the `page.twig` English fixture fallback; a coherent ES page needs human-authored Spanish `post_content` + `documents`/`grievance_body`. Creating a shell now would show Spanish title over English body. Track as a follow-up.
- [ ] 3.2 Privacy Policy — **deferred**. Legal `post_content` needs human authoring/review before translation.

## 4. Navigation & inter-page link localization

- [x] 4.1 `inc/i18n.php`: added `legacy_i18n_localize_url()` and applied it to `legacy_i18n_header_menus()` nav/about hrefs — on `es` they resolve to the target's translation permalink (preserving `#fragment`), falling back to `pll_home_url('es')` when untranslated.
- [x] 4.2 Localized the ES home's seeded inter-page links (`who_link_url` → `/es/acerca-de/`, home step → `/es/participa/#committees`).

## 5. Shared interior chrome strings

- [x] 5.1 Wrapped `page-about.twig` / `page-get-involved.twig` labels ("On this page", "Related", "Document", "What it covers", "Action") in `pll__()`.
- [x] 5.2 Registered those strings in `legacy_i18n_strings()` and added Spanish values to the seed's `legacy_seed_string_translations('es', …)` block.

## 6. Apply + cache

- [x] 6.1 Ran the seed via MAMP socket (`php -d mysqli.default_socket=… wp-load.php + seed.php`; wp-cli unavailable). Created ES pages #356 calendario / #357 blog / #358 acerca-de / #359 participa + 28 string translations; rewrites flushed. Note: the ES blog slug deduped to `blog-2` on first insert → added a slug re-assert to the helper so it reclaims `blog` (same slug across languages) once the language is set.

## 7. Verification — PASSED

- [x] 7.1 `/es/calendario/`, `/es/acerca-de/`, `/es/participa/`, `/es/blog/` → all **200** (were 301). EN pages still 200.
- [x] 7.2 Browser: Spanish body copy renders in full on `/es/acerca-de/` (all seeded ACF); Calendar island carries `lang:"es"` + Spanish lede; ES blog archive renders the `BlogArchive` island with `lang:"es"`; template context fired (About sections present → template meta copied).
- [x] 7.3 `/es/` header nav + About mega-menu link to `/es/` translations; switcher's ES link on the EN page targets the real `/es/acerca-de/` (not the home fallback).
- [x] 7.4 Re-ran the seed → all four pages log "exists", no duplicates, no `blog-2` orphan, edits not clobbered.
- [x] 7.5 Regression: EN interior pages unchanged (200, English nav).

## 8. Discovered follow-up (not in original scope)

- [ ] 8.1 **Vue-island UI strings are hardcoded English.** The `EventCalendar` island (Month/List/FILTER/category labels/"Never miss a meeting"/subscribe copy/empty states) and `BlogArchive` island (search/filter/pagination chrome) render English on `/es/` pages. Localizing requires passing `pll__()` strings as island props (or Vue i18n) + a rebuild. Sizeable separate effort — propose as its own change.
- [ ] 8.2 Bylaws + Privacy Spanish bodies (from §3), once human-authored.
- [ ] 8.3 Optional: localize `aria-label="On this page"`/`"Related pages"` attributes (screen-reader parity).
- [ ] 8.4 **Shared chapter options render English on `/es/`** (found in browser verify): the committees list (`get_field('committees','option')` → `legacy_chapter_committees()`) and other option-scoped repeaters (counties strip, home steps) are a single language-neutral store shared by About / Get Involved / front page — can't be per-post translated. Needs a "translate shared chapter options" strategy (per-language option values or registered string translations).
- [ ] 8.5 Hardcoded Twig button/labels still English on ES pages (e.g. About "Update my dues" CTA; audit page-about/page-get-involved/page-calendar for remaining literals) → wrap in `pll__()` + register/seed.
