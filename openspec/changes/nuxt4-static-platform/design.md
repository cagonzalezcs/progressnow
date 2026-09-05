## Context

The site is a WordPress install (repo root = docroot) with one custom theme, now `wp-content/themes/progressnow` ("Progress Now", renamed from the single-chapter build): Timber/Twig page shells, a PHP data layer (`inc/*.php`, one file per domain, ACF Pro, Polylang Pro EN/ES), a first-party read API (`/wp-json/progressnow/v1`, transient + ETag cached, content-version invalidated), hand-rolled SEO head output (`inc/seo.php`), and a Vite-built Vue 3 bundle that mounts islands on `[data-vue-island]` and drives a custom client-side navigation layer (`src/ts/navigation.ts`: `<main>` swap + View Transitions + hover prefetch). Contracts are zod schemas (`src/lib/schemas.ts`) asserted from both sides via committed JSON fixtures.

Constraints that shape this design:

- **PHP must stay the first responder** for every public URL — crawlers, deep links, and no-JS visitors get complete, PHP-populated HTML.
- **After first paint the visitor lives inside a statically generated Nuxt 4 app**, not in PHP page loads — and the process must be seamless (no visible swap, no dead clicks, no stale content).
- **No `node` on the WordPress host.** Rebuilds are triggered over HTTPS and run elsewhere (GitHub Actions by default). Local development may run npm scripts; production PHP never spawns a process.
- **Deployment is out of scope for this change.** Code, a GitHub Actions workflow, a reference Terraform module, and a guide are delivered; the operator provisions hosting. A CDN (CloudFront) is possible but not required.
- **Functional parity is a hard requirement** — every current behavior (EN/ES incl. Spanish content, calendar, blog search/filter/pagination, single post/event, a11y widget, view transitions, ICS feed, editable content, SEO output) must survive unchanged from the visitor's and editor's point of view; the front page should stay visually close to the current build.
- **No regional references** may remain on any visible surface, in either language; Spanish translations are kept, only regional mentions are rewritten. Placeholders ship in-repo with generic names and the chapter replaces them.
- The DB is not versioned; local MAMP hosts WordPress; the worktree checkout contains only tracked files, so WP core/config/uploads must be linked in to run it (`bin/worktree-bootstrap.sh`).
- Seven `security-*` changes are pending; this design must not contradict them (CSP with `'self'` module scripts and a non-executable JSON payload; REST rate/size limits apply to new endpoints).

Stakeholders: front-end team (owns `site/` after scaffold), backend (theme data layer, shell, pipeline, reference infra), chapter editors (wp-admin, no new workflow beyond a "Rebuild" button), the operator who deploys.

## Goals / Non-Goals

**Goals:**
- Reader-, crawler-, and editor-visible brand neutrality; chapter identity is data, not code.
- PHP shell → Nuxt takeover with zero refetch for the landing route and no perceptible swap.
- One public domain for pages, assets, and payloads — with or without a CDN.
- Deterministic, coalesced rebuilds; WordPress knows what build is live; editors never have to think about it.
- A rebuild/deploy path the operator can adopt as-is (GitHub Actions) or adapt (webhook + Terraform reference).
- Contracts stay dual-asserted (PHP fixtures ↔ zod) across the new endpoints.

**Non-Goals:**
- Provisioning or operating hosting/AWS. Reference infra only.
- Nuxt SSR at request time (would need Node on the request path). The app is `nuxt generate` only.
- Replacing Polylang, ACF, Timber, or the REST caching model.
- Visual redesign. Pixel parity with today's islands is the target, with the brand-neutral placeholder swaps as the only intentional visual change; chapters restyle through Chapter Settings and the placeholder files.
- Multi-site/multi-chapter tenancy. One chapter per install.
- Completing the pending `security-*` changes (only compatibility with them).

## Decisions

### D1. Handoff model: PHP shell first, Nuxt client-mounts and takes over
Every public URL is served by WordPress. Twig renders the full `<head>` (existing `inc/seo.php`), a `<div id="__nuxt">` whose children are the crawlable chrome + content for the route, a `<script type="application/json" id="__SHELL_DATA__">` route payload, and the app tags from the build manifest in Nuxt's own order: `<script type="importmap">` (the entry chunk imports `#entry`), stylesheet + modulepreload links, an inline `<script>window.__NUXT__={config:…}</script>` carrying the public runtime config, then `<script type="module" src=entry>`. Because the document carries no `__NUXT_DATA__` (Nuxt 4.5 reads `window.__NUXT__.serverRendered`, absent → false), the client entry boots with `createApp` (not `createSSRApp`) and mounts into `#__nuxt`, replacing the shell children — no hydration, so no hydration-mismatch class of bugs. A `shell.client.ts` plugin reads `__SHELL_DATA__` into a store before route setup; a `useChapterData(key, fetcher)` composable wraps `useAsyncData` with `getCachedData` reading that store first, so the landing route renders from embedded data without a request. Subsequent navigations are Nuxt router navigations resolving data from the static build's `_payload.json` files (see D3), i.e. "completely inside the static rendition".

Seamlessness rules: the shell and the app share one CSS bundle and the same section structure, the app mounts before fonts settle (critical inline background stays), scroll position and hash target are preserved, internal links are prefetched on hover/focus, and the mount never blocks on network.

*Alternatives:* (a) Nuxt hydrating PHP markup — rejected: markup would have to match Nuxt's SSR output byte-for-byte; every Twig/Vue drift becomes a hydration error. (b) Static-first (CDN serves prerendered HTML, WP only as API) — rejected: contradicts "PHP first" and makes canonical/SEO ownership ambiguous. (c) Keep the custom `navigation.ts` SPA layer — rejected: it is what the team wants to retire.

### D2. Static assets on the site's own domain, with or without a CDN
Nuxt's chunk and payload URLs are `baseURL`-relative, so `/_nuxt/*`, `*/_payload.json`, `/_payload.json`, and `/shell-manifest.json` must resolve on the WordPress domain. Two modes, selected by configuration, identical to the app:

- **Same-host mode (default).** The build output is synced into `CHAPTER_STATIC_DIR` (default `<docroot>/static-site/`, gitignored). The web server serves those paths straight from disk (documented Apache `.htaccess` and nginx snippets with the right cache headers); `inc/shell.php` also registers a PHP passthrough for the same paths so the site works before the server rules exist (and in local dev). `CHAPTER_STATIC_ORIGIN` defaults to the site URL, so the manifest is read from the same place.
- **CDN mode (optional).** One CloudFront distribution fronts the domain: behaviors for the static paths → private S3 bucket (OAC); default → WordPress origin honoring origin cache headers and forwarding cookies/`Authorization`/query strings. Optional origin-group failover to the prerendered HTML. The reference Terraform module provisions this; nothing else in the code changes.

*Alternative:* separate `static.<domain>` origin + `app.cdnURL` — rejected: payload fetches would still need a same-origin path, and every script tag needs CORS.

### D3. Static rendition = `nuxt generate` with payload extraction, driven by a route manifest
`site/` is a Nuxt 4 app (`app/` dir). One catch-all page, `app/pages/[...slug].vue`, resolves every path (including `/` and `/es/`) against the `/routes` manifest (kind ∈ `front | page | posts_index | post | event | calendar | about | get_involved | styleguide | search | not_found`, `lang`, `payloadKey`) and renders the matching `components/routes/Route*.vue`; `/blog/page/N/`, `/category/{slug}/` and `?s=` map onto the posts index. At build time `modules/routes-manifest.ts` fetches `/routes` once, bundles it (`#build/progressnow-routes.mjs`, so resolution never needs a request and the manifest is not duplicated into every payload) and feeds `nitro.prerender.routes` (both languages); an unknown path re-reads `/routes` from REST once before rendering 404, so content published after the last build still resolves. `nuxt generate` writes `index.html` + `_payload.json` per route plus `_nuxt/builds/{latest,meta}` so `isPrerendered()` works on the client. Client navigation to a prerendered route loads its `_payload.json`; non-prerendered states (search results, archive page N via query, filtered archives, calendar windows) fetch the REST API directly — exactly the current island behavior. Search is `noindex` today and stays client-fetched.

### D4. Freshness guard
Every shell embeds `contentVersion` (the existing `progressnow_content_ver`) and the live build id. The app compares the shell's `contentVersion` with `shell-manifest.json`'s. If the shell is newer (a rebuild is in flight or the transport is `none`), the session resolves navigations from REST until a manifest with a version ≥ the shell's is observed — visitors never navigate from fresh PHP content into stale static content, and a site with no rebuild pipeline configured still works (just without payload caching).

### D5. Build manifest contract (`shell-manifest.json`)
Emitted at the end of `nuxt generate` by a local Nuxt module (`nitro:build:public-assets`, i.e. after the client bundle and `_nuxt/builds/*` are in `.output/public`) and uploaded **last** so it only ever points at fully uploaded assets: `{ buildId, builtAt, contentVersion, entry: "/_nuxt/<entry>.js", css: [...], modulepreload: [...], prefetch: [...], importmap: { "#entry": … }, prerenderedRoutes: n, runtimeConfig: { public, app } }` — extracted from the generated `200.html` (the SPA fallback), including Nuxt's inline `window.__NUXT__.config`. PHP (`inc/shell.php`) reads it from `CHAPTER_STATIC_ORIGIN` (or straight from `CHAPTER_STATIC_DIR` on disk in same-host mode), caches it in a 60 s transient, and renders the importmap, `<link rel="stylesheet">`/`<link rel="modulepreload">`, the `window.__NUXT__` config script, and `<script type="module">` tags in that order. Payload URLs carry a build query (`/_payload.json?_b=<buildId>`); the passthrough serves them ignoring the query string. A changed `buildId` triggers page-cache purge (WP Super Cache when present) and clears the transient. If the manifest is missing the shell still renders (crawlable) and logs once per minute.

*Alternative:* parse Nuxt's own `_nuxt/builds/latest.json` + client manifest — rejected: the client manifest isn't in the public output and entry names aren't stable across Nuxt versions.

### D6. Additive REST endpoints, same serializers, same cache
`progressnow/v1` gains `GET /site` (chrome: menus per language, identity, socials, registered strings, languages, and the post/event categories so the app seeds its palette without a second request), `GET /routes`, `GET /front-page`, `GET /pages/{path}` (template-aware: About/Get Involved/Calendar/interior groups, documents, grievance, kses'd content), `GET /events/{slug}`, and `POST /build-status` (signed, optional). All accept `lang`; all route payloads carry `seo: { title, description, canonical, robots, hreflang }` produced by `inc/seo.php` refactored to take an explicit subject instead of reading the global query. Everything goes through `progressnow_cache_remember()` and the existing ETag path. The Twig shell and REST reuse the same serializer output, so the embedded payload equals what generate fetches — by construction, as today.

### D7. Rebuild orchestration: WordPress dispatches, a workflow builds, a target receives
**WordPress (`inc/rebuild.php`):** `progressnow_cache_bump_version()` (already the single choke point for content writes) also schedules a WP-Cron single event `progressnow_rebuild_dispatch` +90 s if none is pending (debounce). The dispatcher sends `{ event: "rebuild", requestId, contentVersion, reason, siteUrl, requestedAt }` through the configured transport (`CHAPTER_REBUILD_TRANSPORT`):

- `github` (default): `POST https://api.github.com/repos/{CHAPTER_GITHUB_REPO}/dispatches` with `event_type: "rebuild-site"` and the payload as `client_payload`, authenticated with a fine-grained token (`CHAPTER_GITHUB_TOKEN`, contents: write). GitHub replies 204.
- `webhook`: `POST CHAPTER_REBUILD_WEBHOOK_URL` with `X-Chapter-Timestamp` and `X-Chapter-Signature: sha256=HMAC(CHAPTER_REBUILD_SECRET, ts + "." + body)`; expects `202 { buildId, status }`. This is the contract for an AWS receiver (or anything else) if the operator prefers.
- `none`: nothing is dispatched; the freshness guard keeps the site correct.

Failures retry ×3 with backoff, then surface as an admin notice and `needs_attention` state. State lives in option `chapter_build_state` (`requestedVersion`, `liveVersion`, `liveBuildId`, `status`, `lastError`, `updatedAt`). A wp-admin "Site build" panel (under Chapter Settings) shows state and a "Rebuild now" button; `wp chapter rebuild [--wait]` / `wp chapter build-status` do the same from the CLI. Recommendation for hosts: `DISABLE_WP_CRON` + system cron hitting `wp-cron.php` each minute.

**Workflow (`.github/workflows/rebuild-site.yml`):** triggers `repository_dispatch` (`rebuild-site`), `workflow_dispatch`, and pushes to `main` touching `site/`. `concurrency: rebuild-site` with `cancel-in-progress: false` gives GitHub's native coalescing (one running, one queued; further requests collapse into the queued run). Steps: checkout → Node 22 → `npm ci` → `npm run generate` with `NUXT_PUBLIC_WP_API_BASE` (repo variable) and `CHAPTER_CONTENT_VERSION` (from the payload) → deploy by repo variable `STATIC_DEPLOY_TARGET`: `s3` (`aws-actions/configure-aws-credentials` via OIDC, two-pass `aws s3 sync` with cache-control classes, manifest uploaded last, `create-invalidation` when `CLOUDFRONT_DISTRIBUTION_ID` is set), `rsync` (SSH key secret, sync into `CHAPTER_STATIC_DIR` on the host, manifest last), or `artifact` (upload only, for dry runs) → optional signed `POST /build-status` back to WordPress.

**Reference infra (`infra/terraform/`):** S3 bucket (private, OAC), optional CloudFront distribution with the path behaviors of D2 and the WordPress origin, and a GitHub OIDC role scoped to the bucket/distribution — with outputs the workflow variables need. Provided for the operator; not applied by this change.

*Alternatives:* AWS CodeBuild + Lambda webhook (CloudFormation) — viable and matches the `webhook` transport, but the operator asked to own deployment and may not use AWS at all; kept as the documented AWS option in the guide. Lambda running `nuxt generate` — rejected (15-min cap, packaging). CDK — rejected (needs `node` to deploy).

### D8. Local development
`CHAPTER_STATIC_DIR` pointed at `site/.output/public` makes the PHP passthrough serve a local generate; `nuxt dev` works standalone against the local WordPress API (proxy in `nuxt.config.ts`) for component work. `bin/worktree-bootstrap.sh` symlinks the untracked WordPress runtime into a worktree so MAMP can serve it.

### D9. Brand neutrality as data (implemented)
`inc/identity.php` registers Chapter Settings → Identity & brand — `chapter_name`, `chapter_short_name`, `region_label`, `hero_headline_text`, `hero_headline_image` (+alt), `hero_photo`, `who_we_are_image` (+alt), `cta_panel_image`, `logo_header`, `logo_footer`, `logo_square`, plus the existing `default_share_image` — and exposes `progressnow_identity()` with neutral defaults ("Progress Now", "Progress Now", "our community", "A better world is possible!"). Every default string in `inc/options.php`, `inc/pages.php`, the Twig ledes, and the seed (EN + ES) is built from the identity; the Polylang string group is "Chapter". Placeholders in `static/images/brand/` use generic names: `logo-header.svg`, `logo-footer.svg`, `logo-square.{svg,png}`, `share-default.jpg`, `hero-photo.jpg` (+2x), `feature-art.svg` (replaces the county map at the same viewBox), `cta-panel.svg` (replaces the luchador panel; decorative), `about-photo.jpg` — photos are picsum.photos frames. The hero headline is real text styled by `.hero-headline` (layered green offset) unless artwork is uploaded. The "¡Ponte trucha sigue la lucha!" CTA band and its flames are kept as-is. Socials/newsletter have no default and their UI renders only when configured. The ICS feed is `chapter-events` with 301s from both legacy slugs; the a11y storage key is `chapter-a11y` with one-time migration. `bin/scrub-brand.sh` performs the rename data migration and the phrase scrub (EN + ES) with serialization-safe `wp search-replace`, re-seeds, and prints an audit. `tests/test-brand-audit.php` guards the shipped files, contexts, ICS, and seed.

### D10. Tests
PHPUnit (WorDBless) covers: identity defaults and overrides, brand audit, new REST envelopes (fixture equality), shell rendering (root element, payload JSON, manifest tags, admin-bar bypass, passthrough MIME/traversal), rebuild dispatch (HTTP mocked via `pre_http_request`: both transports, debounce, retry, lost-update re-dispatch, callback idempotency). vitest in `site/` covers zod fixtures (reading the theme's `tests/fixtures`), the shell store/`useChapterData` cache path, freshness guard, and route resolution. CI adds a `site` job that runs `nuxt generate` against a nitro mock API (`site/server/mock/**`, enabled by `NUXT_MOCK_API=1`, backed by the same fixtures) so the build path is exercised without a live WordPress. Parity is verified with a written checklist (spec `nuxt-static-site`) executed on the worktree before the islands are deleted.

## Risks / Trade-offs

- [Visible swap at takeover] → Shell and app share one CSS bundle (Tailwind `@source` includes the theme's `views/`), shell markup mirrors the app's section structure and tokens, critical background inline stays; measure CLS on front/post/calendar before sign-off.
- [Nuxt boot semantics on a non-Nuxt document change across versions] → Pin Nuxt minor in `site/package.json`; a vitest/happy-dom smoke loads the generated entry into a shell fixture and asserts mount + no refetch; upgrade Nuxt deliberately.
- [Payload key drift PHP ↔ app] → One documented key grammar (`site:{lang}`, `routes`, `front:{lang}`, `page:{lang}:{path}`, `post:{lang}:{slug}`, `event:{lang}:{slug}`, plus `posts:{lang}` for the posts page's first browse page), implemented once per side and asserted in the fixture tests.
- [Stale static vs fresh PHP during a rebuild window] → D4 freshness guard; payload TTL 60 s; invalidation in CDN mode.
- [No pipeline configured yet] → `CHAPTER_REBUILD_TRANSPORT=none` + the freshness guard keep the site fully functional (REST-backed navigation) until the operator wires a transport.
- [WP-Cron never fires on a quiet site] → System cron recommendation in the guide; the admin button and WP-CLI dispatch synchronously.
- [GitHub token on the WP host] → Fine-grained, single-repo, contents-write only; stored as a `wp-config.php` constant, never in the DB; the `webhook` transport exists for operators who prefer not to hold a GitHub token.
- [CDN in front of wp-admin/login] → Documented behaviors forwarding all cookies/headers and honoring origin `Cache-Control`; WordPress already sends `no-store` for logged-in REST and `no-cache` for admin.
- [Editors lose the "changes are instant" feel] → Shell always renders fresh PHP data (landing route is instant); client navigation is fresh through the guard; the admin panel shows build state.
- [Duplicated templating (Twig shell + Vue pages)] → Same as today's Twig + islands; shell views are deliberately semantic and thin; Vue owns all interaction.
- [Worktree cannot run WP without core/config] → `bin/worktree-bootstrap.sh`; DB snapshot before the scrub migration; the scrub is idempotent.
- [Nuxt `generate` needs a reachable WP API in CI] → nitro mock API from fixtures (D10).
- [Placeholders ship as final until the chapter uploads art] → Everything is overridable in Chapter Settings; the placeholders are deliberately plain.

## Migration Plan

1. **Bootstrap** — worktree `cg/nuxt4-static-platform` (done), `bin/worktree-bootstrap.sh` (done), DB snapshot before the scrub (operator, MySQL must be running).
2. **Rename + brand scrub (done, shippable alone)** — theme renamed, identity layer, neutral defaults EN/ES, placeholder assets, seed rewrite, feed rename + redirects, storage-key migration, `bin/scrub-brand.sh`, brand-audit test; PHPUnit/vitest/typecheck/lint green. Remaining: run the scrub against the local DB.
3. **Contracts** — new REST endpoints + SEO refactor + fixtures; theme-side islands keep working (nothing removed yet).
4. **Nuxt app** — scaffold `site/`, port components/CSS/schemas/tests, route manifest module, shell store, mock API, CI job; `nuxt generate` succeeds against local WP and against the mock.
5. **Shell + handoff behind a flag** — `CHAPTER_FRONTEND=islands|nuxt` (`wp-config` constant, default `islands`) selects Vite islands vs shell+Nuxt; same-host passthrough serves a local generate; parity checklist executed on `nuxt`.
6. **Rebuild pipeline (code + reference)** — `inc/rebuild.php` (transports), admin panel, WP-CLI, `rebuild-site.yml`, `infra/terraform/`, `docs/deployment.md`. Operator provisions hosting from the guide.
7. **Cutover + cleanup** — flip `CHAPTER_FRONTEND=nuxt` once a build is live, watch build state and CLS/SEO checks for a release cycle, then delete `src/`, `dist/`, `vite.config.js`, theme `package.json`, `@kucrut/vite-for-wp`, and the flag.

**Rollback:** until step 7, flipping the flag back restores the islands with no data changes (the scrub is content-only and intentional). After step 7, rollback is reverting the cleanup commit plus the flag. Reference infra is the operator's to keep or destroy.

## Open Questions

- Callback endpoint wanted (`POST /build-status`) or manifest polling only? Assumed both, callback optional.
- Same-host vs CDN mode for production — decided by the operator from the guide; code supports both.
- Final brand art: the in-repo placeholders are shipped as-is; the chapter replaces them in Chapter Settings.
