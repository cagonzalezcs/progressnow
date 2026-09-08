## Context

Observability today: Next emits JSON lines with key-name redaction; PHP calls `error_log` in two places and stores `lastError` in an option; the admin panel and `wp chapter build-status` are pull-only. Authentication is WordPress default (password), optionally Wordfence. Hooks that already exist and are unsubscribed: `progressnow/rebuild/failed`, `progressnow/rebuild/live`, `progressnow/shell/manifest_missing`, `progressnow/shell/new_build`, `progressnow/content_version_bumped`.

## Goals / Non-Goals

**Goals:**
- A privileged account cannot be used with a password alone.
- Every privileged action and every pipeline failure is recorded and, for failures, pushed to a human.
- One structured log format across PHP and Node, with the same redaction rules.
- A written, rehearsed response procedure.

**Non-Goals:**
- A SIEM, log shipping, or paid monitoring (documented as options).
- Replacing Wordfence's own login protection where installed.
- Visitor analytics of any kind (the no-analytics policy stands).

## Decisions

- **2FA gate as a mu-plugin drop-in, provider-agnostic.** The gate asks `apply_filters( 'progressnow/2fa/enrolled', null, $user )`; providers (Wordfence Login Security, the core Two-Factor plugin) are wired by tiny adapters in the same file. Unanswered filter + privileged role + grace expired → `wp_die` with enrolment instructions. Rationale: the theme cannot ship a plugin, but it can ship the policy and a file the adopter copies to `mu-plugins/`.
- **Audit log is append-only JSON to `error_log`** (rotates with PHP logs, lands off-docroot per `security-runtime-hardening`), with an optional `CHAPTER_AUDIT_WEBHOOK` forward. No database table: nothing for an attacker to edit from wp-admin, nothing to migrate. Alternative — WP Activity Log plugin — documented as a richer option.
- **One log helper, same redaction.** `progressnow_log()` redacts keys matching `/(secret|signature|authorization|token|password|cookie)/i` at any depth, exactly like `lib/log.ts`; a shared fixture (`tests/fixtures/log-redaction.json`) is asserted from both sides, the way contract fixtures are.
- **Alerts are throttled per event key** (transient, 1 per hour per key) and always include the panel URL; email via `wp_mail` to `admin_email`, webhook JSON compatible with Slack incoming webhooks.
- **CSP report route on Next**: `POST /api/csp-report`, 8 KB cap, 1-in-N sampling configurable, logs `document-uri`, `violated-directive`, `blocked-uri` only. Rationale: the headers change needs a sink; the app already has logging and deploy paths; a hosted service remains an option via `CSP_REPORT_URI`.
- **Uptime workflow is opt-in** (`vars.UPTIME_URLS`), because scheduled workflows cost minutes and many adopters have a host monitor already.
- **Runbook first, tooling second.** `docs/incident-response.md` is written and walked through (tabletop) before the alert wiring lands, so the alerts point at steps that exist.

## Risks / Trade-offs

- [2FA gate locks out the only admin] → grace period (default 14 days), a `CHAPTER_2FA_ENFORCE=0` constant/env to disable, WP-CLI bypass documented; the gate never applies to WP-CLI.
- [Audit volume on busy sites] → only privileged events; content saves are not audited (the content version already changes).
- [Alert fatigue] → throttle + a single "needs attention" digest; success events are not alerted.
- [Webhook forward leaks data] → payloads carry event, actor id, object id, and timestamp; no content, no secrets.

## Migration Plan

1. `inc/log.php` + redaction fixture; migrate existing `error_log` calls.
2. `inc/audit.php` + tests; wire the existing hooks.
3. `inc/alerts.php` + CLI test command; throttle tests.
4. CSP report route; docs for the headers change to point at it.
5. 2FA gate drop-in + docs; enable with grace on the owner's install.
6. Runbook + tabletop; uptime workflow (opt-in).

## Open Questions

- Which 2FA provider does the owner standardize on — Wordfence Login Security (already optional) or the core Two-Factor plugin (WebAuthn)? (Recommend core Two-Factor for open-source neutrality; both adapters ship.)
- Should audit lines also go to the `chapter_build_state`-style option for in-admin viewing (last 50)? (Recommend no; keep the admin surface small and the log off-docroot.)
