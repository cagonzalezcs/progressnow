## 1. Structured logging

- [ ] 1.1 Add `inc/log.php`: `progressnow_log( $level, $event, array $fields )` → one JSON line via `error_log`, key-name redaction at any depth
- [ ] 1.2 Add `tests/fixtures/log-redaction.json` asserted by PHPUnit and by `next-js/test/unit/log.spec.ts`
- [ ] 1.3 Replace ad hoc `error_log` calls in `inc/rebuild.php`, `inc/shell.php`, `inc/rest.php` with `progressnow_log`

## 2. Audit log

- [ ] 2.1 Add `inc/audit.php`: events for rebuild request/dispatch/result, transport setting source changes, Chapter Settings option writes (`acf/save_post` on the options page), `set_user_role`, `activated_plugin`/`deactivated_plugin`, `switch_theme`, `user_register`; fields: actor id, IP (respecting a trusted-proxy constant), object, outcome
- [ ] 2.2 Optional `CHAPTER_AUDIT_WEBHOOK` forward (async via cron, queued, retried once)
- [ ] 2.3 PHPUnit: each event produces one line with the expected keys; no secrets or content bodies

## 3. Alerts

- [ ] 3.1 Add `inc/alerts.php`: subscribers for `progressnow/rebuild/failed`, `needs_attention` transitions, `progressnow/shell/manifest_missing`; throttle 1/hour per key; email to `admin_email`; optional `CHAPTER_ALERT_WEBHOOK`
- [ ] 3.2 `wp chapter alerts test` sends one of each channel
- [ ] 3.3 PHPUnit: throttle, payload shape, no alert on success paths

## 4. CSP report sink

- [ ] 4.1 `next-js/app/api/csp-report/route.ts`: 8 KB cap, sampling, structured log of `document-uri`/`violated-directive`/`blocked-uri`; unit test
- [ ] 4.2 `lib/security-headers.ts`: default `report-uri /api/csp-report` when enabled by env; document in `docs/deployment.md` §10.5 and for the theme's CSP rollout

## 5. Privileged-account policy

- [ ] 5.1 Ship `wp-content/themes/progressnow/mu-plugins/progressnow-2fa-gate.php` (copy-in): privileged roles, `progressnow/2fa/enrolled` filter, adapters for Wordfence Login Security and the core Two-Factor plugin, grace period, `CHAPTER_2FA_ENFORCE`, never applies to WP-CLI
- [ ] 5.2 Disable application passwords by default (`wp_is_application_passwords_available` filter) with a constant to re-enable
- [ ] 5.3 PHPUnit for the gate's decision logic (roles, grace, enrolled, disabled)
- [ ] 5.4 Document the policy in the role model (pointer from `security-authoring-least-privilege`'s doc when it lands) and in `docs/deployment.md`

## 6. Monitoring and runbook

- [ ] 6.1 `.github/workflows/uptime.yml` (schedule, opt-in via `vars.UPTIME_URLS`): probe `/api/health`, `/wp-json/progressnow/v1/site`, `/shell-manifest.json`; open/close a GitHub issue on state change
- [ ] 6.2 Write `docs/incident-response.md`: roles, triage, containment (transport `none`, secret rotation, session revocation, WAF block), evidence (log locations), recovery (backup restore, redeploy), communication, post-incident template
- [ ] 6.3 Tabletop walkthrough of one scenario (leaked webhook secret) and one (admin account takeover); record gaps as follow-up tasks
