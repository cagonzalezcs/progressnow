## Context

`wp-config.php` is correctly gitignored (no committed secrets), but that means there is no version-controlled guarantee that production disables debug, forces SSL admin, or blocks file editing. Locally `WP_DEBUG`/`WP_DEBUG_LOG` are on and `debug.log` lands in `wp-content/` (info disclosure if reachable). WordPress ships `xmlrpc.php`, REST `wp/v2/users`, and `?author=N` enumeration plus discovery meta by default. Wordfence is installed (runtime WAF/scanner) but its configuration is not captured anywhere. `author.php` intentionally renders author archives, so user-enum hardening must not break legitimate public author/contact display.

## Goals / Non-Goals

**Goals:**
- A committed, reviewable production hardening baseline that each environment's `wp-config.php` includes.
- Standard low-risk attack surface (xmlrpc, user enum, discovery meta) closed via code that ships in the repo.
- Documented secret (salt/key) generation + rotation, and captured Wordfence settings.

**Non-Goals:**
- Storing real secrets in git (they stay per-env, uncommitted).
- Replacing Wordfence; this change documents and confirms its posture.

## Decisions

- **Committed hardening include, not a full committed `wp-config.php`.** Ship `inc/security-hardening.php` (mu-plugin preferred) for runtime hooks, plus a documented `wp-config` snippet/template checked into the repo (e.g. `docs/wp-config.hardening.md` or a `config/` include) that each env's `wp-config.php` requires. Rationale: keeps secrets out of git while making the *policy* reviewable. Alternative (Bedrock `.env`) is cleaner but a larger migration — coordinate with dependency-lifecycle.
- **Debug policy by environment:** `WP_ENVIRONMENT_TYPE` drives it — `production` forces `WP_DEBUG=false`, `WP_DEBUG_DISPLAY=false`; if logging is on anywhere, `WP_DEBUG_LOG` points to a path **outside** the docroot.
- **Disable xmlrpc** via `add_filter('xmlrpc_enabled','__return_false')` and, ideally, block the file at the server/WAF too. Rationale: no feature on this site uses it.
- **Block anon user enumeration:** filter `rest_endpoints` to remove `wp/v2/users` for unauthenticated requests, and short-circuit `?author=N` author-query redirects, while keeping the theme's own author archive rendering intact (it uses `Timber::get_user`, not the enumeration vector). Verify against `author.php`.
- **Strip discovery meta:** remove `wp_generator`, RSD, WLW manifest, and shortlink header noise.
- **Wordfence:** confirm extended protection / firewall optimized mode; capture the intended settings as documentation so they survive reinstalls.

## Risks / Trade-offs

- [Blocking `?author=` breaks the public author page] → The theme renders authors via its own template/query; test `author.php` still works after adding the redirect guard (guard only the enumeration redirect, not the archive).
- [`DISALLOW_FILE_MODS` blocks in-dashboard plugin updates] → Intended once dependency-lifecycle owns updates; sequence after that change, or set only `DISALLOW_FILE_EDIT` first.
- [Config drift between envs] → The committed template + a startup assertion (e.g. bail if `WP_DEBUG` true under `production`) reduces drift.

## Migration Plan

1. Add the runtime hardening mu-plugin (xmlrpc, user-enum, meta); verify author page + site function on staging.
2. Add the committed wp-config hardening template + env-type-driven debug policy; move debug.log off-docroot.
3. Document salt generation/rotation; rotate once to validate the runbook.
4. Capture + confirm Wordfence settings.

## Open Questions

- Is `DISALLOW_FILE_MODS` acceptable operationally, or only `DISALLOW_FILE_EDIT`? (Depends on dependency-lifecycle sequencing.)
- Any legitimate consumer of `xmlrpc.php` (e.g. a mobile app / Jetpack)? (Assumed no.)
