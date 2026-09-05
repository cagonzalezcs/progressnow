# Progress Now

A chapter-neutral organizing-site kit for a **Progress Now** chapter: one WordPress theme that owns content, SEO and editing, and **three interchangeable frontends** for the public site — the server-rendered PHP theme itself, a Nuxt 4 static rendition that takes over from a PHP shell, and a headless Next.js app on its own origin. An install picks one; the CMS, the REST API and the contracts are the same for all three. Everything that names or pictures a chapter is data in wp-admin; everything shipped in the repo is a generic placeholder.

Bilingual (EN at `/`, ES at `/es/…`), accessible (WCAG 2.2 AA target, built-in text-size / high-contrast / reduced-motion controls), no analytics, no third-party trackers.

> This repository is a fresh start. The code was developed 2026-05 → 2026-09 for a single chapter (RGV DSA), then renamed, brand-scrubbed and re-platformed onto Nuxt 4. The design and decision history lives in `openspec/` (see [History](#history)); the original git history is not carried over.

---

## Contents

- [What you get](#what-you-get)
- [Frontends: pick one](#frontends-pick-one)
- [Architecture](#architecture)
- [Repository layout](#repository-layout)
- [Requirements](#requirements)
- [Local development](#local-development)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Content model](#content-model)
- [REST API](#rest-api)
- [Design system](#design-system)
- [Testing](#testing)
- [OpenSpec workflow](#openspec-workflow)
- [History](#history)
- [Roadmap](#roadmap)
- [License](#license)

---

## What you get

| Surface | Notes |
|---|---|
| **Home** | Hero (real-text Bowlby headline, star art, photo), Who we are, Upcoming events band, From the blog, closing CTA with editor-owned line |
| **Blog** | Archive with category chips + search + pagination (server-side via REST), featured card, filtered mode, dashed no-match state; single post with hero, prose blocks, sticky sidebar, "Read next" |
| **Events** | Calendar page (month grid / list toggle, category legend, windowed fetch), single event (date tile, RSVP + add-to-calendar, agenda, "Good to know"), ICS feed at `/feed/chapter-events/` |
| **Interior** | About and Get Involved page templates with per-section ACF fields, show/hide toggles, WYSIWYG prose, FAQ disclosure rows, documents list; generic page template; 404 |
| **Chrome** | Header (wordmark lockup or uploaded logo, About ▾ menu, Join pill, EN/ES, a11y widget, mobile panel), footer (three columns, socials only when configured) |
| **Authoring** | Gutenberg posts restricted to 14 blocks (8 core + 6 `progressnow/*` ACF blocks: person-quote, video, audio, document, event-embed, action-callout); `event` CPT with `event_category` taxonomy; Chapter Settings options page |
| **SEO** | Hand-rolled head: description ladder, canonical, robots, Open Graph / Twitter cards, JSON-LD `Organization` / `Article` / `Event`. No SEO plugin |
| **i18n** | Polylang Pro page pairs for every public page, translated menus and UI strings, language-filtered queries |
| **Ops** | Chapter Settings → **Site build** panel, `wp chapter rebuild` / `wp chapter build-status`, GitHub Actions rebuild workflow, optional Terraform for S3 + CloudFront |

## Frontends: pick one

| | **PHP theme** (`wp-content/themes/progressnow`) | **`nuxt-js/`** — Nuxt 4 static rendition | **`next-js/`** — headless Next.js |
|---|---|---|---|
| Who renders the page | WordPress/Timber, every request | WordPress renders a shell; the Nuxt client mounts into it and navigates from a prerendered static build | Next.js on its own origin (SSR + cached data); WordPress is CMS + API only |
| Runtime on the WordPress host | PHP only | PHP only (build runs in CI or a webhook receiver) | PHP only; Node runs wherever the Next app is hosted |
| Public origin | the WordPress domain | the WordPress domain | a separate origin (e.g. `app.<domain>`); the PHP theme keeps serving the WordPress domain |
| Freshness | immediate | rebuild on content change (debounced), freshness guard in between | push revalidation on content change (signed webhook), no rebuild |
| `CHAPTER_FRONTEND` | `islands` (default) | `nuxt` | `islands` (the PHP theme stays server-rendered) |
| `CHAPTER_REBUILD_TRANSPORT` | `none` | `github` or `webhook` (+ `CHAPTER_STATIC_DIR` / `CHAPTER_STATIC_ORIGIN`) | `webhook` → `<next-origin>/api/rebuild` (+ `CHAPTER_REBUILD_SECRET`) |
| `CHAPTER_CANONICAL_ORIGIN` | unset | unset | the Next origin, so canonical / `hreflang` / `og:url` / sitemap point at the public frontend |
| Status | shipping | `nuxt4-static-platform` 51/59 tasks | `next-js-site-implementation` in progress (see Roadmap) |

Run one JS frontend per install. Both JS apps read `GET /wp-json/progressnow/v1/*`, share the theme's zod contracts, Tailwind tokens and category registry by drift test, and reproduce every route in both languages.

## Architecture

```
                    ┌─────────────────────────────────────────────┐
  visitor ───────►  │  WordPress + Timber (wp-content/themes/      │
  (every URL)       │  progressnow)                                │
                    │  • full SEO head (inc/seo.php)               │
                    │  • crawlable header/content/footer in #__nuxt│
                    │  • __SHELL_DATA__ route payload (payloads.php)│
                    │  • <script>/<link> tags from shell-manifest  │
                    └───────────────┬─────────────────────────────┘
                                    │ mounts into #__nuxt
                    ┌───────────────▼─────────────────────────────┐
                    │  Nuxt 4 client (nuxt-js/)                       │
                    │  1. landing route from __SHELL_DATA__        │
                    │  2. later navigations from prerendered       │
                    │     …/_payload.json                          │
                    │  3. REST fallback for search/filter/calendar │
                    │     and while a rebuild is in flight         │
                    └─────────────────────────────────────────────┘

  editor saves ─► content version bump ─► inc/rebuild.php (debounce 90 s)
     ─► GitHub repository_dispatch | signed webhook
     ─► `nuxt generate` from GET /wp-json/progressnow/v1/*
     ─► rsync | S3 (manifest uploaded last) ─► POST /build-status ─► cache purge

  ── headless alternative (next-js/) ──────────────────────────────────────────
  visitor ───────►  Next.js (own origin, SSR from cached progressnow/v1 envelopes)
  editor saves ─► content version bump ─► signed webhook ─► POST /api/rebuild
     ─► revalidate cache tags ─► (optional) POST /build-status ─► WordPress marks live
```

Key properties:

- **PHP first, always.** Crawlers, deep links and no-JS users get a complete page from WordPress. The app is an enhancement, never a dependency for content.
- **Static by default, fresh by guard.** A *freshness guard* compares the shell's `contentVersion` with the static build's; if the build is stale the session stays on REST until the next build lands.
- **Nothing runs `node` on the WordPress host.** Builds run in GitHub Actions (or any webhook receiver).
- **One contract.** `schemas.ts` (zod) defines every payload shape; PHP serializers and TS consumers are held to it by committed JSON fixtures asserted from both sides.
- **Three frontends, one CMS.** `CHAPTER_FRONTEND` selects `islands` (the PHP theme with its Vite-built Vue islands, still in the theme until the cleanup phase) or `nuxt` (the shell handoff above); the headless `next-js/` app needs no flag — it runs elsewhere and WordPress only points its canonical origin and rebuild webhook at it. Switching back is a constant flip.

## Repository layout

```
.
├── wp-content/themes/progressnow/   WordPress theme (Timber 2 / Twig, ACF Pro, Polylang Pro)
│   ├── inc/            one PHP file per domain (see Content model)
│   ├── views/          Twig templates + partials (Twig twins of the Vue components)
│   ├── blocks/         six progressnow/* ACF blocks (block.json + render.php)
│   ├── page-templates/ about, get-involved, calendar, styleguide
│   ├── src/            shared Vue/TS/Tailwind source (copied into nuxt-js/app — see Design system)
│   ├── static/         self-hosted fonts, brand placeholders, artwork
│   ├── bin/            seed.php, scrub-brand.sh, migrate-post-blocks.php, worktree-bootstrap.sh
│   ├── tests/          PHPUnit (WorDBless) + vitest, contract fixtures
│   ├── categories.json canonical category registry (slugs, labels, colors)
│   └── README.md       deep theme documentation
├── nuxt-js/             Nuxt 4 static rendition (see nuxt-js/README.md)
│   ├── app/            lib/chapter data layer, composables, plugins, routes, shared components
│   ├── modules/        routes-manifest, shell-manifest
│   ├── shared/         fixture-backed mock API
│   └── test/unit       contracts, resolver, shell/freshness/cache, drift tests
├── next-js/             headless Next.js frontend (see next-js/README.md; in progress)
│   ├── app/            App Router: catch-all route, api/rebuild, api/health, api/events
│   ├── components/     site components (React), shadcn/ui, a11y provider
│   ├── lib/            schemas (drift-guarded copy), api, data cache, routes, links, signing
│   └── test/           unit + component (Vitest/RTL/jest-axe), mock API, Playwright e2e + axe-core
├── docs/
│   ├── deployment.md            operator guide: constants, GitHub config, same-host vs CDN, cutover, rollback
│   └── accessibility-statement.md  EN/ES base text for the public Accessibility page
├── infra/terraform/     reference S3 + CloudFront + GitHub OIDC module (optional)
├── openspec/            specs (current behavior) + changes (proposals, designs, tasks)
├── wp-content/plugins/  currently tracked; slated to be untracked (see Roadmap)
├── LICENSE
└── wp-config-sample.php
```

WordPress core, `wp-config.php`, uploads and the generated `static-site/` are git-ignored.

## Requirements

**WordPress host**

- PHP 8.1+, WordPress 6.x, pretty permalinks enabled
- Composer (for the theme's `vendor/`: Timber 2, `kucrut/vite-for-wp`)
- Plugins: **ACF Pro** and **Polylang Pro** (required, licensed). Wordfence and WP Super Cache are optional. Duplicator must not be installed in production.
- WP-CLI (seeding, `wp chapter …` commands)
- System cron hitting `wp-cron.php` every minute (`DISABLE_WP_CRON` on)

**Build**

- Node 22+ and npm
- A GitHub repository (default rebuild transport) or any HMAC-verified webhook receiver

## Local development

### 1. WordPress

```bash
# from a local WP install (e.g. MAMP at https://chapter.test:8890) with this repo as the docroot
cp wp-config-sample.php wp-config.php        # fill in DB + salts
cd wp-content/themes/progressnow
composer install
npm install
```

Activate the **Progress Now** theme, install/activate ACF Pro and Polylang Pro, configure Polylang (EN `en_US` default + ES `es_MX`; language in directory, default hidden), then seed:

```bash
wp eval-file wp-content/themes/progressnow/bin/seed.php
```

The seed is idempotent: categories + colors, 14 placeholder events, lorem posts covering every block type, menus, Chapter Settings, interior documents, the Spanish page pairs and string translations. Spanish pages are written on create only.

Legacy islands mode (default until `CHAPTER_FRONTEND` is set):

```bash
npm run dev       # Vite dev server with HMR
npm run build     # vue-tsc + production build to dist/
```

### 2. Nuxt site (`nuxt-js/`)

```bash
cd nuxt-js
cp .env.example .env    # NUXT_DEV_WP_ORIGIN, NUXT_PUBLIC_WP_API_BASE (…/wp-json/progressnow/v1)
npm install
npm run dev             # nuxt dev, proxies /wp-json + /wp-content to the local WordPress
```

| Command | What it does |
|---|---|
| `npm run generate` | Prerender every route in both languages into `.output/public` + `shell-manifest.json` |
| `npm run generate:mock` | Same against the fixture-backed mock (`NUXT_MOCK_API=1`), no WordPress needed |
| `npm run verify:output` | Check routes, payloads, manifest and assets of a generated build |
| `npm run lint` / `typecheck` / `test` | ESLint (+ a11y rules), `nuxt typecheck`, vitest |

Full handoff locally: run `npm run generate`, then in `wp-config.php`:

```php
define( 'CHAPTER_FRONTEND', 'nuxt' );
define( 'CHAPTER_STATIC_DIR', ABSPATH . 'nuxt-js/.output/public' );
```

The theme's PHP passthrough serves `/_nuxt/*`, `*/_payload.json` and `/shell-manifest.json` from that directory.

### 3. Next.js site (`next-js/`)

```bash
cd next-js
cp .env.example .env    # WP_API_BASE (…/wp-json/progressnow/v1), NEXT_PUBLIC_SITE_ORIGIN, CHAPTER_REBUILD_SECRET
npm install
npm run dev             # against the local WordPress
npm run dev:mock        # against the fixture-backed mock API, no WordPress needed
```

| Command | What it does |
|---|---|
| `npm run test:unit` | Vitest: resolver, links, api, receiver, a11y settings; components with RTL + jest-axe; contract + drift tests |
| `npm run test:e2e` | Playwright against the production build + mock API, both languages |
| `npm run test:a11y` | axe-core over every route × language × a11y mode × interactive state, against the production build |
| `npm run build` | `next build` (standalone output) + bundle budget check |

WordPress side: `CHAPTER_REBUILD_TRANSPORT=webhook`, `CHAPTER_REBUILD_WEBHOOK_URL=<next-origin>/api/rebuild`, `CHAPTER_REBUILD_SECRET`, `CHAPTER_CANONICAL_ORIGIN=<next-origin>`.

Working in a git worktree? `bin/worktree-bootstrap.sh /path/to/full-checkout` symlinks the untracked WordPress runtime into it (shares the database, snapshot first).

## Configuration

All operator settings are `wp-config.php` constants. Full reference: `docs/deployment.md` §2.

| Constant | Purpose |
|---|---|
| `CHAPTER_FRONTEND` | `islands` (default) or `nuxt` |
| `CHAPTER_STATIC_DIR` | Same-host mode: absolute path of the rsync'd build |
| `CHAPTER_STATIC_ORIGIN` | CDN mode: origin to fetch `shell-manifest.json` from (defaults to site URL) |
| `CHAPTER_REBUILD_TRANSPORT` | `github` \| `webhook` \| `none` |
| `CHAPTER_GITHUB_REPO` / `CHAPTER_GITHUB_TOKEN` | Fine-grained PAT with *Contents: read & write* for `repository_dispatch` |
| `CHAPTER_REBUILD_WEBHOOK_URL` | Webhook transport target |
| `CHAPTER_REBUILD_SECRET` | HMAC secret for the webhook and the `/build-status` callback |
| `CHAPTER_REBUILD_DEBOUNCE` | Seconds to coalesce edits (default 90) |
| `CHAPTER_CANONICAL_ORIGIN` | Origin used for canonical, `hreflang`, `og:url` and the core sitemap when a headless frontend is primary (default: site URL) |

Everything chapter-specific (name, short name, region label, headline, logos, hero photo, socials, newsletter URL, contact email, committees, footer tagline…) lives in **Chapter Settings** in wp-admin, with generic placeholder fallbacks. Social and newsletter URLs have *no* default; the UI that needs them renders only when they are set.

## Deployment

Three supported shapes, all documented step by step in `docs/deployment.md`:

1. **Same-host** (`STATIC_DEPLOY_TARGET=rsync`): the workflow syncs the build into `CHAPTER_STATIC_DIR` on the WordPress host. Apache/nginx rules serve the static paths directly; PHP passthrough is the fallback.
2. **CDN** (`STATIC_DEPLOY_TARGET=s3`): `infra/terraform/` provisions a private versioned bucket, a CloudFront distribution (static paths → S3, everything else → WordPress honoring origin cache headers, optional 5xx failover to prerendered HTML) and a GitHub OIDC role.
3. **Webhook**: WordPress POSTs a signed `{ event: "rebuild", … }` to any receiver (e.g. API Gateway → CodeBuild) that runs `npm ci && npm run generate`, syncs, and reports back with the same signed `POST /build-status`.
4. **Headless Next.js** (`next-js/`): deploy the standalone build (Vercel, a container, or a VPS) and point the same signed webhook at `<next-origin>/api/rebuild`; the receiver revalidates its cache and reports back with `POST /build-status`. Guide section in progress (`next-js-site-implementation`).

The rebuild workflow (`.github/workflows/rebuild-site.yml`, to be added to this repo) listens for `repository_dispatch` (`rebuild-site`), `workflow_dispatch`, and pushes to `main` touching `nuxt-js/`, with `concurrency: rebuild-site` so bursts of edits collapse into one build. Repository variables/secrets: `WP_API_BASE`, `STATIC_DEPLOY_TARGET`, `WP_BUILD_STATUS_URL`, `CHAPTER_REBUILD_SECRET`, plus rsync or S3 credentials.

**Cutover** (§7): activate theme → seed → set constants with `CHAPTER_FRONTEND=islands` → trigger a build → verify `shell-manifest.json` → flip to `nuxt` → watch the Site build panel (`scheduled → requested → building → live`). **Rollback** (§8): flip `CHAPTER_FRONTEND` back, or restore a prior manifest from S3 versioning / re-run the workflow.

## Content model

One PHP file per domain under `wp-content/themes/progressnow/inc/`:

| File | Owns |
|---|---|
| `identity.php` | Chapter name / short name / region label, headline, brand media with placeholder fallbacks |
| `options.php` | Chapter Settings ACF options page, front-page hero + sections, menu locations, chrome props |
| `pages.php`, `interior.php` | About + Get Involved ACF groups and contexts; ledes, governing docs, SEO description overrides |
| `events.php` | `event` CPT, `event_category` taxonomy + colors, ICS feed, `ChapterEvent` serialization |
| `blog.php` | Category colors, post settings (dek, byline mode, committee), `post_content` → block serialization |
| `blocks.php` | Six `progressnow/*` ACF blocks, gallery styles, restricted post inserter, attachment `credit` |
| `categories.php` | Canonical registry from `categories.json`; slug rename guard |
| `rest.php` | `progressnow/v1` read API with transient + ETag/304 caching |
| `cache.php` | `progressnow_cache_remember()` + content-version invalidation |
| `payloads.php`, `shell.php` | `__SHELL_DATA__` route payloads; manifest reading, app tags, static passthrough, build recording |
| `rebuild.php`, `admin-build.php`, `cli.php` | Debounced rebuild dispatch, Site build panel, `wp chapter …` |
| `seo.php` | Head output at `wp_head` priority 5 |
| `i18n.php` | Polylang integration: translatable CPTs, switcher context, UI strings, translated menus |

Rules that hold everywhere:

- Every content area is editable in wp-admin, registered in PHP (never DB-only), and falls back to neutral copy so an empty install renders a complete generic site.
- Category slugs `chapter | poled | mutual | labor | electoral | social` are load-bearing (URLs, TS types). Rename labels and colors, never slugs.
- Editor HTML is `wp_kses`-sanitized at serialize time.
- Calendar, About and Get Involved are **page templates**, not magic slugs.

## REST API

`GET /wp-json/progressnow/v1/*`, public, publish-only, GET-only. Handlers reuse the domain serializers, so REST and embedded payloads cannot drift.

| Route | Returns |
|---|---|
| `/posts?page&per_page&category&s&lang` | `{ posts, page, perPage, total, totalPages }` |
| `/posts/{slug}?lang` | `SinglePostData` + `readNext` + `languages` |
| `/events?after&before&lang` | `{ events, categories }` (default window −1 → +12 months) |
| `/categories` | `{ categories }` |
| `/site`, `/routes`, `/front`, `/page/…` | Shell / static-build payloads used by `nuxt generate` |
| `POST /build-status` | HMAC-signed callback from the build |

Anonymous responses: `Cache-Control: public, max-age=300, stale-while-revalidate=3600` + ETag/304. Logged-in: `no-store`. Additive changes stay on `/v1`; breaking ones go to `/v2`.

## Design system

v4 "Progress Now" system, one token set in `src/css/tailwind.css` (Tailwind v4 `@theme`, role names only):

- **Color:** `brand #1848D8`, `brand-deep #0F2E9C`, `accent #0E62E6`, `brand-light #A9C7FF`, `alt #F2F5FB`, `ink #1B1B22`, `yellow #FFC800`, plus muted / line / control / border tokens. No color-named aliases remain (grep-gated).
- **Type:** Public Sans variable (body), Bowlby One (display, 400 only), Special Season Brush (CTA line). Self-hosted from `static/fonts/`, preloaded.
- **Tones:** every band carries `data-tone="blue|white|alt|ink"`; the high-contrast mode recolors by tone and flips focus rings on dark tones.
- **Radius:** 20px cards (18 tablet / 16 mobile), 14px rows, 10–12px pills/tiles, 999 for chips and breadcrumbs.
- **Components:** shadcn-vue (vendored into `src/components/ui/`), site components in `src/components/site/`, styleguide at `/styleguide/`.

**Shared source rule.** `src/components/site/**`, `src/components/ui/**`, `useA11ySettings.ts`, `schemas.ts` and `tailwind.css` in the theme are copied verbatim into `nuxt-js/app/`. Edit the theme copy and re-copy; `nuxt-js/test/unit/shared-source-drift.test.ts` fails on any drift. Twig partials and route components must keep the same class literals as their Vue twins.

## Testing

```bash
# theme
cd wp-content/themes/progressnow
composer test     # PHPUnit on WorDBless (no DB): contracts, REST, SEO, payloads, shell, rebuild, brand audit, sanitization…
npm test          # vitest: category-token drift, contract fixtures, header/language-switcher behavior
npm run typecheck && npm run lint

# nuxt-js
cd nuxt-js
npm test          # vitest: contracts, resolver, shell/freshness/cache order, manifest, shared-source + categories drift
npm run typecheck && npm run lint
npm run generate:mock && npm run verify:output

# next-js
cd next-js
npm run lint && npm run typecheck && npm run test:unit
npm run build && npm run test:e2e && npm run test:a11y   # against the fixture-backed mock, no WordPress
```

Contract fixtures in `tests/fixtures/*.json` are asserted from both sides (PHPUnit byte-equality, vitest zod parse). Regenerate deliberately:

```bash
PROGRESSNOW_WRITE_FIXTURES=1 vendor/bin/phpunit --filter TestContracts
```

`tests/test-brand-audit.php` scans shipped files, seed (EN + ES), rendered contexts, ICS and SEO head for any regional token, keeping the theme chapter-neutral.

## OpenSpec workflow

This project is spec-driven. `openspec/specs/<capability>/spec.md` describes current behavior; `openspec/changes/<name>/` holds a proposal, design, tasks and delta specs for in-flight work; completed changes are archived under `openspec/changes/archive/` and their deltas merged into the main specs.

Capabilities on file: block-serialization, blog-presentation, category-registry, chapter-content-model, chapter-editable-content, content-migration, content-performance, contract-governance, design-tokens, editable-page-sections, events-presentation, front-page, interior-presentation, internationalization, island-data-fetch, island-empty-states, photo-treatment, post-authoring, rest-api, seo-metadata, site-chrome, social-cards, structured-data.

Slash commands (`.claude/commands/opsx/`): `/opsx:new`, `/opsx:continue`, `/opsx:apply`, `/opsx:verify`, `/opsx:archive`, `/opsx:propose`, `/opsx:ff`, `/opsx:explore`, `/opsx:sync`.

## History

Timeline reconstructed from the predecessor repo's git log and the archived OpenSpec changes:

| Date | Change | Summary |
|---|---|---|
| 2026-05 | — | Repo created from the Timber starter theme + Vite. |
| 2026-07-02 | `chapter-theme-foundation` | First real theme: CPTs, front page, header/footer, DSA red tokens. Followed by a v2 re-skin (warm/rounded blog + calendar islands). |
| 2026-07-02 | `backend-consolidation` | `categories.json` registry, kses at serialize time, read-minutes meta, transient cache with content-version invalidation, calendar page template, fixed PHPUnit harness. |
| 2026-07-02 | `gutenberg-post-blocks` | Post bodies move from ACF flexible content to native Gutenberg: 6 ACF blocks + 8 core blocks mapped onto the `PostBlock` contract, migration script. |
| 2026-07-02 | `rest-data-layer` | Public read API, server-side search/filter/pagination, ETag caching, zod contracts + two-sided fixtures, designed empty states. |
| 2026-07-03 | `editor-owned-pages` | WYSIWYG prose, section toggles wired to on-page nav, editable headings and links on About / Get Involved. |
| 2026-07-03 | `seo-meta-layer` | Descriptions, canonical, robots, OG/Twitter cards, JSON-LD. |
| 2026-07-03 | `translations-layer` → `polylang-translations` → `interior-page-translations` | GTranslate approach superseded by Polylang Pro page pairs for home, then every interior page; translated menus and strings. |
| 2026-08-27 | `home-v3-brand-refresh` | Designer's v3 red/orange system applied to Home. |
| 2026-09-05 | `progress-now-v4-foundation-chrome`, `-home`, `-blog`, `-events`, `-interior-404` | v4 blue "Progress Now" design across every page, in both renderers; v3 scaffolding removed. |
| 2026-09-05 | `nuxt4-static-platform` (51/59 tasks) | Theme renamed to Progress Now and brand-scrubbed; Nuxt 4 static rendition; PHP shell handoff; rebuild pipeline, Site build panel, WP-CLI, Terraform reference, deployment guide. |

## Roadmap

Open changes in `openspec/changes/` (task counts at time of writing):

| Change | Status | Scope |
|---|---|---|
| `nuxt4-static-platform` | 51/59 | Remaining: remove the Vite islands after cutover verification (tasks 7.x), final cleanup |
| `next-js-site-implementation` | 0/53 | Headless Next.js frontend (`next-js/`): Tailwind v4 + shadcn/ui, SSR from `progressnow/v1`, signed-webhook revalidation, axe-core gate against the build, View Transitions; `site/` renamed to `nuxt-js/`; `CHAPTER_CANONICAL_ORIGIN` |
| `open-source-release-readiness` | 0/27 | Untrack plugins/backups, declare ACF Pro + Polylang Pro as adopter-installed, community files, identifier + PII scrub, no-analytics policy, hygiene CI gate, release checklist |
| `content-invalidation-completeness` | 0/27 | Bump content version on every public write (pages, menus, terms, attachments, strings), one bump per request, WP timezone, language-aware categories |
| `security-sanitize-url-sinks` | 0/12 | `progressnow_safe_url()` scheme allow-list on every `:href`/`:src` sink |
| `security-authoring-least-privilege` | 0/11 | Drop `unfiltered_html` for all roles, documented role model |
| `security-rest-cache-dos-hardening` | 0/11 | Pagination max, no negative/search transients, date-window clamps, ICS caching |
| `security-runtime-hardening` | 0/15 | Production `wp-config` baseline, salts runbook, xmlrpc/user-enum off |
| `security-headers-and-cicd-gates` | 0/14 | CSP (report-only first), HSTS and friends; PHPCS security sniffs, gitleaks, artifact guard in CI |
| `security-dependency-lifecycle` | 0/14 | Composer/npm audits, Renovate, patch SLA |
| `security-remove-duplicator-and-purge-artifacts` | 0/16 | Superseded by `open-source-release-readiness` |

Known items carried over from the theme README: Spanish home resolves at `/es/inicio/` (Polylang 301 from `/es/`); event teaser dates render in English (`wp_date()` switch pending); GitHub workflows (`ci.yml`, `rebuild-site.yml`) and `.github/scripts/build-status.mjs` still need to be brought into this repo.

## License

MIT — see `LICENSE`. Third-party assets and plugins (ACF Pro, Polylang Pro, fonts) carry their own licenses and are not covered.
