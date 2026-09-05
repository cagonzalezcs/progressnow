# Deployment guide — PHP shell + Nuxt static rendition

How the pieces fit, what to configure, and how to run it locally, on a plain
host, or behind CloudFront. Everything the operator has to do is listed;
nothing in this setup runs `node` on the WordPress host.

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

// WP-Cron drives the debounced dispatch. On real hosts disable the page-load
// cron and hit wp-cron.php from the system cron every minute:
define( 'DISABLE_WP_CRON', true );
//   * * * * * curl -s https://example.org/wp-cron.php?doing_wp_cron > /dev/null
```

`CHAPTER_FRONTEND` can stay `islands` while everything else is set up; the
rebuild pipeline and the static files are inert until the flag flips.

## 3. GitHub repository configuration (transport `github`)

Settings → Secrets and variables → Actions:

| Kind | Name | Value |
| --- | --- | --- |
| variable | `WP_API_BASE` | `https://example.org/wp-json/progressnow/v1` (required) |
| variable | `STATIC_DEPLOY_TARGET` | `rsync` (same-host), `s3` (bucket/CDN) or `artifact` (dry run) |
| variable | `WP_BUILD_STATUS_URL` | `https://example.org/wp-json/progressnow/v1/build-status` (optional but recommended) |
| secret | `CHAPTER_REBUILD_SECRET` | same value as wp-config.php |
| rsync | `RSYNC_TARGET` (var) `RSYNC_SSH_KEY` (secret) `RSYNC_HOST_KEY` (var, optional) | `deploy@example.org:/var/www/html/static-site`, the private key, a `known_hosts` line |
| s3 | `AWS_REGION` `AWS_ROLE_ARN` `S3_BUCKET` `CLOUDFRONT_DISTRIBUTION_ID` (vars) | from `terraform output github_variables` |

The workflow is `.github/workflows/rebuild-site.yml`: `repository_dispatch`
(`rebuild-site`), `workflow_dispatch`, and pushes to `main` touching `nuxt-js/`.
`concurrency: rebuild-site` queues at most one extra run — bursts of edits
collapse into one build. Each run: `npm ci` → `nuxt generate` against
`WP_API_BASE` with `CHAPTER_CONTENT_VERSION` from the dispatch → verify →
deploy (manifest uploaded **last**) → signed `POST /build-status`.

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

## 5. CDN mode (CloudFront + S3)

`infra/terraform/` provisions a private bucket, a CloudFront distribution and
the GitHub OIDC role (see its README). Set `STATIC_DEPLOY_TARGET=s3` and the
variables from `terraform output github_variables`; point the domain's DNS at
the distribution; leave `CHAPTER_STATIC_DIR` undefined (the manifest is fetched
from the site URL through CloudFront). Behaviours: static paths → S3, default
→ WordPress honouring origin cache headers. The workflow invalidates the
manifest, payloads and `_nuxt/builds/*` after each upload (hashed chunks never
change).

You can also use CloudFront in same-host mode simply as a cache in front of
the host; nothing in the theme changes.

## 6. Webhook transport (an AWS receiver, or anything else)

`CHAPTER_REBUILD_TRANSPORT=webhook` posts
`{ event: "rebuild", requestId, contentVersion, reason, siteUrl, requestedAt }`
to `CHAPTER_REBUILD_WEBHOOK_URL` with `X-Chapter-Timestamp` and
`X-Chapter-Signature: sha256=HMAC_SHA256(secret, timestamp + "." + body)` and
expects `202 { buildId, status }`. A Lambda/API Gateway receiver that starts
a CodeBuild project running `npm ci && npm run generate` and syncing to S3
fits this contract; reporting back is the same signed `POST /build-status`
(`.github/scripts/build-status.mjs` shows the exact request).

## 7. First build and cutover

1. Merge, activate the **Progress Now** theme, run
   `wp eval-file wp-content/themes/progressnow/bin/seed.php` (fresh install)
   or `sh wp-content/themes/progressnow/bin/scrub-brand.sh --yes` (existing
   content; take a DB snapshot first).
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
  build is still in the theme until the cleanup phase removes it.
- **Bad build:** S3 keeps 30 days of object versions (restore the previous
  `shell-manifest.json` and `_nuxt/builds/*`, or re-run the workflow from an
  older commit); with rsync re-run the workflow, or point `CHAPTER_STATIC_DIR`
  at a kept copy.
- **Stale static content:** nothing to do — the freshness guard keeps the
  session on REST until the next build lands; `wp chapter build-status` shows
  why a build did not run.

## 9. Local development

- `nuxt-js/.env`: `NUXT_DEV_WP_ORIGIN=https://rgvdsa.test:8890`,
  `NUXT_PUBLIC_WP_API_BASE=https://rgvdsa.test:8890/wp-json/progressnow/v1`,
  `NODE_TLS_REJECT_UNAUTHORIZED=0` for the MAMP certificate.
- `npm run dev` in `nuxt-js/` for component work (proxied `/wp-json` + `/wp-content`).
- Full handoff locally: `npm run generate` in `nuxt-js/`, then in wp-config.php
  `define( 'CHAPTER_FRONTEND', 'nuxt' ); define( 'CHAPTER_STATIC_DIR', ABSPATH . 'nuxt-js/.output/public' );`
  — the PHP passthrough serves the generated files.
- No WordPress at all: `npm run generate:mock` (fixture-backed nitro mock) and
  `npm run preview`.
