# Progress Now

Chapter-neutral WordPress theme for a Progress Now chapter site. Everything that names or pictures the chapter is data (Chapter Settings → **Identity & brand**), and everything shipped in the repo is a generic placeholder — nothing regional, nothing chapter-specific.

## Stack

- **WordPress + Timber 2** (Twig templates) — routing + content
- **Vue 3** (Composition API, `<script setup lang="ts">`) — interactive islands (moving to the Nuxt 4 app in `site/`, see `openspec/changes/nuxt4-static-platform`)
- **Tailwind CSS v4** (CSS-first config in `src/css/tailwind.css`, no `tailwind.config.js`)
- **shadcn-vue** — project-owned component library generated into `src/components/ui/`
- **Vite 7** via `@kucrut/vite-for-wp` (npm) + `kucrut/vite-for-wp` (Composer) — dev server/HMR + production enqueue
- **ACF Pro** — field groups registered in PHP (see `inc/`), editable content in wp-admin
- **Polylang Pro** — EN at `/`, ES at `/es/…`

## Commands

```bash
npm run dev        # Vite dev server w/ HMR (reads .env; e.g. https://chapter.test:8890)
npm run build      # vue-tsc typecheck + production build to dist/
npm run typecheck  # vue-tsc only
npm run lint       # eslint
npm test           # vitest — category-token drift + contract fixtures
composer test      # PHPUnit (WorDBless) — no DB needed
```

## Chapter identity (`inc/identity.php`)

`progressnow_identity()` resolves the chapter's **name**, **short name** ("We are {short}", "{short} 101"), **region label** ("across {region}"), the hero **headline** (text by default — `A better world is possible!` — or uploaded artwork with alt text), and every brand image (header/footer/square logos, hero photo, who-we-are artwork, CTA panel, default share image). Each falls back to the placeholder in `static/images/brand/` (see its README). Social profile and newsletter URLs have **no** default: the footer icons, the Get Involved channel card, the subscribe strip, and JSON-LD `sameAs` render only when a URL is configured.

Every default string in `inc/options.php`, `inc/pages.php`, and the Twig ledes is built from the identity, so an unconfigured install reads as a generic chapter and never as a specific place. `tests/test-brand-audit.php` scans the shipped files, the seed (EN + ES), the rendered contexts, the ICS feed, and the SEO head for regional tokens.

**Migrating an existing database** (rename + scrub, idempotent, snapshot first): `bin/scrub-brand.sh --yes` (add `--dry-run` to preview). It rewrites the pre-rename identifiers to `progressnow*`, replaces the regional phrases in EN and ES content, re-runs the seed, and prints an audit of anything left.

## Architecture

### Frontend modes (`CHAPTER_FRONTEND`)

- **`islands`** (default) — the Vite islands described below.
- **`nuxt`** — the PHP shell + static Nuxt rendition (`site/`, openspec change
  `nuxt4-static-platform`): every page is still rendered by WordPress (SEO head,
  crawlable chrome/content, a `__SHELL_DATA__` route payload built by
  `inc/payloads.php`), then the Nuxt client mounts into `#__nuxt` and takes over.
  `inc/shell.php` reads the build's `shell-manifest.json`, emits the app tags,
  serves `/_nuxt/*`, `_payload.json` and the manifest from `CHAPTER_STATIC_DIR`
  (same-host mode), and records new builds; `inc/rebuild.php` dispatches
  rebuilds (GitHub `repository_dispatch` or a signed webhook) when content
  changes — nothing runs `node` on the host. Operate it from Chapter Settings →
  **Site build** or `wp chapter rebuild` / `wp chapter build-status`. Setup:
  `docs/deployment.md`.

### Vue islands on Timber

Twig renders page shells; Vue mounts on `[data-vue-island]` elements:

```twig
<div data-vue-island="EventCalendar" data-props='{{ props|json_encode|e("html_attr") }}'></div>
```

`src/ts/islands.ts` holds the registry (lazy `import()` per island — page JS stays small). Props are camelCase JSON. **There are no production fixture fallbacks** — PHP contexts always set their keys (possibly empty) and islands render designed empty states; the design fixtures live in `src/lib/fixtures/` for the styleguide only. Islands: `SiteHeader`, `SiteFooter`, `PageHeader`, `FaqAccordion`, `EventCalendar`, `BlogArchive`, `SinglePost`, `SingleEvent`, `Styleguide`.

**Embedded vs fetched:** chrome islands, front-page sections, and `SinglePost` receive embedded props (first paint, SEO — `single.twig` also server-renders the article inside the mount element as the crawlable/no-JS fallback). `BlogArchive` embeds its first browse page and fetches every interaction (search/filter/page, debounced + abortable) from the REST layer; `EventCalendar` fetches its whole window on mount with a skeleton. Client code: `src/lib/api.ts`.

### WP data layer (`inc/`, one file per domain)

| File | Owns |
|---|---|
| `inc/identity.php` | Chapter Settings → Identity & brand: name/short name/region label, headline, brand media with placeholder fallbacks |
| `inc/events.php` | `event` CPT, `event_category` taxonomy + color term meta, event ACF fields, ICS feed (`/feed/chapter-events/`; legacy slugs 301), ChapterEvent serialization |
| `inc/blog.php` | category term colors, post settings (dek, byline mode, committee…), post_content block → BlogPost/SinglePostData serialization (`progressnow_blog_blocks_from_content`) |
| `inc/blocks.php` | the six `progressnow/*` ACF blocks (`blocks/*/block.json`), gallery block styles, restricted 14-block post inserter, attachment `credit` field |
| `inc/rest.php` | `progressnow/v1` read API (`/posts`, `/posts/{slug}`, `/events`, `/categories`), transient + ETag/304 caching |
| `inc/categories.php` | canonical category registry (`categories.json`), term-name/color merge, canonical-slug rename guard |
| `inc/cache.php` | `progressnow_cache_remember()` transient helper + content-version invalidation |
| `inc/options.php` | "Chapter Settings" ACF options page (committees, areas, contact email, newsletter URL, socials, footer tagline, the sidebar "Get involved" card…), the front-page Home hero + Home sections groups, menu locations, chrome props |
| `inc/interior.php` | governing-documents repeater, page lede + search-description overrides, and the grievance callout (toggle + wysiwyg) on pages |
| `inc/pages.php` | About + Get Involved page ACF groups (mission band, timeline, area cards, governance docs, FAQ repeaters, join steps, channels, sidebar cards) + their Twig contexts, defaulted in PHP to neutral copy |
| `inc/seo.php` | head SEO output: meta description, canonical, robots, Open Graph/Twitter cards, JSON-LD (`wp_head` priority 5) |
| `inc/i18n.php` | Polylang: `event` CPT translatable, language switcher context, registered UI strings ("Chapter" group), translated header menus |

Template routers (`front-page.php`, `page.php`, `index.php`, `single.php`, …) expose filters (`progressnow/context/front_page`, `…/page`, `…/blog_archive`, `…/single`) the domain files hook to inject island props.

The calendar is driven by the **"Calendar" page template** (`page-templates/calendar.php`), not a magic `calendar` slug — assign it under Page Attributes → Template (the seeder does this). **About** and **Get Involved** work the same way (`page-templates/about.php`, `page-templates/get-involved.php`).

**Editable content contract:** every content area in the templates is editable in wp-admin — ACF groups registered in PHP (`inc/`, never DB-only; `acf-json/` catches any group edited via the UI). Every field falls back in PHP to neutral copy, so an empty field renders a complete, generic page. Page headers take the WP page title + the Interior "Lede" field. The header About▾ dropdown is the `about` menu location; the footer tagline and the shared sidebar "Get involved" card (About + interior pages; Get Involved has its own page-level card) live in Chapter Settings.

Category slugs `chapter | poled | mutual | labor | electoral | social` are load-bearing (URLs + Vue types) — don't rename terms. Colors live on the terms (ACF color picker) and flow to the islands via props.

### Adding a shadcn-vue component

```bash
npx shadcn-vue@latest add <component>   # respects components.json; generates into src/components/ui/
```

Re-theme via the semantic CSS variables in `src/css/tailwind.css`, not per-component forks. Demo every component on the styleguide page (`/styleguide/`, mounted from `views/page-styleguide.twig`).

### Design system (v4)

The whole site reads one token set declared in `src/css/tailwind.css` (`@theme`, role names — never color names): `brand` `#1848D8` (bands, pills, chips), `brand-deep` `#0F2E9C` (hover/invert, headline offset shadow, the high-contrast swap), `accent` `#0E62E6` (links, filled buttons — 5.4:1 on white), `brand-light` `#A9C7FF` (stars, dashed borders, eyebrows on ink — never text on it), `alt` `#F2F5FB`, `ink` `#1B1B22`, `yellow` `#FFC800`, `muted` / `muted-on-ink`, `text-body`, `line` / `control` / `control-faint` / `border-muted`, `cta-card`, `ink-hairline`. There are no v3 aliases left (`red`, `orange`, `cream`, `tint`, `brutal-*`… are gone — the last v4 change grep-gates them).

- **Fonts** (`static/fonts/`, self-hosted, preloaded by `StarterSite::preload_fonts()`): Public Sans variable (`PublicSans[wght].woff2`, body — 500 default, 600 ledes, 700 emphasis, 800 eyebrows), Bowlby One (display: headings, nav, pills, month label — 400 only, never faux-bold), Special Season Brush (the home CTA line).
- **Tones**: every band carries `data-tone="blue|white|alt|ink"`; the a11y widget's high-contrast mode re-colors bands by tone (`useA11ySettings.ts`) and the focus ring flips to white on `blue`/`ink`.
- **Radius**: 20px cards/figures/callouts (18px tablet, 16px mobile), 14px disclosure rows and agenda rows (12px mobile), 10–12px nav pills and tiles, 999 for pills and breadcrumbs; shadcn `--radius` is 4px.
- **Shared source**: `src/components/site/**`, `src/components/ui/**`, `src/composables/useA11ySettings.ts`, `src/lib/schemas.ts` and `src/css/tailwind.css` are copied verbatim into `site/app/` (the Nuxt rendition) — edit here, re-copy, and `site/test/unit/shared-source-drift.test.ts` fails on drift. Twig twins in `views/partials/` (`page-header`, `cta-card`, `link-list-card`, `dashed-note`, `subscribe-strip`, `duotone`, `star`) and the static header/footer shell in `views/base.twig` must keep the same class literals as their Vue components.
- **Photos** render full color (the canvas's grayscale + brand-multiply duotone was retired 2026-09-05); the `.duotone` wrapper only clips to the slot's radius.

### Styling conventions

- Inline Tailwind utilities in templates; extract to `cva()` variants only when a pattern repeats.
- Every component root gets one kebab-case block class (`site-header`, `event-calendar`) — a style-free hook for debugging/tests.
- Accessibility: a11y widget settings persist to localStorage `chapter-a11y` (migrated from the pre-rename key on first load); respect `prefers-reduced-motion`; keep ≥4.5:1 label contrast in hover states.

### REST API (`/wp-json/progressnow/v1`)

GET-only, public, publish-only; handlers reuse the domain serializers so REST shapes match the embedded contexts by construction. Additive changes stay on `/v1`; renames/removals go to `/v2`.

| Route | Returns |
|---|---|
| `/posts?page&per_page&category&s&lang` | `{ posts: BlogPost[], page, perPage, total, totalPages }` |
| `/posts/{slug}?lang` | `SinglePostData` + `readNext: BlogPost[]` + `languages` (404 `progressnow_post_not_found`) |
| `/events?after&before&lang` | `{ events: ChapterEvent[], categories }` (default −1 → +12 months) |
| `/categories` | `{ categories: EventCategory[] }` |

Anonymous responses carry `Cache-Control: public, max-age=300, stale-while-revalidate=3600` + ETag/304; logged-in requests are `no-store`. Payloads are transient-cached via `progressnow_cache_remember()`.

### Contract governance

`src/lib/schemas.ts` (zod) is the single contract definition — `posts.ts`/`events.ts` re-export `z.infer` types, and the API client validates responses (throws in dev, error state in prod). The PHP↔TS bridge is `tests/fixtures/*.json`, asserted from both sides: PHPUnit byte-equality (`tests/test-contracts.php`) and vitest zod parse (`src/lib/__tests__/contracts.spec.ts`). A contract change fails one side until both agree. Regenerate fixtures deliberately:

```bash
PROGRESSNOW_WRITE_FIXTURES=1 vendor/bin/phpunit --filter TestContracts
```

### SEO (`inc/seo.php`)

Hand-rolled head output (no SEO plugin) hooked once at `wp_head` priority 5; every copy/image source is the same first-party data the islands use. Emitted on every page: `<meta name="description">`, `rel=canonical`, OG set (`og:site_name` = chapter name, `og:type/title/description/url/image` + `width/height/alt` when known), `twitter:card`, and one JSON-LD `@graph` script.

**Description ladder** (plain-text, ~155 chars, word-boundary trim): post → dek → excerpt; page → `seo_description` (interior group) → lede → tagline; posts page uses the page ladder on the `page_for_posts` page; event → post content; front page → hero lede. Empty tagline bottoms out at the hero-lede default copy — never empty.

**Canonical + robots:** singular pages get their permalink (core's `rel_canonical` is removed — this file owns the tag); island filter params (`?s=` / `?category=` / `?paged=`) canonicalize to the clean posts-page URL while server-paged `/page/N/` keeps its own. `noindex,follow` on search, filtered archive states, date/author archives, and 404.

**Share image ladder:** featured image (`large`) → Chapter Settings **Default share image** → the shipped `static/images/brand/share-default.jpg`. A per-content image cards as `summary_large_image`; fallbacks card as `summary`.

**JSON-LD:** `Organization` site-wide (chapter name, `logo` = square logo, `sameAs` only from configured socials); `Article` on posts (author is a Person, or the committee as an Organization per byline mode); `Event` on event permalinks (chapter-tz ISO-8601 start/end, `Place` from venue/city, `offers` → RSVP URL — same fields as the ICS feed).

## Testing

```bash
composer test   # PHPUnit via WorDBless (no DB/WP install needed)
npm test        # vitest — category-token drift + contract fixtures
```

PHPUnit runs on [WorDBless](https://github.com/Automattic/wordbless): the first run creates a `wordpress/` directory in the theme (the WorDBless WP install + a symlink back to the theme). It is a test artifact — **untracked and expected**, not part of the theme. ACF Pro is absent under WorDBless, so `tests/bootstrap.php` polyfills `get_field()` (post meta / options / term meta backed).

## Seeding demo content

Idempotent seed (categories + colors, 14 events with placeholder venues, lorem posts covering every block type, menus, options, interior documents, the Spanish translations):

```bash
wp eval-file wp-content/themes/progressnow/bin/seed.php
```

Local MAMP invocation (socket + noisy-PHP workaround):

```bash
php -d error_reporting=0 -d display_errors=0 \
  -d mysqli.default_socket=/Applications/MAMP/tmp/mysql/mysql.sock \
  /Applications/MAMP/Library/bin/wp --path=/path/to/site \
  eval-file wp-content/themes/progressnow/bin/seed.php
```

Working in a git worktree? `bin/worktree-bootstrap.sh /path/to/full-checkout` symlinks the untracked WordPress runtime into the worktree (it shares the database — snapshot first).

## Translations (EN/ES)

Real translated content via **Polylang Pro** — English at `/`, Spanish at `/es/…`. No machine translation: each language is its own content, and the header EN/ES toggle is a plain language switcher (an `<a>` to the current page's translation).

**Setup (Polylang, one-time):** languages EN (`en_US`, default) + ES (`es`, `es_MX`); URL modifications = language in the directory with the default language hidden; pretty permalinks on. The `event` CPT is made translatable in code (`pll_get_post_types` filter in `inc/i18n.php`); `page`/`post` are translatable by default.

**Theme layer:** `inc/i18n.php` — builds the `languages` switcher context (each language's translation URL via `pll_the_languages`), exposes `pll__`/`pll_e` as Twig functions, registers the theme's static UI strings (group "Chapter"), and passes Polylang-translated header nav labels + `joinLabel`/`aboutLabel` to the `SiteHeader` island. Front-page BODY copy (hero, who-we-are) is **not** string-translated — it comes from the Spanish page's own ACF fields. `inc/options.php` reads that ACF from the **current** front page, so `/es/` serves the Spanish page's fields.

**Language-filtered teasers:** `progressnow_events_query()` passes the current language (`get_posts` would otherwise bypass Polylang via `suppress_filters`); the blog query is a `WP_Query` Polylang filters automatically.

**Seeding (`bin/seed.php`):** backfills `en` on untagged posts, creates the Spanish front page (linked to the EN home) with Spanish ACF copy, seeds `es` string translations (via `PLL_MO`), creates Spanish translations of the upcoming events, and the Spanish interior pages. Spanish pages are written on create only — re-running the seed never clobbers an editor's Spanish edits.

**Gotchas / known items:**
- After creating front-page translations programmatically, run `PLL()->model->clean_languages_cache()` + `flush_rewrite_rules()` — Polylang caches each language's `page_on_front`. The seed handles this via its final rewrite flush.
- The Spanish home resolves at `/es/inicio/` (Polylang 301s bare `/es/` there). Making `/es/` the canonical front-page URL is a pending refinement.
- Event teaser **dates** render in English (`DateTimeImmutable::format` isn't locale-aware); switch to `wp_date()`/`date_i18n` to localize — deferred.
- The blog demo posts are lorem-ipsum, so the Spanish home shows the translated "Posts coming soon" empty state rather than seeded ES posts.
