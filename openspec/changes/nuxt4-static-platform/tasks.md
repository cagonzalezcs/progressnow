## 1. Bootstrap the worktree

- [x] 1.1 Add `wp-content/themes/progressnow/bin/worktree-bootstrap.sh`: symlink untracked WP core (`wp-admin/`, `wp-includes/`, root `wp-*.php`, `index.php`), `wp-config.php`, `wp-content/{plugins,uploads,languages}` from the main checkout into a worktree; print the MAMP host/docroot steps
- [ ] 1.2 Snapshot the local DB (`wp db export` to a path outside the repo) before any content migration — operator step, needs MySQL running (`bin/scrub-brand.sh` also snapshots unless `--no-backup`)
- [x] 1.3 Remove the superseded empty scaffold `openspec/changes/deploy-pipeline/`

## 2. Rename + brand scrub — identity, defaults, assets, seed

- [x] 2.0 Rename the theme to Progress Now: `wp-content/themes/progressnow`, text domain, `progressnow_*` prefix, `progressnow/context/*` filters, `progressnow/v1` REST namespace, `progressnow/*` blocks, `field_progressnow_*` ACF keys, options-page slug, CI paths, openspec specs/changes
- [x] 2.1 Add `inc/identity.php`: Chapter Settings → Identity & brand (`chapter_name`, `chapter_short_name`, `region_label`, `hero_headline_text`, `hero_headline_image`+alt, `hero_photo`, `who_we_are_image`+alt, `cta_panel_image`, `logo_header`, `logo_footer`, `logo_square`); `progressnow_identity()` accessor with neutral defaults and placeholder fallbacks; exposed through `StarterSite::add_to_context()` (`chapter` + `identity`)
- [x] 2.2 Rewrite EN default copy with identity placeholders and no regional tokens: `inc/options.php` (hero, who, committees, "New here?"), `inc/pages.php` (About intro/history/timeline/Where-We-Organize, Get Involved steps/channels/FAQ), `inc/interior.php`, `inc/i18n.php` (headline/alts, "Where We Organize"), `inc/blocks.php`, Twig lede fallbacks (`index`, `page-about`, `page-calendar`, `page-get-involved`)
- [x] 2.3 Rewrite the ES defaults/seed translations the same way — Spanish stays Spanish, only regional mentions change
- [x] 2.4 `src/StarterSite.php`: social/newsletter defaults → empty; `inc/seo.php`: `og:site_name`/`Organization.name` from identity, `sameAs` only for configured socials, share-image fallback = shipped placeholder, `logo` = square logo
- [x] 2.5 `inc/events.php`: ICS `PRODID`/`X-WR-CALNAME` from identity; feed `chapter-events`; both legacy slugs 301 to it; `progressnow_events_build_ics()` split out for tests
- [x] 2.6 Polylang string group "RGV DSA" → "Chapter"
- [x] 2.7 Current islands: SiteHeader/SiteFooter take `orgName`; share subjects/title suffix dropped; subscribe strip and Instagram channel render only when configured; styleguide demo data neutral; a11y key `chapter-a11y` with one-time migration from the old key
- [x] 2.8 Artwork: regional files removed (`hero-headline.svg`, `county-map.svg` + partial, `luchador-panel.svg`, `logos/`, `cactus-mark-red.png`, webp variants); placeholders added with generic names (`logo-header.svg`, `logo-footer.svg`, `logo-square.{svg,png}`, `feature-art.svg`, `cta-panel.svg`, `share-default.jpg`, `hero-photo.jpg`+2x, `about-photo.jpg` — photos from picsum.photos); hero headline rendered as text via `.hero-headline`; brand README rewritten
- [x] 2.9 Theme metadata: `style.css` (Progress Now), theme `README.md`, `humans.txt`
- [x] 2.10 Rewrite `bin/seed.php` demo content EN + ES (event venues, titles, descriptions, pages, options, string translations) with no regional tokens; idempotency and Polylang linking kept
- [x] 2.11 Add `bin/scrub-brand.sh`: `--yes` confirmation, snapshot, rename data migration (block names, ACF keys, options slug, theme mods, content version, active theme), EN/ES phrase replacements via `wp search-replace`, `blogname`/`blogdescription`, re-seed, rewrite flush, audit query
- [x] 2.12 Tests: `tests/test-brand-audit.php` (shipped files, placeholder assets, contexts, ICS, legacy slugs, seed ES); `test-seo`, `test-front-page`, `test-pages` updated for identity + no-placeholder socials; PHPUnit 105 green, vitest green, vue-tsc + eslint clean
- [ ] 2.13 Run `bin/scrub-brand.sh --yes` against the local DB (MAMP/MySQL up); audit reports zero; spot-check `/`, `/es/`, About, calendar, ICS feed in both languages
- [x] 2.14 Organization scrub (user decision): no DSA anywhere — identity defaults "Progress Now"; "Join us" CTA pointing at Get Involved; membership/dues/YDSA copy rewritten EN + ES; `dsausa.org` links removed; font "Manifold DSA" → "Manifold" (`static/fonts/manifold/Manifold-*.woff2`); star mark replaces the rose in all placeholder art; brand-audit pattern extended; `bin/scrub-brand.sh` migrates the DB phrases

## 3. REST contracts (theme)

- [x] 3.1 Refactor `inc/seo.php` into subject-based builders (`front`, `page`, `post`, `event`) returning `{ title, description, canonical, robots, hreflang }`; head output consumes the same builder
- [x] 3.2 Add `progressnow_payload_key()` and the route payload builders (`inc/payloads.php`: site/routes/front/page/post/event) shared by Twig and REST; context filters named so they run outside the main query
- [x] 3.3 `GET /site` (menus per language, identity, socials, strings, languages) built from the same context as the shell (`StarterSite::chapter_context()`, per-language menu locations)
- [x] 3.4 `GET /routes` manifest: both languages, published only, page templates mapped to `kind`
- [x] 3.5 `GET /front-page`, `GET /pages/{path}` (About/Get Involved/Calendar/interior groups, documents, grievance, kses'd content), `GET /events/{slug}`; 404 error codes
- [x] 3.6 `lang` on every endpoint with cache-key participation (`progressnow_lang_switch()` makes Polylang follow it); `seo` block on `/front-page`, `/pages/{path}`, `/posts/{slug}`, `/events/{slug}`
- [x] 3.7 Signature helper (HMAC + timestamp window) and `POST /build-status` (idempotent per `buildId`, 401 on bad signature) — `inc/rebuild.php` (dispatcher + transports landed with it, see 6.1)
- [x] 3.8 Fixtures + PHPUnit contract tests for `site`, `routes-manifest`, `front-page`, `page-about`, `page-get-involved`, `page-calendar`, `single-event`; zod schemas for every new envelope + `shell-manifest`/`shellData` (theme `src/lib/schemas.ts`, moves to `nuxt-js/` in 4.3); PHPUnit 137 green, vitest 22 green

## 4. Nuxt 4 app (`nuxt-js/`)

- [x] 4.1 Scaffold `nuxt-js/` (Nuxt 4.5 `app/` layout, pinned versions, Node 22 engines), eslint (`@nuxt/eslint` + vuejs-accessibility)/prettier/tsconfig/vitest config, `nuxt-js/.htaccess` (deny), `nuxt-js/.gitignore`, `.env.example`, `README.md`
- [x] 4.2 `app/assets/css/tailwind.css` with absolute theme URLs for fonts/masks; `@source` for the theme's `views/` and `inc/`
- [x] 4.3 `nuxt-js/app/lib`: schemas (copy of the theme's, now with `categories` on the site envelope, `showMetaRail` on single posts, `prefetch`/`importmap`/`runtimeConfig` on the shell manifest), api (`$fetch`-aware + route-payload fetchers), posts/events/languages/menu/utils/fixtures; router-backed `location.ts` + `url-state.ts` (the theme got the `history` twin, islands use it); `@fixtures` alias → theme `tests/fixtures`
- [x] 4.4 Components copied verbatim (`components.json` updated); SSR guards landed in the theme sources first (SiteHeader origin, BlogArchive/EventCalendar url-state, useA11ySettings)
- [x] 4.5 `modules/routes-manifest.ts`: fetches `/routes` once per build, bundles it (`#build/progressnow-routes.mjs`) and feeds `nitro.prerender.routes`; absolute-URL check + fetch failure fail the build; `prepare` skips, mock uses fixtures
- [x] 4.6 `plugins/shell.client.ts` (parse + seed `payload.data`, manifest fetch → guard) + `useChapterData()` (`resolveCached` order) + `middleware/freshness.global.ts`; Nuxt-free logic in `app/lib/chapter/*`
- [x] 4.7 One catch-all `pages/[...slug].vue` (covers `/` and `/es/`) → `components/routes/Route{Front,Page,About,GetInvolved,Calendar,PostsIndex,Post,Event,NotFound,Styleguide}.vue`; `layouts/default.vue` chrome from `site:{lang}`; `error.vue` for runtime errors, RouteNotFound keeps the chrome and re-reads `/routes` once
- [x] 4.8 Behaviors ported: archive (island + `/page/N/`, `/category/`, `?s=`), single post (read-next from `readNext`), calendar (client-only island + skeleton), single event, About, Get Involved, interior sidebar, search, a11y widget, view transitions (`experimental.viewTransition`), hover/focus/touch payload prefetch + global link interception (`plugins/navigation.client.ts`), EN/ES switcher (full load via `data-native-nav`, as today); front page markup is the Twig 1:1
- [x] 4.9 `useRouteSeo()` → `useHead` (title/description/robots/canonical/hreflang + `html[lang]`); landing route keeps the PHP head, PHP `hreflang` alternates dropped on the first client navigation
- [x] 4.10 `modules/shell-manifest.ts`: written in `nitro:build:public-assets` (after the client bundle exists) from `200.html`; verifies referenced assets exist; fails the process on prerender errors
- [x] 4.11 `shared/mock-api.ts` + `server/routes/mock/v1/[...path].get.ts` (inert unless `NUXT_MOCK_API=1`); `npm run generate:mock`; `scripts/verify-output.mjs`
- [x] 4.12 `nuxt.config.ts`: `ssr: true`, payload extraction, `rootId` `__nuxt`, `features.inlineStyles: false`, `components: { dirs: [] }`, prerender from the module (no crawling), dev proxy for `/wp-json` + `/wp-content`
- [x] 4.13 vitest (56): contract fixtures + mock envelopes, route resolution, shell reader/store, cache order, freshness guard, head, link detection, manifest extraction, categories drift. Boot smoke deferred to 5.7 (real shell + browser)
- [x] 4.14 CI `site` job: `npm ci`, lint, typecheck, test, mock generate, `verify:output`, output artifact; PHPUnit job kept
- [ ] 4.15 `nuxt generate` against local WordPress succeeds for both languages; inspect `.output/public` (routes, payloads, manifest) — mock generate verified (15 routes, en + es, SSR head/lang/canonical/hreflang correct); the real run needs the Progress Now theme active on MAMP

## 5. PHP shell + handoff

- [x] 5.1 `inc/shell.php`: `CHAPTER_FRONTEND` (`islands` default | `nuxt`), manifest from `CHAPTER_STATIC_DIR` (disk) or `CHAPTER_STATIC_ORIGIN` (HTTP) + 60 s transient (positive and negative), tags on `wp_head` (importmap → css → modulepreload → `window.__NUXT__.config` → module entry → prefetch), degraded mode logs once per minute, admin-bar bypass with `data-frontend="php"`; islands bundle/font preloads gated in `StarterSite`
- [x] 5.2 `views/base.twig`: `#__nuxt` root + `__SHELL_DATA__` (`JSON_HEX_TAG|JSON_HEX_AMP`) with `lang`, `routeKind`, `path`, `contentVersion`, `buildId`, `data` (`site:{lang}` + the route's payload; `posts:{lang}` on the posts index); `html-header.twig` carries `html_data_attrs`
- [x] 5.3 Shell markup: `partials/shell-header.twig` + `shell-footer.twig` (plain anchors, same classes as the islands), `partials/page-header.twig` replaces the PageHeader island in every interior view (both modes), FaqAccordion and EventCalendar mount points carry server fallbacks (`calendar_upcoming` from `inc/events.php`); front page, About, Get Involved, single post/event, archive and 404 were already server-rendered
- [x] 5.4 Passthrough (`init` priority 0) for `/_nuxt/*`, `*/_payload.json`, `/_payload.json`, `/shell-manifest.json` from `CHAPTER_STATIC_DIR` — MIME map, `immutable`/`max-age=60`, ETag/304, traversal + NUL rejection, query string ignored, inert without the constant; web-server snippets → `docs/deployment.md` (6.7)
- [x] 5.5 New-build detection: `progressnow_shell_observe_build()` → `progressnow_rebuild_mark_live()`, WP Super Cache purge, `progressnow/shell/new_build` action; transient refreshed on the fetch
- [x] 5.6 PHPUnit `tests/test-shell.php` (20 tests): mode/bypass, manifest disk/HTTP/degraded/cached, tag order, wp_head gating, `__SHELL_DATA__` equality vs the REST builders for post/page/front/posts-index/search, HTML-safe JSON, key grammar, passthrough resolution, new-build idempotency, compiled `base.twig` in both modes
- [ ] 5.7 Local end-to-end with `CHAPTER_FRONTEND=nuxt` + passthrough: confirm takeover with zero landing-route requests, measure CLS on front/post/calendar, both languages
- [ ] 5.8 Execute the functional-parity checklist (spec `nuxt-static-site`) in EN and ES; file and fix every gap before cutover

## 6. Rebuild pipeline (code + reference infra)

- [x] 6.1 `inc/rebuild.php`: constants, `chapter_build_state`, debounced cron dispatch from the content-version bump, github/webhook transports with 3 retries + backoff, lost-update re-dispatch, admin notices (landed in phase 3)
- [x] 6.2 `inc/admin-build.php`: "Site build" under Chapter Settings (Tools without ACF) — state/manifest/config rows, "Rebuild now" (`manage_options` + nonce via admin-post), "Re-check manifest"
- [x] 6.3 `inc/cli.php`: `wp chapter rebuild [--wait] [--timeout]` (polls state + manifest), `wp chapter build-status [--format=table|json]`
- [x] 6.4 PHPUnit `tests/test-rebuild.php` (github body/auth, webhook signature, debounce, retries → `needs_attention`, stale re-dispatch, callback idempotency, no process spawning) + `tests/test-admin-build.php`
- [x] 6.5 `.github/workflows/rebuild-site.yml` + `.github/scripts/build-status.mjs`: dispatch/manual/push triggers, `concurrency: rebuild-site`, Node 22, generate + verify, deploy by `STATIC_DEPLOY_TARGET` (`s3` OIDC two-pass sync + manifest last + optional invalidation | `rsync` manifest last | `artifact`), signed started/succeeded/failed callbacks
- [x] 6.6 `infra/terraform/` (S3 private/versioned/lifecycle, optional CloudFront with the D2 behaviors + failover, GitHub OIDC role scoped to bucket/distribution, `github_variables` output) — written against provider ≥ 5.40; `terraform validate` not run here (no terraform on this machine), operator to validate before the first plan
- [x] 6.7 `docs/deployment.md`: model, wp-config constants, repo variables/secrets, same-host Apache/nginx snippets, CDN mode, webhook/AWS receiver contract, first build + cutover, rollback, local dev

## 7. Cutover and cleanup

- [ ] 7.1 Set `CHAPTER_FRONTEND=nuxt` in production once a build is live (operator); monitor build state, canonical/hreflang/JSON-LD parity, and CLS for a release cycle
- [ ] 7.2 Remove the islands: theme `src/`, `dist/`, `vite.config.js`, `package.json`/lockfile, `@kucrut/vite-for-wp` (composer + `theme_enqueue_scripts`), `navigation.ts`, `data-vue-island` branches, the `CHAPTER_FRONTEND` flag; point `preload_fonts()` at the static font paths
- [ ] 7.3 Update `.github/workflows/ci.yml` (drop the theme JS job) and the theme README architecture section
