# Runtime hardening

The production runtime + WordPress attack-surface baseline (openspec change
`security-runtime-hardening`). Two committed pieces, one runbook, one plugin
posture:

| Piece | Where | Applies |
|---|---|---|
| Attack-surface hooks | `wp-content/themes/progressnow/inc/security-hardening.php` | automatically, with the theme |
| wp-config baseline | `config/wp-config-hardening.php` | when each env's `wp-config.php` requires it (§2) |
| Salt/key rotation | §3 | per environment, never committed |
| Wordfence settings | §4 | documented so a reinstall reproduces them |

Tests: `composer test` in the theme runs `tests/test-security-hardening.php`
(hooks, under WorDBless) and `tests/test-config-hardening.php` (the include,
in PHP subprocesses per environment scenario).

## 1. What the theme closes

`wp-content/mu-plugins/` is gitignored by policy (plugins are never vendored),
so the hooks ship in the theme like every other `inc/` domain.

- **XML-RPC.** `xmlrpc_enabled` is false *and* the method table is emptied,
  because the enabled flag only gates authenticated calls — `pingback.ping`
  needs no login and would still answer. `X-Pingback` is stripped, pings are
  closed. `POST /xmlrpc.php` with `pingback.ping` now returns fault `-32601`
  (method does not exist); `system.listMethods` lists only IXR's `system.*`.
  Also block `/xmlrpc.php` at the web server or WAF (§1.1) so the request
  never boots WordPress.
- **User enumeration.** `wp/v2/users*` REST routes are removed for anonymous
  requests (`rest_no_route` 404); logged-in users keep them — the block editor
  needs them. `?author=N` answers 404 at `template_redirect` priority 0,
  before `redirect_canonical` can redirect to the author slug. The users
  sitemap provider is dropped (author archives are already `noindex` in
  `inc/seo.php`). The theme's public author archive (`/author/{slug}/`,
  `author.php`) is untouched.
- **Discovery/version noise.** No generator meta (head or feeds), RSD, WLW
  manifest, shortlink (head + `Link` header), REST link discovery (head +
  `Link` header); `?ver=<core version>` is stripped from core assets (theme
  assets keep their own hashes).
- **Drift signal.** An admin notice when `WP_DEBUG`/`WP_DEBUG_DISPLAY` is on
  under environment type `production`. WordPress defaults the environment
  type to `production` when unset — a local site without
  `WP_ENVIRONMENT_TYPE` sees this notice; set it (§2) rather than ignoring it.

### 1.1 Web-server layer

Apache (`.htaccess` or vhost):

```apache
<Files "xmlrpc.php">
    Require all denied
</Files>
# Committed config lives in the docroot; the include 404s on a direct hit, deny anyway.
<Directory "/path/to/docroot/config">
    Require all denied
</Directory>
```

nginx:

```nginx
location = /xmlrpc.php { return 403; }
location ^~ /config/   { return 403; }
```

Wordfence's firewall can also block `xmlrpc.php` (Firewall → Brute Force →
"Disable XML-RPC authentication" covers the login path only; the file
block above is the complete measure).

## 2. wp-config baseline

`wp-config.php` stays gitignored (it holds secrets). The policy it must apply
is `config/wp-config-hardening.php`, required from the "custom values"
section, after the environment type, before `wp-settings.php`:

```php
/* Add any custom values between this line and the "stop editing" line. */

define( 'WP_ENVIRONMENT_TYPE', 'production' );   // local | development | staging | production
// define( 'PROGRESSNOW_DEBUG_LOG_DIR', '/var/log/progressnow' ); // off-docroot; optional in production
// define( 'PROGRESSNOW_TRUST_PROXY_PROTO', true );               // only behind a TLS-terminating proxy
// define( 'PROGRESSNOW_DISALLOW_FILE_MODS', true );              // once updates are owned by CI (dependency-lifecycle)
require_once __DIR__ . '/config/wp-config-hardening.php';
```

What it enforces:

| Constant | production | staging | development / local |
|---|---|---|---|
| `WP_DEBUG` | forced `false` (a prior `true` **fails startup**) | env decides | env decides |
| `WP_DEBUG_DISPLAY` | `false` (prior `true` fails startup); `display_errors=0` | same | env decides |
| `WP_DEBUG_LOG` | `false`, or `<PROGRESSNOW_DEBUG_LOG_DIR>/wp-debug.log` when set; a docroot path (or bare `true`) **fails startup** | log allowed, off-docroot only | defaults to `<parent of docroot>/logs/wp-debug.log` when `WP_DEBUG` is on; a docroot path is tolerated with an `error_log` warning |
| `DISALLOW_FILE_EDIT` | `true` | `true` | `true` |
| `DISALLOW_FILE_MODS` | only with `PROGRESSNOW_DISALLOW_FILE_MODS` | same | same |
| `FORCE_SSL_ADMIN` | `true` | `true` | unset |
| `WP_AUTO_UPDATE_CORE` | `'minor'` (security + minor releases) | same | same |
| `AUTOMATIC_UPDATER_DISABLED` | `false` | same | same |

Rules of the include:

- **Env-defined constants win.** Anything `wp-config.php` defines before the
  include is kept (`define` cannot be repeated), except the production
  contradictions above, which stop the boot: HTTP 500 with the body
  `Configuration error.` (reason only in the PHP error log), exit code 1 on
  the CLI. That is the startup assertion — a wrong `wp-config.php` fails loud
  instead of serving debug output.
- **`WP_ENVIRONMENT_TYPE`** may also come from the process environment (the
  same variable WordPress reads). Anything but the four values fails.
- **Debug log path** is validated lexically against the docroot (the directory
  above `config/`), so a log can never be a web-reachable `wp-content/debug.log`
  in staging or production. Create the directory and make it writable by the
  PHP user; the include only `mkdir`s it in development/local.
- **`PROGRESSNOW_DISALLOW_FILE_MODS`** stays opt-in: `DISALLOW_FILE_MODS` also
  disables *automatic* updates, so turn it on only when
  `security-dependency-lifecycle` owns updates.
- **Proxies.** Behind a TLS-terminating proxy `FORCE_SSL_ADMIN` would loop;
  set `PROGRESSNOW_TRUST_PROXY_PROTO` so `X-Forwarded-Proto: https` marks the
  request secure. Never set it when PHP is reachable without the proxy.
- The include 404s when requested directly (it checks for `DB_NAME`, which
  `wp-config.php` defines first).

Local checkout of this repo: add `define( 'WP_ENVIRONMENT_TYPE', 'local' );`
above your existing `WP_DEBUG` block, then the `require_once`. Your
`WP_DEBUG_LOG = true` keeps working (warning only) — move it via
`PROGRESSNOW_DEBUG_LOG_DIR` when convenient.

## 3. Salts and keys

The eight `AUTH_KEY … NONCE_SALT` constants sign cookies and nonces. They are
generated **per environment**, live only in that environment's
`wp-config.php`, and never enter source control (`wp-config.php` is
gitignored; `config/wp-config-hardening.php` defines none of them —
`tests/test-config-hardening.php` asserts that).

### 3.1 Generate (new environment)

```bash
wp config shuffle-salts            # in the docroot; writes 64-char values for all eight
```

Without WP-CLI: paste the output of <https://api.wordpress.org/secret-key/1.1/salt/>
into `wp-config.php`, or generate locally:

```bash
for k in AUTH_KEY SECURE_AUTH_KEY LOGGED_IN_KEY NONCE_KEY AUTH_SALT SECURE_AUTH_SALT LOGGED_IN_SALT NONCE_SALT; do
  printf "define( '%s', '%s' );\n" "$k" "$(LC_ALL=C tr -dc 'A-Za-z0-9!@#$%^&*()_+=-' </dev/urandom | head -c 64)"
done
```

### 3.2 Rotate

Rotate on a schedule (at least yearly), after any suspected `wp-config.php`
exposure, when an administrator leaves, or after a compromise clean-up.

1. Announce: rotation logs every user out (cookies) and invalidates in-flight
   nonces (open editor sessions must reload; scheduled/async form posts fail
   once).
2. Back up: `cp wp-config.php wp-config.php.bak-$(date +%F)` outside the
   docroot, or rely on the host's file snapshot.
3. Rotate: `wp config shuffle-salts` (idempotent; re-run any time). Verify
   `wp config list --fields=name,type | grep -E 'KEY|SALT'` shows eight
   constants and `php -l wp-config.php` passes.
4. Confirm: existing sessions are gone (a logged-in tab lands on
   `wp-login.php`), logging in works, and `wp-admin` loads over HTTPS.
5. Remove the backup once confirmed; it contains the old secrets.

Not covered by `shuffle-salts`: `WP_CACHE_KEY_SALT` (object-cache namespace,
rotate it separately to flush a shared cache) and `CHAPTER_REBUILD_SECRET`
(rotate together with the Next/Nuxt receiver — see `docs/deployment.md`).

Runbook validation (2026-09-09): steps 3 ran against a copy of
`wp-config-sample.php` (eight placeholders → eight 64-char values, a second
run rotates again, file still lints). Production rotation is an owner action
once the host is reachable.

## 4. Wordfence posture

Wordfence (`wordfence`, `wordfence-login-security`) is adopter-installed, not
vendored, and its configuration lives in the database (`wp_wfconfig`), so it
is not reproducible from the repo. Intended settings, to reapply after a
reinstall or on a new environment:

**Firewall**

- Protection level **Extended Protection** (Firewall → Manage → Optimize the
  Wordfence Firewall). This loads the WAF via `auto_prepend_file`
  (`wordfence-waf.php` in the docroot + `.user.ini` / php.ini). Confirm it
  reads "Extended Protection" — "Basic WordPress Protection" means the WAF
  runs only after WordPress boots.
- Status **Enabled and Protecting** (not Learning Mode) after the first week.
- Brute force: enable; max login failures 5, max forgot-password 5, count over
  10 minutes, lock out 30 minutes; **lock out invalid usernames**; **prevent
  the use of passwords leaked in data breaches** (administrators); enforce
  strong passwords for admins/publishers; **don't reveal valid users in login
  errors**; **prevent discovery of usernames through `/?author=N` scans**
  (belt and braces with the theme); disable application passwords unless
  something uses them.
- Rate limiting: enable; block fake Googlebots; crawlers/humans 404 rate
  ~30/min, page rate ~240/min; throttle rather than block for crawlers.
- Immediately block IPs that access `xmlrpc.php` is not needed once the file
  is denied at the server (§1.1); if it isn't, enable Firewall → Brute Force
  → "Disable XML-RPC authentication".

**Scan**

- Scan type **Standard** (or High Sensitivity after an incident); scheduled
  scans on, once a day.
- Options on: core/theme/plugin file changes, malware signatures, check file
  contents for malicious URLs, check for readable `wp-config.php`,
  check for unauthorized DNS changes, scan for weak passwords, scan for
  publicly accessible config/backup/log files (this is what catches a
  `debug.log` in the docroot), check for out-of-date/abandoned plugins.
- "Scan files outside your WordPress installation" **on** — the Nuxt static
  rendition and `config/` sit inside the docroot.

**General**

- Hide WordPress version: on (the theme already removes generator output; the
  option also strips `readme.html` hints).
- Disable code execution for the uploads directory: on.
- Live traffic: security-only mode (full logging is a resource cost).
- Alerts: email the ops address on admin sign-in, lockouts, blocked attacks
  over threshold, and when Wordfence itself needs an update; weekly summary
  on.
- Updates: Wordfence auto-update on (the plugin updates independently of
  `WP_AUTO_UPDATE_CORE`; with `DISALLOW_FILE_MODS` it cannot — another reason
  that constant stays opt-in).

**Login Security** (`wordfence-login-security`): two-factor **required** for
administrators and editors, grace period 10 days for new accounts;
reCAPTCHA v3 on `wp-login.php` optional; XML-RPC 2FA irrelevant once the
file is denied.

Export/import: Tools → Import/Export Options gives a token that carries every
setting between sites — take an export after the settings above are applied
and keep it with the environment's secrets (it is not repo material).

Status: neither Wordfence plugin is active on the local checkout (no
`wp_wfconfig` rows), and the production host is not yet reachable from this
repo, so §4 is the intended state, not a captured one. Confirming Extended
Protection on production is an owner action.

## 5. Verification checklist

Run against each environment after deploy (replace the origin; `-k` only for
the local self-signed certificate). Expected results in comments.

```bash
B=https://example.org
curl -s -X POST -H 'Content-Type: text/xml' --data '<methodCall><methodName>pingback.ping</methodName><params><param><value>http://a/</value></param><param><value>'$B'/</value></param></params></methodCall>' $B/xmlrpc.php   # 403 at the server, else faultCode -32601
curl -s -o /dev/null -w '%{http_code}\n' $B/wp-json/wp/v2/users            # 404
curl -s -o /dev/null -w '%{http_code}\n' "$B/?rest_route=/wp/v2/users"     # 404
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' "$B/?author=1"    # 404, no redirect
curl -s -o /dev/null -w '%{http_code}\n' $B/author/<slug>/                 # 200 (author archive)
curl -s $B/ | grep -ciE 'name="generator"|EditURI|wlwmanifest|rel="shortlink"|api\.w\.org'   # 0
curl -s -I $B/ | grep -ci 'x-pingback\|rel=shortlink\|api\.w\.org'         # 0
curl -s $B/feed/ | grep -c '<generator>'                                   # 0
curl -s $B/wp-sitemap.xml | grep -c users                                  # 0
curl -s -o /dev/null -w '%{http_code}\n' $B/config/wp-config-hardening.php # 403 or 404
curl -s -o /dev/null -w '%{http_code}\n' $B/wp-content/debug.log           # 404
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' http://example.org/wp-login.php   # 302 → https (FORCE_SSL_ADMIN)
```

Then in a browser: log in, open the block editor (it lists users — the
logged-in REST route must still work), and load `/author/<slug>/`.

Run on 2026-09-09 against this repo's theme served from a worktree docroot
(PHP built-in server, environment types `local` and `production`): every line
above matched, including the production `wp-login.php` HTTPS redirect and the
author archive rendering. Production itself is pending host access.
