## Why

Every open `security-*` change is preventive. Nothing in the repository detects a compromise, alerts a human, or says what to do when one happens:

- Administrators and Editors — the roles that keep `unfiltered_html` — have no second factor; Wordfence Login Security is listed as optional and nothing enforces enrolment.
- Privileged theme actions (Rebuild now, transport configuration, Chapter Settings saves, role and plugin changes) leave no audit trail.
- Rebuild failures fire `progressnow/rebuild/failed` with no subscriber; the only signal is an admin notice on the next login. A degraded shell (`progressnow/shell/manifest_missing`) logs once a minute to `error_log` and nothing else.
- The PHP side logs ad hoc strings; the Next side has structured, redacted JSON (`lib/log.ts`). There is no CSP report sink for the report-only rollout the headers change plans, no health monitoring of `/api/health`, `/wp-json/progressnow/v1/site`, or `shell-manifest.json`, and no incident runbook naming what to rotate, who decides, and how to restore.

`security-runtime-hardening` captures Wordfence *settings*; `security-dependency-lifecycle` defines a *patch* SLA. Neither covers authentication policy for humans, audit logging, alerting, or response.

## What Changes

- **Privileged-account policy:** two-factor authentication mandatory for Administrator and Editor, enforced by a mu-plugin gate (blocks wp-admin for un-enrolled privileged users after a grace period; plugin-agnostic via a filter, with Wordfence Login Security and the WebAuthn/TOTP core plugin as documented providers); application passwords disabled unless a use exists; login rate limiting recommended at WAF level.
- **Audit log:** `inc/audit.php` records privileged events (rebuild requests and dispatch results, transport/setting source changes, Chapter Settings option writes, role changes, plugin/theme activation, user creation) as structured JSON lines with actor, IP, and object — dependency-free, `error_log`-backed, with an optional forward to a webhook.
- **Structured PHP logging:** `progressnow_log( $event, $fields )` (JSON, redaction by key name, mirrors `next-js/lib/log.ts`) replaces the ad hoc `error_log` calls in `inc/rebuild.php`, `inc/shell.php`, `inc/rest.php`.
- **Alerting:** subscribers for `progressnow/rebuild/failed`, `needs_attention`, and `progressnow/shell/manifest_missing` send a throttled email to the admin address and optionally a webhook (Slack-compatible); WP-CLI `wp chapter alerts test`.
- **CSP report sink:** `POST /api/csp-report` on the Next app (size-capped, sampled, structured log) usable by both the Next CSP and the PHP theme's future CSP; documented alternative: a hosted report service.
- **Health monitoring:** a scheduled `.github/workflows/uptime.yml` (every 15 min, optional, repository variable-gated) probing the three URLs and opening an issue on failure; documentation of external monitors.
- **Incident runbook:** `docs/incident-response.md` — triage, containment (disable transport, rotate per `docs/secrets-rotation.md`, revoke sessions), evidence (which logs, where), recovery (restore per `ops-backup-and-disaster-recovery`, redeploy), post-incident template.

## Capabilities

### New Capabilities
- `detection-and-response`: authentication policy for privileged humans, audit logging, structured PHP logging, alerting, CSP reporting, health monitoring, and the incident runbook.

### Modified Capabilities
- none.

## Impact

- **Theme PHP:** new `inc/audit.php`, `inc/log.php`, `inc/alerts.php`; edits in `inc/rebuild.php`, `inc/shell.php`, `inc/rest.php`, `inc/cli.php`; new `mu-plugins/progressnow-2fa-gate.php` shipped as a documented drop-in (mu-plugins are adopter-installed; the file lives under `wp-content/themes/progressnow/mu-plugins/` for copying).
- **Next.js:** `app/api/csp-report/route.ts` + unit test; `lib/security-headers.ts` `report-uri` default when `CSP_REPORT_URI` is unset and the route is enabled.
- **CI/Ops:** `.github/workflows/uptime.yml` (opt-in), `docs/incident-response.md`, `docs/deployment.md` monitoring section.
- **Tests:** PHPUnit for audit events, redaction, alert throttling, the 2FA gate's capability logic; vitest for the report endpoint.
- **Behavior:** no visitor-facing change; admins without 2FA see a gated screen after the grace period.
- **Coordinates with:** `security-authoring-least-privilege` (role model), `security-headers-and-cicd-gates` (needs a report sink), `security-runtime-hardening` (Wordfence), `ops-backup-and-disaster-recovery` (recovery step). Does not modify those changes.
