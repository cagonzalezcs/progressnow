# rebuild-credential-boundary Specification

## Purpose
What credentials the WordPress host may hold for the static-rebuild pipeline, what each can reach, how they are supplied (environment before `wp-config.php`), how strong the shared HMAC secret must be, how they are rotated, and the guarantee that no token or secret value ever appears in admin pages, notices, WP-CLI output, `chapter_build_state` or logs. Complements `static-rebuild-pipeline` (the transports themselves) and `deploy-pipeline` (the workflow). Implemented in `inc/rebuild.php`, `inc/admin-build.php`, `next-js/lib/env.ts`, `docs/rebuild-dispatch-repo.md` and `docs/secrets-rotation.md`.

## Requirements

### Requirement: CMS-held credentials cannot change deployed code
No credential stored on the WordPress host (constant or environment) SHALL be able to modify the repository that frontends are built and deployed from. The GitHub transport SHALL target a dispatch repository containing only the rebuild workflow, and that workflow SHALL check the main repository out read-only.

#### Scenario: Leaked dispatch token
- **WHEN** an attacker obtains `CHAPTER_GITHUB_TOKEN` from a WordPress host
- **THEN** the token can trigger a rebuild and push to the dispatch repository only; it cannot push to any branch of the main repository

#### Scenario: Webhook transport holds no code credential
- **WHEN** the transport is `webhook`
- **THEN** the only rebuild credential on the WordPress host is the HMAC secret, which can request a build and acknowledge a build status and nothing else

### Requirement: Settings may be supplied by environment
Every `CHAPTER_*` rebuild and shell setting SHALL resolve from an environment variable of the same name before the `wp-config.php` constant; the Site build panel SHALL display the source of each setting and never its value.

#### Scenario: Secret injected by the host
- **WHEN** `CHAPTER_REBUILD_SECRET` is set in the PHP process environment and not in `wp-config.php`
- **THEN** the transport is fully configured and the panel shows `env` as the source

### Requirement: Shared secrets meet a minimum strength
`CHAPTER_REBUILD_SECRET` SHALL be at least 32 characters on both the WordPress and the receiver side; a shorter value SHALL disable the transport with a notice naming the constant.

#### Scenario: Short secret rejected
- **WHEN** the secret is 20 characters long
- **THEN** `progressnow_rebuild_transport()` returns `none` and an admin notice explains why; the Next receiver refuses to start

### Requirement: Secrets never appear in output
No token or secret value SHALL appear in admin pages, admin notices, WP-CLI output, `chapter_build_state`, PHP error logs, or HTTP responses, including error bodies echoed from GitHub or a receiver.

#### Scenario: Upstream error body contains the token
- **WHEN** a dispatch fails and the upstream error body contains the configured token
- **THEN** `lastError` and the notice show a redacted message

### Requirement: Rotation runbook
The repository SHALL document a rotation procedure for every rebuild credential (PAT, webhook secret(s), rsync key, AWS trust, Vercel tokens) with an order of operations that keeps the pipeline signed throughout, and the procedure SHALL have been executed at least once.

#### Scenario: Secret rotated without downtime
- **WHEN** the webhook secret is rotated following the runbook
- **THEN** no rebuild request or `/build-status` callback is rejected during the rotation window
