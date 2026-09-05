## Why

There is no committed, enforced production configuration or WordPress hardening baseline. `wp-config.php` (local) ships with `WP_DEBUG`/`WP_DEBUG_LOG` on, writes `debug.log` inside the web-reachable `wp-content/`, and defines none of the standard production guards (`DISALLOW_FILE_EDIT`, `DISALLOW_FILE_MODS`, `FORCE_SSL_ADMIN`, `WP_ENVIRONMENT_TYPE`, auto-update policy). Because `wp-config.php` is gitignored, there is no source-of-truth template ensuring production is configured safely. Separately, default WordPress exposes low-value, high-signal attack surface: `xmlrpc.php` (pingback/brute-force amplification), REST and `?author=N` user enumeration, and `generator`/RSD/WLW discovery meta. These are cheap to close and standard for a hardened install.

## What Changes

- Add a committed, documented **production config baseline** (a `wp-config` hardening include or template): `WP_DEBUG=false` in prod, `WP_DEBUG_DISPLAY=false`, debug log path moved outside the docroot, `WP_ENVIRONMENT_TYPE`, `DISALLOW_FILE_EDIT`, `DISALLOW_FILE_MODS` (as policy allows), `FORCE_SSL_ADMIN`, and an explicit auto-update policy for core/security.
- Document a **salt/keys generation + rotation runbook** (per-environment, never committed).
- Reduce attack surface via theme/mu-plugin hardening hooks: disable `xmlrpc.php`, block REST user-enumeration (`wp/v2/users` for anon) and `?author=N` redirects, remove `generator`/RSD/WLW/`wp-json` discovery noise as appropriate.
- Confirm Wordfence WAF is in extended/optimized mode and its config is captured as documented settings.

## Capabilities

### New Capabilities
- `runtime-hardening`: A documented, enforceable production runtime + WordPress attack-surface baseline.

### Modified Capabilities
<!-- None. -->

## Impact

- **Config:** committed hardening include/template consumed by each env's (uncommitted) `wp-config.php`; documented salt rotation.
- **Code:** a small theme include or mu-plugin for the hardening hooks (`xmlrpc`, user-enum, meta).
- **Ops:** environment-config runbook; Wordfence settings documented.
- **No content/API contract change.** User-enumeration blocking must preserve the theme's intended public author/contact data (see `author.php`).
