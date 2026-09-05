## Why

The Polylang migration translated the front page, header/footer chrome, and static strings, but **no interior page has a Spanish translation**. Every `/es/` interior URL (`/es/calendar/`, `/es/about/`, `/es/get-involved/`, `/es/blog/`, `/es/bylaws-code-of-conduct/`) 301-redirects to its English page, so a Spanish visitor who clicks into the site is silently dropped back into English. The `/es/` experience currently dead-ends at the home page.

## What Changes

- Create a Polylang Spanish translation **page pair** for each public interior page, linked to its English original, carrying the same page template: **Calendar**, **About**, **Get Involved**, **Blog** (the `page_for_posts` page), **Bylaws & Code of Conduct**, and **Privacy Policy**.
- Seed each Spanish page's editable content (page title + ACF `lede` + any per-page ACF body copy) with real Spanish values as editable drafts, mirroring the front-page pattern already in `bin/seed.php` — editors own the Spanish copy independently of the English page.
- Point the Spanish header/footer navigation and in-page links at the `/es/` translations instead of the canonical English paths, so navigation inside the Spanish site stays in Spanish.
- Extend the idempotent seed so re-running it creates-or-updates the interior ES pages without duplicating them (same `pll_get_post`-guarded pattern as the ES home).
- The blog archive on `/es/blog/` shows the language-filtered (already fixed) empty state until Spanish posts exist — this change delivers the page shell, not translated blog posts (a separate change).

## Capabilities

### New Capabilities
<!-- none — this extends the existing internationalization capability -->

### Modified Capabilities
- `internationalization`: add a requirement that **public interior pages are translated page pairs** (parallel to the existing "Static front page is a translated page pair" requirement), and extend the navigation requirement so the Spanish site's nav/links resolve to `/es/` translation URLs.

## Impact

- **Content / data**: new Spanish `page` posts (one per interior page) linked via `pll_save_post_translations`; `page_for_posts` resolved per language for the ES blog page.
- **Code**: `bin/seed.php` (new ES interior-page seeding block, ES ACF/lede values); `inc/i18n.php` (`rgvdsa_i18n_header_menus` hrefs → language-aware `/es/` URLs, or per-language WP menus); possibly `inc/pages.php` / `inc/interior.php` / `inc/blog.php` where interior ACF content is read, to confirm per-post (not `option`) storage so ES values are independent.
- **No REST/query changes**: interior-page event/post lists already filter by language (fixed in the REST i18n change); this change only adds the page shells + Spanish copy.
- **Dependencies**: builds on the completed `polylang-translations` change (Polylang config, translatable post types, switcher).
