## 1. Runtime hardening hooks (mu-plugin)

- [x] 1.1 Add mu-plugin: `add_filter('xmlrpc_enabled','__return_false')` — shipped as theme `inc/security-hardening.php` (`wp-content/mu-plugins/` is gitignored by repo policy); also empties `xmlrpc_methods` since the flag only gates authenticated calls (`pingback.ping` needs none), strips `X-Pingback`, closes pings
- [x] 1.2 Remove `wp/v2/users` from REST for unauthenticated requests (`rest_endpoints` filter) — all `/wp/v2/users*` routes; logged-in keeps them (block editor)
- [x] 1.3 Guard `?author=N` enumeration redirect; verify `author.php` archive still renders — 404 at `template_redirect` 0 (no canonical redirect); users sitemap provider also dropped; `/author/{slug}/` verified 200 live + in tests
- [x] 1.4 Remove `wp_generator`, RSD, WLW-manifest, shortlink discovery output — plus `Link` headers (shortlink, REST discovery), feed generators, core `?ver=`

## 2. Production config baseline

- [x] 2.1 Add committed wp-config hardening template/include (no secrets) — `config/wp-config-hardening.php`, required from each env's wp-config; `tests/test-config-hardening.php`
- [x] 2.2 Drive debug policy by `WP_ENVIRONMENT_TYPE`; force `WP_DEBUG=false`/`WP_DEBUG_DISPLAY=false` in prod
- [x] 2.3 Move any debug log to a path outside the docroot — `PROGRESSNOW_DEBUG_LOG_DIR`, default `<parent of docroot>/logs`; docroot paths fail startup in staging/production
- [x] 2.4 Set `DISALLOW_FILE_EDIT`, `FORCE_SSL_ADMIN`, auto-update policy; evaluate `DISALLOW_FILE_MODS` (sequence with dependency-lifecycle) — `WP_AUTO_UPDATE_CORE='minor'`; `DISALLOW_FILE_MODS` opt-in via `PROGRESSNOW_DISALLOW_FILE_MODS` (it also kills auto-updates)
- [x] 2.5 Add a startup assertion that fails if `WP_DEBUG` is true under `production` — HTTP 500 generic body / CLI exit 1; theme adds a soft admin notice for the unset-env-type case

## 3. Secrets

- [x] 3.1 Write salt/key generation + rotation runbook (per-env, uncommitted) — `docs/runtime-hardening.md` §3
- [ ] 3.2 Rotate salts once to validate the runbook — runbook validated 2026-09-09 on a copy of `wp-config-sample.php` (`wp config shuffle-salts`); the real rotation needs production host access (owner)

## 4. Wordfence posture

- [ ] 4.1 Confirm WAF extended/optimized protection mode is enabled — cannot be confirmed from the repo: Wordfence is inactive locally (no `wp_wfconfig` rows) and production is not yet reachable (owner)
- [x] 4.2 Document intended Wordfence settings so they survive reinstall — `docs/runtime-hardening.md` §4

## 5. Verification

- [ ] 5.1 Confirm xmlrpc, `wp/v2/users` (anon), `?author=1`, and generator meta are all closed — verified 2026-09-09 locally (theme served from the worktree docroot, `local` + `production` env types): all closed, see `docs/runtime-hardening.md` §5; re-run the checklist on production (owner)
- [ ] 5.2 Confirm author archive page, login, and admin over SSL all still work — verified locally: author archive 200, `wp-login.php` 200 (`local`) / 302→https (`production`), `wp-admin` redirect; production run pending host access (owner)
