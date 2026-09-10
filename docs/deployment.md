# Deployment guide

How the pieces fit, what to configure, and how to run it locally, on a plain
host, behind CloudFront, or as a headless Next.js app on its own origin.
Everything the operator has to do is listed; nothing in any of these setups
runs `node` on the WordPress host.

Sections 1–9 cover the **PHP shell + Nuxt static rendition** (`nuxt-js/`).
Section 10 covers the **headless Next.js frontend** (`next-js/`). An install
runs one of the two; the PHP theme alone (no JS frontend) needs only the
theme active and `CHAPTER_REBUILD_TRANSPORT` left at `none`.

## 1. How it works

1. **WordPress serves every public URL first.** The theme (`wp-content/themes/progressnow`)
   renders a *shell*: the full SEO head, a `<div id="__nuxt">` with crawlable
   header/content/footer, a `__SHELL_DATA__` JSON payload for that route, and
   the app's script/style tags read from the static build's `shell-manifest.json`.
2. **The Nuxt app takes over.** The client entry mounts into `#__nuxt`, renders
   the landing route from the embedded payload (no request), and handles every
   later navigation from the prerendered `_payload.json` files under the same
   domain — falling back to the REST API for search/filter/calendar states and
   while a rebuild is in flight (the *freshness guard* compares the shell's
   `contentVersion` with the manifest's).
3. **Content changes rebuild the static site.** Every content write bumps the
   content version; `inc/rebuild.php` debounces (90 s) and dispatches a rebuild
   through a transport (GitHub `repository_dispatch` or a signed webhook). The
   build runs elsewhere (GitHub Actions by default), generates the site from
   `GET /wp-json/progressnow/v1/*`, and deploys the output. When WordPress sees
   a new `buildId` in the manifest it records the build live and purges its
   page cache.

Reference: `openspec/changes/nuxt4-static-platform/design.md`.

## 2. wp-config.php constants

```php
// Frontend mode: 'islands' (current Vite islands, default) or 'nuxt' (shell + static app).
define( 'CHAPTER_FRONTEND', 'nuxt' );

// Same-host mode: absolute path of the generated site (rsync target). Enables the
// PHP passthrough for /_nuxt/*, */_payload.json, /shell-manifest.json and reads
// the manifest from disk.
define( 'CHAPTER_STATIC_DIR', ABSPATH . 'static-site' );

// CDN / separate origin mode instead: where shell-manifest.json is fetched from
// (defaults to the site URL, which is right behind CloudFront).
// define( 'CHAPTER_STATIC_ORIGIN', 'https://example.org' );

// Rebuild transport: github | webhook | none (default github; falls back to none when incomplete).
define( 'CHAPTER_REBUILD_TRANSPORT', 'github' );
define( 'CHAPTER_GITHUB_REPO', 'owner/repo' );
define( 'CHAPTER_GITHUB_TOKEN', 'github_pat_…' );          // fine-grained PAT: Contents: read & write on that repo
// define( 'CHAPTER_REBUILD_WEBHOOK_URL', 'https://…' );   // webhook transport
define( 'CHAPTER_REBUILD_SECRET', 'long-random-string' );  // signs the webhook + the build-status callback
// define( 'CHAPTER_REBUILD_DEBOUNCE', 90 );               // seconds

// Content-Security-Policy delivery (inc/security.php; docs/security-gates.md):
// 'report-only' (default — violations land in `wp chapter csp-reports`),
// 'enforce' once the allow-list is tuned, 'off' only for debugging.
// define( 'CHAPTER_CSP_MODE', 'enforce' );

// WP-Cron drives the debounced dispatch. On real hosts disable the page-load
// cron and hit wp-cron.php from the system cron every minute:
define( 'DISABLE_WP_CRON', true );
//   * * * * * curl -s https://example.org/wp-cron.php?doing_wp_cron > /dev/null
```

`CHAPTER_FRONTEND` can stay `islands` while everything else is set up; the
rebuild pipeline and the static files are inert until the flag flips.

The theme sends its own security headers on every front-end response
(`nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`,
`Permissions-Policy`, HSTS over TLS) and a nonce CSP on HTML — see
`docs/security-gates.md` for the header set and the report-only → enforce
rollout. Do not add a second CSP at the proxy or CDN; a cache in front of
WordPress must store headers and body together (origin caches and CDNs do).

Every environment's `wp-config.php` also sets `WP_ENVIRONMENT_TYPE` and
requires the committed hardening baseline (`config/wp-config-hardening.php`:
debug policy, off-docroot log, `DISALLOW_FILE_EDIT`, `DISALLOW_UNFILTERED_HTML`, `FORCE_SSL_ADMIN`,
auto-update policy, startup assertion). Setup and the salt-rotation runbook:
[runtime-hardening.md](runtime-hardening.md).

## 3. GitHub repository configuration (transport `github`)

Settings → Secrets and variables → Actions:

| Kind | Name | Value |
| --- | --- | --- |
| variable | `WP_API_BASE` | `https://example.org/wp-json/progressnow/v1` (required) |
| variable | `STATIC_DEPLOY_TARGET` | `rsync` (same-host), `s3` (bucket/CDN) or `artifact` (dry run) |
| variable | `WP_BUILD_STATUS_URL` | `https://example.org/wp-json/progressnow/v1/build-status` (optional but recommended) |
| secret | `CHAPTER_REBUILD_SECRET` | same value as wp-config.php |
| rsync | `RSYNC_TARGET` (var) `RSYNC_SSH_KEY` (secret) `RSYNC_HOST_KEY` (var, **required**) | `deploy@example.org:/` (the rrsync-restricted key maps `/` onto `CHAPTER_STATIC_DIR`, §4), that key's private half, the host's `known_hosts` line — there is no trust-on-first-use fallback |
| s3 | `AWS_REGION` `AWS_ROLE_ARN` `S3_BUCKET` `CLOUDFRONT_DISTRIBUTION_ID` (vars) | from `terraform output github_variables` |

The workflow is `.github/workflows/rebuild-site.yml`: `repository_dispatch`
(`rebuild-site`), `workflow_dispatch`, and pushes to `main` touching `nuxt-js/`.
`concurrency: rebuild-site` queues at most one extra run — bursts of edits
collapse into one build. Three jobs: **build** (`npm ci --ignore-scripts`,
`nuxt prepare`, `nuxt generate` against `WP_API_BASE` with
`CHAPTER_CONTENT_VERSION` from the dispatch, verify, upload the output as a
workflow artifact) runs with a read-only token; **deploy-s3** or
**deploy-rsync** (by `STATIC_DEPLOY_TARGET`) downloads that artifact inside the
`production` environment and deploys it, manifest uploaded **last** — these are
the only jobs holding a deploy credential and they run only from `main`;
**report** sends the signed `POST /build-status` whatever happened. With
`STATIC_DEPLOY_TARGET=artifact` (the default) the build artifact is the result.
The workflow files themselves are linted on every push (`workflow-lint.yml`;
`docs/security-gates.md` § Pipeline supply chain).

**`production` environment (one-time checklist).** Settings → Environments →
`production`. GitHub creates it on the first deploy if it is missing; configure
it before that run:

1. *Deployment branches and tags* → **Selected branches** → `main`. A job that
   runs in an environment presents `repo:<owner>/<repo>:environment:production`
   to AWS whatever ref it started from; this rule is what ties that subject to
   `main`. It is one of three independent controls: the deploy jobs also refuse
   any ref but `main`, and the reference AWS role trusts only
   `ref:refs/heads/main` and `environment:production` (§5).
2. Optionally *Required reviewers*, for a human approval per deploy. The rest
   of the repository settings (branch protection, signed commits) are the
   checklist in `security-rebuild-transport-trust-boundary`.
3. The deploy secrets and variables (`RSYNC_SSH_KEY`, `AWS_ROLE_ARN`, …) may
   live at environment scope instead of repository scope; the jobs read both.

The WordPress side needs a GitHub token that can call
`POST /repos/{owner}/{repo}/dispatches` (fine-grained PAT, *Contents: read and
write*). Test it from the Site build panel (Chapter Settings → Site build →
"Rebuild now") or `wp chapter rebuild --wait`.

## 4. Same-host mode (no CDN)

The build is synced into `CHAPTER_STATIC_DIR` on the WordPress host
(`STATIC_DEPLOY_TARGET=rsync`). WordPress's passthrough serves the files even
without web-server rules; add the rules anyway so PHP never starts for assets.

**Apache (`.htaccess` in the docroot, above the WordPress block):**

```apache
# Nuxt static rendition (CHAPTER_STATIC_DIR = <docroot>/static-site)
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteCond %{DOCUMENT_ROOT}/static-site%{REQUEST_URI} -f
RewriteRule ^(_nuxt/.*|shell-manifest\.json|(.*/)?_payload\.json)$ /static-site/$1 [L]
</IfModule>
<IfModule mod_headers.c>
<LocationMatch "^/static-site/_nuxt/">
  Header set Cache-Control "public, max-age=31536000, immutable"
</LocationMatch>
<LocationMatch "^/static-site/.*(_payload\.json|shell-manifest\.json)$">
  Header set Cache-Control "public, max-age=60"
</LocationMatch>
</IfModule>
# Keep the source tree unreachable (nuxt-js/.htaccess also denies).
RedirectMatch 404 ^/nuxt-js/
```

**nginx:**

```nginx
location ^~ /_nuxt/ {
    root /var/www/html/static-site;
    add_header Cache-Control "public, max-age=31536000, immutable";
    try_files $uri =404;
}
location ~ ^/(shell-manifest\.json|(.*/)?_payload\.json)$ {
    root /var/www/html/static-site;
    add_header Cache-Control "public, max-age=60";
    try_files $uri =404;
}
location ^~ /nuxt-js/ { return 404; }
```

Note the `?_b=<buildId>` query string on payload requests — `try_files $uri`
and `%{REQUEST_URI}` ignore it, as does the PHP passthrough.

### Restricted deploy key (rrsync)

The key in `RSYNC_SSH_KEY` should be able to do exactly one thing: write files
into `CHAPTER_STATIC_DIR`. Generate a dedicated pair
(`ssh-keygen -t ed25519 -f rebuild-site -C rebuild-site -N ''`) and restrict
its public half in the deploy user's `~/.ssh/authorized_keys` with rrsync
(part of rsync ≥ 3.2.4: `/usr/bin/rrsync` on Debian/Ubuntu):

```
restrict,command="rrsync -wo /var/www/html/static-site" ssh-ed25519 AAAA… rebuild-site
```

- `restrict` turns off port, agent and X11 forwarding and the PTY; `command=`
  replaces whatever the client asks to run with rrsync, so the key cannot open
  a shell or run anything else.
- `-wo` allows uploads only — the workflow never reads from the host — and the
  directory argument confines every path. With rrsync the paths in the rsync
  command are relative to that directory, which is why `RSYNC_TARGET` is
  `deploy@example.org:/` rather than the absolute path (the workflow strips a
  trailing slash and adds its own). `--delete` stays allowed so stale files
  disappear; add `-no-del` only if you would rather keep them.
- The deploy user needs write access to that directory and nothing else; the
  web server only reads it (rules above).
- `RSYNC_HOST_KEY` is the host's `known_hosts` line — `example.org ssh-ed25519
  AAAA…` — taken from a machine that already trusts the host
  (`ssh-keyscan -t ed25519 example.org`) and compared with the host's own
  `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub` fingerprint. The workflow
  fails before connecting when the variable is missing; it never keyscans.

Verify from a machine holding the private key:

```bash
# 1. a sync works — write-only, into the directory
rsync -avz --dry-run -e "ssh -i rebuild-site" nuxt-js/.output/public/ deploy@example.org:/
# 2. a shell does not — rrsync rejects anything that is not an rsync server invocation
ssh -i rebuild-site deploy@example.org id
# 3. reading back does not either — -wo refuses the download direction
rsync -e "ssh -i rebuild-site" deploy@example.org:/shell-manifest.json /tmp/
```

The first prints the file list and exits 0; the other two exit non-zero with an
`rrsync error:` line and no `uid=` output.

## 5. CDN mode (CloudFront + S3)

`infra/terraform/` provisions a private bucket, a CloudFront distribution and
the GitHub OIDC role (see its README). Set `STATIC_DEPLOY_TARGET=s3` and the
variables from `terraform output github_variables`; point the domain's DNS at
the distribution; leave `CHAPTER_STATIC_DIR` undefined (the manifest is fetched
from the site URL through CloudFront). Behaviours: static paths → S3, default
→ WordPress honouring origin cache headers. The workflow invalidates the
manifest, payloads and `_nuxt/builds/*` after each upload (hashed chunks never
change).

The module's defaults are the safe ones: the deploy role trusts only
`repo:<owner>/<repo>:ref:refs/heads/main` and
`repo:<owner>/<repo>:environment:production` (override `github_oidc_subjects`
to add a staging environment), the bucket has SSE-S3 default encryption, and
`force_destroy` is `false` — `terraform destroy` keeps the bucket and its 30
days of rollback history unless you set it. Run `terraform validate` after any
change, and re-apply after upgrading from a module version that trusted
`repo:<owner>/<repo>:*`.

You can also use CloudFront in same-host mode simply as a cache in front of
the host; nothing in the theme changes.

## 6. Webhook transport (an AWS receiver, or anything else)

`CHAPTER_REBUILD_TRANSPORT=webhook` posts
`{ event: "rebuild", requestId, contentVersion, reason, siteUrl, requestedAt }`
to `CHAPTER_REBUILD_WEBHOOK_URL` with `X-Chapter-Timestamp` and
`X-Chapter-Signature: sha256=HMAC_SHA256(secret, timestamp + "." + body)` and
expects `202 { buildId, status }`. A Lambda/API Gateway receiver that starts
a CodeBuild project running `npm ci --ignore-scripts && npx nuxt prepare && npm run generate` and syncing to S3
fits this contract; reporting back is the same signed `POST /build-status`
(`.github/scripts/build-status.mjs` shows the exact request).

## 7. First build and cutover

1. Merge, activate the **Progress Now** theme, run
   `wp eval-file wp-content/themes/progressnow/bin/seed.php` on a fresh install
   (take a DB snapshot first on an existing site).
2. Set the constants (§2) with `CHAPTER_FRONTEND` still `islands`; configure
   the repository (§3).
3. Trigger a build: Site build → "Rebuild now" (or `wp chapter rebuild --wait`,
   or run the workflow by hand). Check `https://example.org/shell-manifest.json`
   and `https://example.org/_nuxt/builds/latest.json`.
4. Flip `CHAPTER_FRONTEND` to `nuxt`. Verify in a private window: the page
   renders from PHP, the app mounts (no requests to `/wp-json/progressnow/v1/*`
   for the landing route), client navigation loads `…/_payload.json`, both
   languages, the calendar and blog interactions. Logged-in users with the
   admin bar keep full PHP page loads.
5. Watch the Site build panel through a release cycle: content edits →
   `scheduled` → `requested` → `building` → `live`, with the live version
   catching up to the content version.

## 8. Rollback

- **App problem:** set `CHAPTER_FRONTEND` back to `islands` — the PHP islands
  build stays in the theme permanently (the PHP-only frontend).
- **Bad build:** S3 keeps 30 days of object versions (restore the previous
  `shell-manifest.json` and `_nuxt/builds/*`, or re-run the workflow from an
  older commit); with rsync re-run the workflow, or point `CHAPTER_STATIC_DIR`
  at a kept copy.
- **Stale static content:** nothing to do — the freshness guard keeps the
  session on REST until the next build lands; `wp chapter build-status` shows
  why a build did not run.

## 9. Local development

- Node: the root `.nvmrc` pins the major (22 — what CI and the Docker image
  run); each app's `.npmrc` sets `engine-strict`, so `npm ci` under another
  major stops with an engine error instead of drifting. `nvm use` / `fnm use`
  read the file.
- `nuxt-js/.env`: `NUXT_DEV_WP_ORIGIN=https://chapter.test:8890`,
  `NUXT_PUBLIC_WP_API_BASE=https://chapter.test:8890/wp-json/progressnow/v1`,
  `NODE_TLS_REJECT_UNAUTHORIZED=0` for the MAMP certificate.
- `npm run dev` in `nuxt-js/` for component work (proxied `/wp-json` + `/wp-content`).
- Full handoff locally: `npm run generate` in `nuxt-js/`, then in wp-config.php
  `define( 'CHAPTER_FRONTEND', 'nuxt' ); define( 'CHAPTER_STATIC_DIR', ABSPATH . 'nuxt-js/.output/public' );`
  — the PHP passthrough serves the generated files.
- No WordPress at all: `npm run generate:mock` (fixture-backed nitro mock) and
  `npm run preview`.

## 10. Headless Next.js (`next-js/`)

The Next.js app is a separate origin (say `https://www.example.org`) that
renders every public route server-side from `GET /wp-json/progressnow/v1/*`
(the same API, contracts and fixtures the Nuxt rendition uses). WordPress stays
on its own origin as CMS + API; nothing in the browser talks to WordPress.
Design: `openspec/changes/next-js-site-implementation/design.md`.

### 10.1 How it works

1. **Every request renders on the Next origin.** A request proxy (`proxy.ts`)
   mints a per-request CSP nonce, decides real 404s/500s from an in-memory copy
   of the `/routes` manifest, and mirrors Polylang's `/es/` → `/es/inicio/`
   redirect. The root layout renders the chrome for the request's language;
   route components render from envelopes read through `lib/data/*` —
   `'use cache'` functions tagged `content` + `routes` | `site` | `post:{lang}:{slug}` …
   with a long `cacheLife`. WordPress is contacted only on a cache miss.
2. **Content changes revalidate, they do not rebuild.** With
   `CHAPTER_REBUILD_TRANSPORT=webhook`, `inc/rebuild.php` POSTs the signed
   rebuild event (§6) to `POST /api/rebuild` on the Next origin. The receiver
   verifies the HMAC + ±300 s window, rejects replays, invalidates the
   `content`/`routes`/`site` tags, answers `202 { buildId, status: "started" }`
   and — when `WP_BUILD_STATUS_URL` is set — reports `succeeded` through the
   same signed `POST /build-status`, which marks the build live in the admin
   "Site build" panel. Editors see fresh pages within the dispatcher's
   debounce (`CHAPTER_REBUILD_DEBOUNCE`, default 90 s); "Rebuild now" is
   immediate.
3. **Canonical ownership is a constant.** `CHAPTER_CANONICAL_ORIGIN` makes
   `inc/seo.php` emit canonical, `hreflang`, `og:url` and the core sitemap on
   the Next origin — in every REST envelope and in the PHP theme's own head — so
   the two origins never compete. Next passes those values through verbatim.
4. **Media and fonts.** Images go through `next/image` (remote patterns from
   `IMAGE_HOSTS`, default the WordPress host; AVIF/WebP; SVG never optimized).
   The theme's `static/` (fonts, brand art) is proxied same-origin
   (`/wp-content/themes/progressnow/static/*` → `WP_ORIGIN`) with immutable
   caching so `@font-face` never crosses origins. The ICS feed stays on
   WordPress; the calendar links out to it.

### 10.2 Environment contract (`next-js/.env.example`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `WP_API_BASE` | yes | `https://cms.example.org/wp-json/progressnow/v1` (server-only) |
| `WP_ORIGIN` | derived | WordPress origin for media, the static proxy and link re-homing; from `WP_API_BASE` unless set |
| `NEXT_PUBLIC_SITE_ORIGIN` | yes | public origin of the Next app: sitemap, robots, absolute Open Graph URLs |
| `CHAPTER_REBUILD_SECRET` | yes | same value as wp-config.php; ≥ 16 characters |
| `WP_BUILD_STATUS_URL` | recommended | `https://cms.example.org/wp-json/progressnow/v1/build-status` — the receiver reports the build live |
| `IMAGE_HOSTS` | optional | comma-separated upstreams `next/image` may optimize from (default: `WP_ORIGIN`). A bare host is **https-only**; write `http://host[:port]` to allow plain http for that host |
| `CSP_REPORT_ONLY` | optional | `1` ships the Content-Security-Policy as report-only for the rollout window |
| `CSP_REPORT_URI` | optional | `report-uri` for the policy, either mode |
| `MOCK_API` | dev/CI only | `1` = fixture-backed mock API, relaxes the secret |

Startup validates the contract (`instrumentation.ts` → `lib/env.ts`) and fails
naming the variable. `NEXT_PUBLIC_*`, `WP_API_BASE`/`WP_ORIGIN` and
`IMAGE_HOSTS` are also read at **build** time (Next inlines public variables and
serializes `next.config.ts`), so give the same values to the build and the
runtime. The WordPress host must be reachable on a public hostname: the image
optimizer refuses private-IP upstreams.

### 10.3 wp-config.php constants

```php
define( 'CHAPTER_FRONTEND', 'islands' );                 // the PHP theme keeps rendering the WordPress origin
define( 'CHAPTER_REBUILD_TRANSPORT', 'webhook' );
define( 'CHAPTER_REBUILD_WEBHOOK_URL', 'https://www.example.org/api/rebuild' );
define( 'CHAPTER_REBUILD_SECRET', 'long-random-string' ); // = next-js CHAPTER_REBUILD_SECRET
define( 'CHAPTER_CANONICAL_ORIGIN', 'https://www.example.org' );
// define( 'CHAPTER_REBUILD_DEBOUNCE', 90 );
define( 'DISABLE_WP_CRON', true );                        // system cron hits wp-cron.php every minute (§2)
```

Leave `CHAPTER_STATIC_DIR` / `CHAPTER_STATIC_ORIGIN` / `CHAPTER_GITHUB_*`
unset. WordPress needs outbound HTTPS to the Next origin; the Next host needs
outbound HTTPS to WordPress.

### 10.4 Hosting paths (same build, no code changes)

**Vercel.** Import the repo with root directory `next-js`; set the variables of
§10.2 for Production (and Preview if you want previews against the same
WordPress). Vercel builds its own output (`output: 'standalone'` is skipped
when `VERCEL` is set), runs the proxy at the edge of each request and keeps the
data cache per deployment. `NEXT_PUBLIC_BUILD_ID` is derived from the commit.

**Docker.** `next-js/Dockerfile` is a multi-stage build on `node:22-alpine`:
non-root user, `PORT`/`HOSTNAME` honored (defaults 3000 / 0.0.0.0), a
`HEALTHCHECK` on `/api/health`. Build-time values are `--build-arg`s:

```bash
cd next-js
docker build -t progressnow-next \
  --build-arg WP_API_BASE=https://cms.example.org/wp-json/progressnow/v1 \
  --build-arg NEXT_PUBLIC_SITE_ORIGIN=https://www.example.org \
  --build-arg NEXT_PUBLIC_BUILD_ID=$(git rev-parse --short HEAD) .
docker run -d -p 3000:3000 --env-file .env.production progressnow-next
node scripts/smoke.mjs http://127.0.0.1:3000     # /api/health, /, /es/
```

`.env.production` carries the runtime set (§10.2, same `WP_API_BASE` and
`NEXT_PUBLIC_SITE_ORIGIN` as the build). CI builds this image and runs the
smoke against the fixture mock on every push (`.github/workflows/ci.yml`);
nothing is pushed to a registry.

**VPS + reverse proxy.** `npm ci --ignore-scripts && npm run build`, then run
`node .next/standalone/server.js` (copy `.next/static` next to it —
`scripts/start-standalone.mjs` does exactly that) under systemd with the
environment file, and put nginx/Caddy in front for TLS:

```nginx
server {
    listen 443 ssl http2;
    server_name www.example.org;
    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

The app sets its own security headers (HSTS, `nosniff`, `Referrer-Policy`,
`Permissions-Policy`) and the nonce CSP; do not add a second CSP at the proxy.
Compression and TLS belong to the reverse proxy.

### 10.5 Security headers and the CSP rollout

Every HTML response carries a `Content-Security-Policy` with a fresh nonce
(`script-src 'self' 'nonce-…' 'strict-dynamic'`, `img-src` limited to the app,
`data:`, the WordPress origin and `IMAGE_HOSTS`, `font-src 'self'`,
`frame-src` only the video players, `frame-ancestors 'none'`,
`object-src 'none'`, `base-uri 'self'`). Roll it out with `CSP_REPORT_ONLY=1`
first, watch `CSP_REPORT_URI` (or the browser console) for a release cycle,
then unset it. `/styleguide/` (noindex) alone allows `img-src https:` for the
vendored component demos.

**Edge trust boundaries** (openspec `next-edge-trust-boundaries`). The proxy
steers its own internal 404/500 renders with four request headers —
`x-pathname`, `x-nonce`, `x-not-found-render`, `x-error-render` — and
authenticates that loop with `x-internal-token` (derived from
`CHAPTER_REBUILD_SECRET`, so every instance of a deployment agrees; random per
process when the secret is unset in mock mode). A public request carrying any
of the four headers has them stripped before routing, status and CSP are
decided: a spoofed `x-nonce` never reaches the policy, `x-not-found-render`
cannot skip the 404 decision, `x-error-render` cannot fetch the error document
with a 200. Nothing to configure; do not forward or set these headers at the
reverse proxy. `INTERNAL_ORIGIN` (optional) is where the proxy fetches its own
404/500 renders — the standalone server uses `http://127.0.0.1:$PORT`, Vercel
the public origin; if you set it, keep it on loopback or the same deployment.

`next/image` optimizes only `https` upstreams for bare `IMAGE_HOSTS` entries;
a plain-`http` WordPress (a local install) must be listed with its scheme,
`IMAGE_HOSTS=http://cms.local:8888`. The optimizer answers 400 for anything
else. Every `dangerouslySetInnerHTML` in the app is enumerated in
`next-js/html-sinks.allowlist.json` with a `// html-sink: kses|encoder|static`
comment at the sink; `react/no-danger` is an error anywhere else and
`test/unit/html-sinks.spec.ts` fails when the set changes without the
allowlist.

**`/api/events` abuse posture.** The calendar's month fetch is the one public,
unauthenticated endpoint that reaches WordPress (`GET /api/events?lang=&from=&to=`,
same-origin only by CSP `connect-src`; the browser never sees the WordPress
origin). It is bounded by design, not by a per-IP limit in the app:

| Layer | Setting |
| --- | --- |
| Input | `lang` (`xx` / `xx-yy`) and ISO dates only; anything else is a 400 with `no-store` |
| Response cache | `Cache-Control: public, max-age=60, stale-while-revalidate=300` — a CDN or browser absorbs repeats |
| Data cache | the read goes through the `'use cache'` data layer (`cacheLife` `content`, tag-invalidated by `/api/rebuild`), so one upstream request per distinct (`lang`, `from`, `to`) window until the next content save, whatever the request rate — but each *new* window is an upstream request, hence the edge limit below |
| Upstream | one request, `AbortSignal.timeout(10 s)`, no retry |
| Failure | 503 `{ error, digest }` with `no-store`; the digest matches the structured log line — never a crash, never a stale-looking 200 |

If you want a hard ceiling in front of it (recommended on a VPS, optional on
Vercel where the WAF absorbs floods), rate-limit at the edge:

- **Vercel:** Project → Firewall → Add rule: *if* `Request Path` *starts with*
  `/api/events` → *then* `Rate Limit`, e.g. 60 requests / 60 s per IP, action
  `Deny` (429). Preview deployments inherit the rule.
- **nginx** (in the `server` block of §10.4):

  ```nginx
  limit_req_zone $binary_remote_addr zone=events:10m rate=1r/s;
  location /api/events {
      limit_req zone=events burst=20 nodelay;
      limit_req_status 429;
      proxy_pass http://127.0.0.1:3000;
      proxy_set_header Host $host;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
  ```

`/api/rebuild` needs no rate limit: it refuses anything that is not
`application/json` (415), stops reading at 16 KB (413) before it verifies the
HMAC, and answers 401 for a bad or replayed signature — all without touching
the cache.

**Demo backends.** `deploy/mock-api` (the snapshot that stands in for
WordPress on `progressnow-next.vercel.app`) is a demo backend, not production:
its `POST /build-status` requires the same HMAC as the real API
(`CHAPTER_REBUILD_SECRET` on that Vercel project; 401 otherwise) and it
re-homes URLs only to its own configured origin, never to a request's
`X-Forwarded-Host`. See `deploy/mock-api/README.md`.

### 10.6 Cache: single instance, and the multi-instance seam

v1 keeps the data cache in the process (or per Vercel deployment). Run **one**
instance behind the reverse proxy, or several only if they share a cache:
Next's `cacheHandler` (`next.config.ts`) accepts a Redis/KV implementation so
that the tag invalidation from `/api/rebuild` reaches every instance. The seam
is documented, not shipped; until it is configured, a second instance would
serve stale pages after a content save until its own entries expire
(`cacheLife` `content`: revalidate 1 day).

### 10.7 Smoke, cutover, rollback

1. Deploy with the variables set; `node scripts/smoke.mjs <origin>` must print
   `PASS` (health, `/`, `/es/`).
2. Set the constants (§10.3), then in the admin *Site build* panel press
   "Rebuild now": the panel goes `requested → live` within seconds and
   `GET <origin>/api/health` shows the `buildId` the panel reports.
3. Save a post; the public page changes within the debounce. Check
   `view-source:` on a WordPress URL: canonical points at the Next origin.
4. Point DNS / the reverse proxy at the app. The PHP theme keeps serving the
   WordPress origin (canonical to Next), so nothing breaks if DNS lags.

Rollback: unset `CHAPTER_CANONICAL_ORIGIN` and set
`CHAPTER_REBUILD_TRANSPORT` to `none` — the WordPress origin is canonical
again and fully rendered by the PHP theme; the Next app can stay up or go
away. A stale Next cache after a rebuild failure: press "Rebuild now" or
restart the instance (the cache is in-process).

### 10.8 Local development

`next-js/.env.local` from `.env.example` (`WP_API_BASE` on the MAMP site,
`NEXT_PUBLIC_SITE_ORIGIN=http://localhost:3000`, the secret from
wp-config.php; trust MAMP's CA from the shell — see `next-js/README.md`).
`npm run dev` for the app; for the full loop set the constants of §10.3 in the
local wp-config.php with `CHAPTER_REBUILD_WEBHOOK_URL=http://localhost:3000/api/rebuild`
and `CHAPTER_CANONICAL_ORIGIN=http://localhost:3000`. No WordPress at all:
`npm run dev:mock`, or `npm run build:mock && npm run start:standalone` for the
production build against the fixture mock.

