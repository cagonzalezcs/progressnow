## 1. Runtime hardening hooks (mu-plugin)

- [ ] 1.1 Add mu-plugin: `add_filter('xmlrpc_enabled','__return_false')`
- [ ] 1.2 Remove `wp/v2/users` from REST for unauthenticated requests (`rest_endpoints` filter)
- [ ] 1.3 Guard `?author=N` enumeration redirect; verify `author.php` archive still renders
- [ ] 1.4 Remove `wp_generator`, RSD, WLW-manifest, shortlink discovery output

## 2. Production config baseline

- [ ] 2.1 Add committed wp-config hardening template/include (no secrets)
- [ ] 2.2 Drive debug policy by `WP_ENVIRONMENT_TYPE`; force `WP_DEBUG=false`/`WP_DEBUG_DISPLAY=false` in prod
- [ ] 2.3 Move any debug log to a path outside the docroot
- [ ] 2.4 Set `DISALLOW_FILE_EDIT`, `FORCE_SSL_ADMIN`, auto-update policy; evaluate `DISALLOW_FILE_MODS` (sequence with dependency-lifecycle)
- [ ] 2.5 Add a startup assertion that fails if `WP_DEBUG` is true under `production`

## 3. Secrets

- [ ] 3.1 Write salt/key generation + rotation runbook (per-env, uncommitted)
- [ ] 3.2 Rotate salts once to validate the runbook

## 4. Wordfence posture

- [ ] 4.1 Confirm WAF extended/optimized protection mode is enabled
- [ ] 4.2 Document intended Wordfence settings so they survive reinstall

## 5. Verification

- [ ] 5.1 Confirm xmlrpc, `wp/v2/users` (anon), `?author=1`, and generator meta are all closed
- [ ] 5.2 Confirm author archive page, login, and admin over SSL all still work
