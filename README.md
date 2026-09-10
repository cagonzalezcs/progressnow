# Progress Now

A chapter-neutral organizing-site kit for a **Progress Now** chapter: one WordPress theme that owns content, SEO and editing, and **three interchangeable frontends** for the public site — the server-rendered PHP theme itself, a Nuxt 4 static rendition that takes over from a PHP shell, and a headless Next.js app on its own origin. An install picks one; the CMS, the REST API and the contracts are the same for all three. Everything that names or pictures a chapter is data in wp-admin; everything shipped in the repo is a generic placeholder.

Bilingual (EN at `/`, ES at `/es/…`), accessible (WCAG 2.2 AA target, built-in text-size / high-contrast / reduced-motion controls), no analytics, no third-party trackers.

> **⚠️ This codebase was written almost entirely by AI.** Every line was produced with [Claude Code](https://claude.com/claude-code) using Claude Fable 5.1 and Claude Opus 5, prompted and reviewed by one person. It is a vibe-coded app. Assume hallucinations exist: APIs that don't quite exist, tests that assert the wrong thing, docs that describe code that was never written, security assumptions nobody checked. Read the [Contributing](#contributing) section before you trust it, and open a PR when you find something. Human or AI-authored fixes are equally welcome.

> This repository is a fresh start. The code was developed 2026-05 → 2026-09 as a single-chapter site, then renamed, made chapter-neutral and re-platformed onto Nuxt 4. The design and decision history lives in `openspec/` (see [History](#history)); the original git history is not carried over.

---

## Contents

- [What you get](#what-you-get)
- [Frontends: pick one](#frontends-pick-one)
- [Architecture](#architecture)
- [Repository layout](#repository-layout)
- [Documentation](#documentation)
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
- [Contributing](#contributing)
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
| **Ops** | Chapter Settings → **Site build** panel, `wp chapter rebuild` / `wp chapter build-status` / `wp chapter audit-urls`, GitHub Actions rebuild workflow, optional Terraform for S3 + CloudFront |

## Frontends: pick one

| | **PHP theme** (`wp-content/themes/progressnow`) | **`nuxt-js/`** — Nuxt 4 static rendition | **`next-js/`** — headless Next.js |
|---|---|---|---|
| Who renders the page | WordPress/Timber, every request | WordPress renders a shell; the Nuxt client mounts into it and navigates from a prerendered static build | Next.js on its own origin (SSR + cached data); WordPress is CMS + API only |
| Runtime on the WordPress host | PHP only | PHP only (build runs in CI or a webhook receiver) | PHP only; Node runs wherever the Next app is hosted |
| Public origin | the WordPress domain | the WordPress domain | a separate origin (e.g. `app.<domain>`); the PHP theme keeps serving the WordPress domain |
| Freshness | immediate | rebuild on content change (debounced), freshness guard in between | push revalidation on content change (signed webhook), no rebuild |
| `CHAPTER_FRONTEND` | `islands` (default) | `nuxt` | `islands` (the PHP theme stays server-rendered) |
| `CHAPTER_REBUILD_TRANSPORT` | `none` | `webhook` (a §6 receiver) or `github` through a dispatch repository (+ `CHAPTER_STATIC_DIR` / `CHAPTER_STATIC_ORIGIN`) | `webhook` → `<next-origin>/api/rebuild` (+ `CHAPTER_REBUILD_SECRET`) |
| `CHAPTER_CANONICAL_ORIGIN` | unset | unset | the Next origin, so canonical / `hreflang` / `og:url` / sitemap point at the public frontend |
| Status | shipping | shipping (`nuxt4-static-platform`, see [History](#history)) | shipping (`next-js-site-implementation`, see [History](#history)) |


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
- **Three frontends, one CMS.** `CHAPTER_FRONTEND` selects `islands` (the PHP theme with its Vite-built Vue islands — the PHP-only frontend, kept permanently) or `nuxt` (the shell handoff above); the headless `next-js/` app needs no flag — it runs elsewhere and WordPress only points its canonical origin and rebuild webhook at it. Switching back is a constant flip.

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
│   ├── bin/            seed.php, migrate-post-blocks.php, worktree-bootstrap.sh
│   ├── tests/          PHPUnit (WorDBless) + vitest, contract fixtures
│   ├── categories.json canonical category registry (slugs, labels, colors)
│   └── README.md       deep theme documentation
├── nuxt-js/             Nuxt 4 static rendition (see nuxt-js/README.md)
│   ├── app/            lib/chapter data layer, composables, plugins, routes, shared components
│   ├── modules/        routes-manifest, shell-manifest
│   ├── shared/         fixture-backed mock API
│   └── test/unit       contracts, resolver, shell/freshness/cache, drift tests
├── next-js/             headless Next.js frontend (see next-js/README.md)
│   ├── app/            App Router: catch-all route, api/rebuild, api/health, api/events
│   ├── components/     site components (React), shadcn/ui, a11y provider
│   ├── lib/            schemas (drift-guarded copy), api, data cache, routes, links, signing, security headers
│   ├── test/           unit + component (Vitest/RTL/jest-axe), mock API, Playwright e2e + axe-core
│   └── Dockerfile      standalone image (node:22-alpine, non-root, HEALTHCHECK)
├── docs/
│   ├── deployment.md            operator guide: constants, GitHub config, same-host vs CDN, headless Next.js (§10), cutover, rollback
│   ├── security-gates.md        CI security gates (PHPCS sniffs, gitleaks, artifact guard), the theme's headers + CSP rollout
│   └── accessibility-statement.md  EN/ES base text for the public Accessibility page
├── infra/terraform/     reference S3 + CloudFront + GitHub OIDC module (optional)
├── openspec/            specs (current behavior) + changes (proposals, designs, tasks)
├── LICENSE
└── wp-config-sample.php
```

WordPress core, `wp-config.php`, uploads, `wp-content/plugins/`, build output (`nuxt-js/dist`, `nuxt-js/.output`, theme `dist/`), `node_modules/`, `vendor/` and the synced `static-site/` are all git-ignored. Plugins are installed by the adopter, never vendored.

## Documentation

One document owns each topic. Every other document keeps at most a sentence and a link to the owner — never a copy of its paragraphs.

| Topic | Owner |
|---|---|
| What the kit is, the map of the repository, quick start, architecture, history, roadmap | this README |
| One app's commands, environment variables and directory layout | that app's README: [`wp-content/themes/progressnow/README.md`](wp-content/themes/progressnow/README.md), [`nuxt-js/README.md`](nuxt-js/README.md), [`next-js/README.md`](next-js/README.md) |
| Operating a site: constants, deployment shapes, cutover and rollback, security gates, runtime hardening, authoring trust model, secrets rotation | [`docs/`](docs/) |
| Why something is the way it is, and what is in flight | [`openspec/`](openspec/): `openspec/specs/` = current behavior, `openspec/changes/` = proposals, designs, tasks; `openspec/changes/archive/` = history |

| AI session handoffs and agent configuration | untracked — `.claude/` is gitignored, and nothing from a session is committed |

The `docs` CI job (`.github/workflows/docs.yml`, `scripts/docs/`) keeps this honest: the Roadmap and Capabilities sections below are rendered from `openspec/` and fail when stale; every backticked repository path and every relative link in the README, `docs/`, the app READMEs and open change proposals must resolve; and a section duplicated across files fails.

## Requirements


**WordPress host**

- PHP 8.2+ (Timber 2.5's floor; CI runs 8.2 and 8.4), WordPress 6.x, pretty permalinks enabled
- Composer (for the theme's `vendor/`: Timber 2, `kucrut/vite-for-wp`)
- Plugins: **ACF Pro** and **Polylang Pro** (required, licensed). Wordfence and WP Super Cache are optional. Duplicator must not be installed in production.
- WP-CLI (seeding, `wp chapter …` commands)
- System cron hitting `wp-cron.php` every minute (`DISABLE_WP_CRON` on)

**Build**

- Node 22 and npm — the root `.nvmrc` pins the major and every app's `.npmrc` sets `engine-strict`, so `npm ci` under another major fails with an engine error (`nvm use` / `fnm use` read the file)
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

Activate the **Progress Now** theme, install/activate ACF Pro and Polylang Pro, configure Polylang (EN `en_US` default + ES `es_MX`; language in directory, default hidden), set **Settings → General → Timezone** to your city (event times, calendar links, and the ICS feed follow it — the theme has no built-in zone), then seed:

```bash
wp eval-file wp-content/themes/progressnow/bin/seed.php
```

The seed is idempotent: categories + colors, 14 placeholder events, lorem posts covering every block type, menus, Chapter Settings, interior documents, the Spanish page pairs and string translations. Spanish pages are written on create only. Islands mode (the default — `CHAPTER_FRONTEND` unset or `islands`) needs nothing more: `npm run dev` in the theme for the Vite dev server with HMR. Every theme command, the MAMP seeding invocation and the Polylang details: [theme README](wp-content/themes/progressnow/README.md).

### 2. Nuxt site (`nuxt-js/`)

```bash
cd nuxt-js
cp .env.example .env    # NUXT_DEV_WP_ORIGIN, NUXT_PUBLIC_WP_API_BASE (…/wp-json/progressnow/v1)
npm install
npm run dev             # nuxt dev, proxies /wp-json + /wp-content to the local WordPress
```

Every command (`generate`, `generate:mock`, `verify:output`, lint / typecheck / test), local TLS and the Vercel setup: [`nuxt-js/README.md`](nuxt-js/README.md). The full handoff locally — `npm run generate`, then `CHAPTER_FRONTEND=nuxt` and `CHAPTER_STATIC_DIR` in `wp-config.php` — is `docs/deployment.md` §9.

### 3. Next.js site (`next-js/`)

```bash
cd next-js
cp .env.example .env.local   # WP_API_BASE (…/wp-json/progressnow/v1), NEXT_PUBLIC_SITE_ORIGIN, CHAPTER_REBUILD_SECRET
npm install
npm run dev                  # against the local WordPress; `npm run dev:mock` needs no WordPress
```

Every command, the environment contract and the test layers: [`next-js/README.md`](next-js/README.md). The WordPress-side constants for the full loop (`CHAPTER_REBUILD_TRANSPORT=webhook`, the webhook URL, the shared secret, `CHAPTER_CANONICAL_ORIGIN`): `docs/deployment.md` §10.8.

Working in a git worktree? `bin/worktree-bootstrap.sh /path/to/full-checkout` symlinks the untracked WordPress runtime into it (shares the database, snapshot first).

## Configuration

All operator settings are `wp-config.php` constants — or environment variables of the same name, which win (an empty value counts as unset), so a host with a secret manager never writes a secret into a PHP file. The Site build panel reports each setting's *source*, never its value. The reference for every `CHAPTER_*` constant, precedence and secret strength is `docs/deployment.md` §2 (§10.3 for the headless ones). The ones that pick a frontend: `CHAPTER_FRONTEND` (`islands` default, or `nuxt`), `CHAPTER_REBUILD_TRANSPORT` (`webhook` recommended; `github` only through a dispatch repository, `docs/rebuild-dispatch-repo.md`; `none`), `CHAPTER_REBUILD_SECRET` (≥ 32 characters; rotation in `docs/secrets-rotation.md`) and, for a headless frontend, `CHAPTER_CANONICAL_ORIGIN`. Set `DISALLOW_UNFILTERED_HTML` to `true` as well — the theme denies the capability for every role regardless (`docs/authoring-trust-model.md`).

Everything chapter-specific (name, short name, region label, headline, logos, hero photo, socials, newsletter URL, contact email, committees, footer tagline…) lives in **Chapter Settings** in wp-admin, with generic placeholder fallbacks. Social and newsletter URLs have *no* default; the UI that needs them renders only when they are set.

## Deployment

Three supported shapes, all documented step by step in `docs/deployment.md`:

1. **Same-host** (`STATIC_DEPLOY_TARGET=rsync`): the workflow syncs the build into `CHAPTER_STATIC_DIR` on the WordPress host. Apache/nginx rules serve the static paths directly; PHP passthrough is the fallback.
2. **CDN** (`STATIC_DEPLOY_TARGET=s3`): `infra/terraform/` provisions a private versioned bucket, a CloudFront distribution (static paths → S3, everything else → WordPress honoring origin cache headers, optional 5xx failover to prerendered HTML) and a GitHub OIDC role.
3. **Webhook**: WordPress POSTs a signed `{ event: "rebuild", … }` to any receiver (e.g. API Gateway → CodeBuild) that runs `npm ci --ignore-scripts && npx nuxt prepare && npm run generate`, syncs, and reports back with the same signed `POST /build-status`.
4. **Headless Next.js** (`next-js/`): deploy the standalone build (Vercel, the `Dockerfile`, or a VPS behind a reverse proxy) and point the same signed webhook at `<next-origin>/api/rebuild`; the receiver revalidates its cache and reports back with `POST /build-status`. Set `CHAPTER_CANONICAL_ORIGIN` to the Next origin. `docs/deployment.md` §10; `node scripts/smoke.mjs <origin>` after each deploy.

The rebuild workflow (`.github/workflows/rebuild-site.yml`) listens for `repository_dispatch` (`rebuild-site`), `workflow_dispatch`, and pushes to `main` touching `nuxt-js/`, with `concurrency: rebuild-site` so bursts of edits collapse into one build. Repository variables/secrets: `WP_API_BASE`, `STATIC_DEPLOY_TARGET`, `WP_BUILD_STATUS_URL`, `CHAPTER_REBUILD_SECRET`, plus rsync or S3 credentials. Content-driven rebuilds reach it through the signed webhook or a *dispatch repository* that checks this one out read-only: the token WordPress holds never has write access here (`docs/rebuild-dispatch-repo.md`; rotation of every pipeline credential in `docs/secrets-rotation.md`).

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

`GET /wp-json/progressnow/v1/*`, public, publish-only, GET-only. Handlers reuse the domain serializers, so REST and embedded payloads cannot drift. Routes: `/posts` (paged, category-filtered, searched), `/posts/{slug}`, `/events` (date-windowed), `/categories`, the `/site` / `/routes` / `/front` / `/page/…` payloads that `nuxt generate` reads, and the signed `POST /build-status` callback. Anonymous responses are HTTP-cached (`max-age=300`, `stale-while-revalidate`, ETag/304); logged-in ones are `no-store`. Additive changes stay on `/v1`; breaking ones go to `/v2`. Parameters, bounds and envelopes: [theme README § REST API](wp-content/themes/progressnow/README.md#rest-api-wp-jsonprogressnowv1).

## Design system

v4 "Progress Now" system, one token set in `src/css/tailwind.css` (Tailwind v4 `@theme`, role names only):

- **Color:** `brand #1848D8`, `brand-deep #0F2E9C`, `accent #0E62E6`, `brand-light #A9C7FF`, `alt #F2F5FB`, `ink #1B1B22`, `yellow #FFC800`, plus muted / line / control / border tokens. No color-named aliases remain (grep-gated).
- **Type:** Public Sans variable (body), Bowlby One (display, 400 only), Special Season Brush (CTA line). Self-hosted from `static/fonts/`, preloaded.
- **Tones:** every band carries `data-tone="blue|white|alt|ink"`; the high-contrast mode recolors by tone and flips focus rings on dark tones.
- **Radius:** 20px cards (18 tablet / 16 mobile), 14px rows, 10–12px pills/tiles, 999 for chips and breadcrumbs.
- **Components:** shadcn-vue (vendored into `src/components/ui/`), site components in `src/components/site/`, styleguide at `/styleguide/`.

**Shared source rule.** `src/components/site/**`, `src/components/ui/**`, `useA11ySettings.ts`, `schemas.ts` and `tailwind.css` in the theme are copied verbatim into `nuxt-js/app/`. Edit the theme copy and re-copy; `nuxt-js/test/unit/shared-source-drift.test.ts` fails on any drift. Twig partials and route components must keep the same class literals as their Vue twins.

## Testing

Each app's README owns its commands; this is the map. Nothing needs a WordPress instance: the theme runs PHPUnit on WorDBless, `nuxt-js` generates against its nitro mock, `next-js` tests against its fixture-backed mock — all fed by the theme's committed contract fixtures (`tests/fixtures/*.json`, asserted byte-for-byte from PHP and parsed by zod from TS; regenerate them deliberately — theme README § Contract governance).

- **Theme** — `composer test`, `composer lint`, `npm test`, `npm run build`, `node bin/twig-audit.mjs`: [theme README § Commands](wp-content/themes/progressnow/README.md#commands).
- **nuxt-js** — `npm test`, `npm run typecheck`, `npm run lint`, `npm run generate:mock && npm run verify:output`: [`nuxt-js/README.md` § Commands](nuxt-js/README.md#commands).
- **next-js** — unit + component (Vitest, RTL, jest-axe), Playwright `e2e` / `a11y` / `failure`, the container smoke: [`next-js/README.md` § Checks](next-js/README.md#checks).
- **Repository gates** — PHPCS security sniffs, gitleaks and the artifact guard (required on `main`), the workflow lint, and the `docs` job (`node scripts/docs/render-readme-sections.mjs --check`, `check-paths.mjs`, `check-links.mjs`, `check-duplicate-sections.mjs`): [`docs/security-gates.md` § Run them locally](docs/security-gates.md#run-them-locally). `git config core.hooksPath .githooks` once per clone mirrors the gates in a pre-commit hook.

## OpenSpec workflow

This project is spec-driven. `openspec/specs/<capability>/spec.md` describes current behavior; `openspec/changes/<name>/` holds a proposal, design, tasks and delta specs for in-flight work; completed changes are archived under `openspec/changes/archive/` and their deltas merged into the main specs. **There is one spec root**, `openspec/` at the repository root — never start another under an app (`next-js/openspec/` is a leftover that `repo-structure-consolidation` folds in). `openspec/config.yaml` carries the project context and the per-artifact rules every generated artifact is held to.

<!-- openspec:capabilities:start -->
Capabilities on file — 39 specs, 237 requirements (count in parentheses): `authoring-least-privilege` (3), `block-serialization` (3), `blog-presentation` (10), `category-registry` (3), `chapter-content-model` (5), `chapter-editable-content` (3), `chapter-neutral-branding` (8), `chapter-timezone` (1), `content-migration` (2), `content-performance` (6), `contract-governance` (3), `design-tokens` (5), `editable-page-sections` (6), `events-presentation` (12), `front-page` (8), `interior-presentation` (7), `internationalization` (8), `island-data-fetch` (3), `island-empty-states` (3), `next-accessibility` (10), `next-deployment` (8), `next-design-system` (9), `next-headless-site` (13), `next-revalidation-receiver` (8), `next-test-harness` (13), `nuxt-static-site` (9), `photo-treatment` (3), `php-shell-handoff` (8), `post-authoring` (2), `rebuild-credential-boundary` (5), `rest-api` (9), `rest-availability-hardening` (4), `runtime-hardening` (6), `seo-metadata` (4), `site-chrome` (8), `social-cards` (2), `static-asset-serving` (4), `static-rebuild-pipeline` (10), `structured-data` (3).
<!-- openspec:capabilities:end -->

The tooling is the [`openspec` CLI](https://github.com/Fission-AI/OpenSpec) (`npm install -g @fission-ai/openspec`):

```bash
openspec list                                 # open changes with task counts (--specs: the capabilities)
openspec status --change <name>               # which artifacts a change has
openspec instructions apply --change <name>   # context files + remaining tasks for an implementation session
openspec validate --all                       # every spec and change parses
openspec archive <name>                       # merge the deltas into openspec/specs/, move the change to archive/
```

The `/opsx:*` skills (`/opsx:new`, `/opsx:continue`, `/opsx:apply`, `/opsx:verify`, `/opsx:archive`, `/opsx:propose`, `/opsx:ff`, `/opsx:explore`, `/opsx:sync`) drive the same commands from an AI agent. `openspec init` / `openspec update` generate them for the agent you use into `.claude/`, which is gitignored — each clone generates its own; nothing agent-specific is tracked.


## History

Timeline reconstructed from the predecessor repo's git log and the archived OpenSpec changes:

| Date | Change | Summary |
|---|---|---|
| 2026-05 | — | Repo created from the Timber starter theme + Vite. |
| 2026-07-02 | `chapter-theme-foundation` | First real theme: CPTs, front page, header/footer, first token set. Followed by a v2 re-skin (warm/rounded blog + calendar islands). |
| 2026-07-02 | `backend-consolidation` | `categories.json` registry, kses at serialize time, read-minutes meta, transient cache with content-version invalidation, calendar page template, fixed PHPUnit harness. |
| 2026-07-02 | `gutenberg-post-blocks` | Post bodies move from ACF flexible content to native Gutenberg: 6 ACF blocks + 8 core blocks mapped onto the `PostBlock` contract, migration script. |
| 2026-07-02 | `rest-data-layer` | Public read API, server-side search/filter/pagination, ETag caching, zod contracts + two-sided fixtures, designed empty states. |
| 2026-07-03 | `editor-owned-pages` | WYSIWYG prose, section toggles wired to on-page nav, editable headings and links on About / Get Involved. |
| 2026-07-03 | `seo-meta-layer` | Descriptions, canonical, robots, OG/Twitter cards, JSON-LD. |
| 2026-07-03 | `translations-layer` → `polylang-translations` → `interior-page-translations` | GTranslate approach superseded by Polylang Pro page pairs for home, then every interior page; translated menus and strings. |
| 2026-08-27 | `home-v3-brand-refresh` | Designer's v3 red/orange system applied to Home. |
| 2026-09-05 | `progress-now-v4-foundation-chrome`, `-home`, `-blog`, `-events`, `-interior-404` | v4 blue "Progress Now" design across every page, in both renderers; v3 scaffolding removed. |
| 2026-09-07 | `nuxt4-static-platform` (58/59 tasks) | Theme renamed to Progress Now and made chapter-neutral; Nuxt 4 static rendition; PHP shell handoff; rebuild pipeline, Site build panel, WP-CLI, Terraform reference, deployment guide. The islands-removal task was dropped: the theme's Vite islands are permanent (PHP-only frontend). |
| 2026-09-07 | `next-js-site-implementation` (57/57 tasks) | Headless Next.js frontend (`next-js/`): Tailwind v4 + shadcn/ui, SSR from `progressnow/v1`, signed-webhook revalidation, nonce CSP, axe-core gate against the build, View Transitions, Dockerfile; `site/` renamed to `nuxt-js/`; `CHAPTER_CANONICAL_ORIGIN`. |
| 2026-09-09 | `security-rest-cache-dos-hardening` | Bounded REST inputs (`page` ≤ 500, `per_page` ≤ 50), no search/negative transients, date-window clamps, cached ICS, term create/delete invalidation (#19). |
| 2026-09-09 | `security-authoring-least-privilege` | `unfiltered_html` denied for every role, `esc_html` Twig strategy, role and markup audits (#20). |
| 2026-09-09 | `security-runtime-hardening` | xmlrpc / user-enumeration / discovery hooks off, `wp-config` baseline + startup assertion, salt runbook, Wordfence posture (#21). |
| 2026-09-09 | `next-ci-performance` (22/24 tasks) | next-js CI from ~14 min to ~5 min: `--no-deps` fix, fan-out over one build artifact (#25). |
| 2026-09-10 | `blog-grid-full-rows` | 25 posts per archive page and the featured card on every state, so the grid's last row is never short (#26). |
| 2026-09-10 | `content-invalidation-completeness` (24/27 tasks) | Content version bumps on every public write, once per request (pages, menus, terms, attachments, strings); WordPress timezone replaces the built-in zone; `/categories?lang` (#28). Remaining: three local-site checks. |
| 2026-09-10 | `security-rebuild-transport-trust-boundary` (12/16 tasks) | Env-first `CHAPTER_*` settings with sources (never values) in the panel/CLI, 32-character HMAC floor on both sides, optional `_OUT`/`_IN` split, redacted upstream errors, dispatch-repository pattern + template (`docs/rebuild-dispatch-repo.md`), `docs/secrets-rotation.md`, webhook-first docs (#33). Remaining (owner): ruleset admin bypass, `production` branch rule, scratch dispatch-repo run, first rotation. |

## Roadmap

Open changes in `openspec/changes/`, rendered by `scripts/docs/render-readme-sections.mjs` from each change's `tasks.md` and its one-line scope (`.openspec.yaml` `description`, else the proposal's first "What Changes" bullet). The `docs` CI job fails when this table is stale; archived changes move to [History](#history).

<!-- openspec:roadmap:start -->
| Change | Tasks | Scope |
|---|---|---|
| `deploy-pipeline` | — | Empty stub from 2026-07-03 (no artifacts); `repo-structure-consolidation` deletes it |
| `docs-accuracy-and-spec-governance` | 15/15 ✓ | One canonical doc per topic, README roadmap and capabilities rendered from `openspec/` and checked in CI, path + link + duplicate-section lint, `openspec/config.yaml` project context and artifact rules |
| `open-source-release-readiness` | 0/27 | Plugin-missing admin notice, `CONTRIBUTING` / `CODE_OF_CONDUCT` / `SECURITY`, no-analytics policy, hygiene CI gate, release checklist (plugins and backups untracked, MIT declared and the dev origin neutralized already… |
| `ops-backup-and-disaster-recovery` | 0/9 | Off-docroot DB + uploads backups, RPO/RTO defaults, restore runbook and a recorded restore drill |
| `repo-structure-consolidation` | 0/15 | Fold `next-js/openspec/` into the root spec tree, drop `Claude outputs/`, `.gitignore` fixes, theme `composer.json` identity, Timber-starter leftovers, resolve the `deploy-pipeline` stub |
| `security-cicd-supply-chain-hardening` | 16/18 | Every GitHub Action pinned to a SHA, repository variables through `env:`, rsync host key, narrowed Terraform OIDC trust, Timber pinned, `.nvmrc` + `engine-strict`, CI on every branch prefix in use |
| `security-dependency-lifecycle` | 0/14 | Composer/npm audits, Renovate, patch SLA |
| `security-detection-and-response` | 0/18 | Second factor for privileged roles, audit trail for privileged theme actions, rebuild-failure alerts, CSP report sink, health monitoring, incident runbook |
| `security-headers-and-cicd-gates` | 11/14 | nosniff/frame/referrer/permissions headers, HSTS, nonce CSP (report-only → enforce) with a violation sink, PHPCS security sniffs + gitleaks + artifact guard required for merge, `docs/security-gates.md` |
| `security-next-edge-trust-boundaries` | 13/14 | Next.js proxy render token, receiver streaming cap, HTTPS-only image hosts, sink allowlist lint, mock-API HMAC (#18) |
| `security-remove-duplicator-and-purge-artifacts` | 0/16 | Superseded by `open-source-release-readiness` |
| `security-sanitize-url-sinks` | 12/12 ✓ | `progressnow_safe_url()` scheme allow-list on every `:href`/`:src` sink (#15) |
| `security-template-output-escaping` | 14/15 | Twig autoescape on, one script-context JSON encoder, double-escape sweep, hostile-content regression suite, `\|raw` audit gate (#17) |
| `single-source-shared-ui` | 0/14 | `packages/contracts` + `packages/shared-ui` replace the ~400 byte-identical files copied between the theme, `nuxt-js`, and `next-js` |
| `test-credibility-coverage-and-mutation` | 0/14 | Coverage thresholds for every suite, deliberate fixture regeneration, mutation testing for the security-critical helpers |
| `theme-integration-and-a11y-gate` | 0/17 | `wp-env` CI job, Playwright suite for the PHP theme, axe-core gate over every theme route × language × a11y mode, real-DB REST tests |
| `workspace-toolchain-baseline` | 0/14 | Root `package.json` workspaces with fan-out scripts, shared ESLint/Prettier/vitest configs, `.editorconfig`, one major per tool across apps, the PHP floor declared once |
<!-- openspec:roadmap:end -->

Known items carried over from the theme README: Spanish home resolves at `/es/inicio/` (Polylang 301 from `/es/`); event teaser dates render in English (`wp_date()` switch pending); CI (`.github/workflows/ci.yml`) runs the theme and site lint/typecheck/test jobs plus a mock `generate` + `verify:output` smoke build.

## Contributing

**Honest status of this repo.** This was created completely using Claude Code (Fable 5.1 and Opus 5). No line of PHP, Twig, Vue, TypeScript, Terraform or YAML here was hand-typed by a developer. A single person described what they wanted, read the output as carefully as time allowed, and merged it. That person is not a full-time engineer on this project and did not verify every branch of every file.

What that means in practice:

- **Hallucinations are likely.** WordPress hooks, Polylang / ACF functions, Nuxt options and Terraform arguments may be subtly wrong or entirely invented. If something looks off, it probably is.
- **The tests prove less than they appear to.** Fixtures, zod schemas and PHPUnit cases were also AI-written. A green CI run means the AI agreed with itself, not that the behavior is correct.
- **The docs are aspirational.** This README, the theme README and everything in `openspec/` describe intent. Where the docs and the code disagree, trust neither until you've run it.
- **Security has not been audited.** Several open `security-*` changes in the [Roadmap](#roadmap) exist precisely because nobody has done the pass yet.

**Maintainer.** [Cesar Gonzalez](https://github.com/cagonzalezcs) (`@cagonzalezcs`) is the sole maintainer. Reviews happen when there's time, which is not always soon. There is no SLA.

**Contributions are open.** Always, for now. Send a PR for anything: a one-character typo, a hallucinated function, a missing null check, a rewrite of a whole module. It does not matter whether a human wrote the patch or an AI did, as long as you ran it and can say what it changes. Please:

1. Say in the PR description whether the change was human-written, AI-written or mixed. Nobody will judge; it just tells the reviewer where to look harder.
2. Include how you verified it (command you ran, page you loaded, test you added).
3. Keep unrelated changes in separate PRs so a partial review can still merge something.
4. Expect the security gates: PHPCS security sniffs over the theme, gitleaks and the artifact guard are required checks on `main`. [`docs/security-gates.md`](docs/security-gates.md) says how to run them locally and what to do when one fails (spoiler: fix the code; a bare `phpcs:ignore` or a directory-wide allowlist is a review blocker).

**Add yourself to `humans.txt`.** Every site built from this repo ships [`wp-content/themes/progressnow/humans.txt`](wp-content/themes/progressnow/humans.txt). If you contribute, add your name and a link (GitHub, LinkedIn, personal site, whatever you like) under **Team** in the same PR. Being listed there is the only credit this project can offer, so take it.

## License

MIT — see `LICENSE`. Third-party assets and plugins (ACF Pro, Polylang Pro, fonts) carry their own licenses and are not covered.
