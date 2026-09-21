## Why

When `open-source-release-readiness` superseded `security-remove-duplicator-and-purge-artifacts`, it explicitly dropped that change's "off-docroot backup runbook … with the prod-host deferral". The result is that no document in the repository says how the WordPress database, uploads, or configuration are backed up or restored. `docs/deployment.md` §8 covers rolling back a *static build* (S3 object versions, 30 days) — derived data that can be regenerated from WordPress — but not the database, which cannot. There is no recovery-point or recovery-time objective, no restore drill, and no statement of what is in scope (DB, uploads, `wp-config.php` secrets, plugin licence keys, ACF option pages).

The production host is not yet reachable (deferred), which is exactly why the procedure should be written now: the first thing done on that host should be the backup job, not the site.

## What Changes

- **Scope and objectives:** what is backed up (database, `wp-content/uploads`, `wp-config.php`/environment secrets inventory, licence keys reference, the static build's manifest for correlation), how often (daily DB, daily uploads delta, on-demand before deploys), retention (30 daily, 12 monthly), RPO 24 h / RTO 4 h as defaults the adopter overrides.
- **Mechanism, in order of preference:** host/provider snapshots; otherwise a documented `wp db export` + uploads sync to an encrypted off-site bucket from system cron, never inside the docroot (`repository-hygiene` forbids artifacts there); nothing runs through a WordPress plugin.
- **Restore runbook:** fresh host → core → theme → plugins (licensed, adopter-installed) → DB import → uploads → constants → `wp search-replace` if the origin changed → smoke (`scripts/smoke.mjs`, `wp chapter build-status`) → rebuild.
- **Restore drill:** performed on a staging host at least twice a year; the date and outcome recorded in `docs/backup-and-recovery.md`. (planned)
- **Frontend rollback cross-reference:** the existing static rollback (§8) and Next rollback (§10.7) linked as the "derived data" half of recovery.
- **Optional automation:** `bin/backup.sh` (WP-CLI + rclone, env-configured, no secrets in the file) for hosts without snapshots; `.github/workflows` untouched. (planned)

## Capabilities

### New Capabilities
- `backup-and-recovery`: what is backed up, where, how often, how it is restored, and how that is proven.

### Modified Capabilities
- none.

## Impact

- **Docs:** new `docs/backup-and-recovery.md`; pointers from `docs/deployment.md` §8 and `docs/incident-response.md` (owned by `security-detection-and-response`). (planned)
- **Scripts:** optional `wp-content/themes/progressnow/bin/backup.sh` + `restore-check.sh` (verify a dump imports and the site smoke-tests). (planned)
- **Ops:** first execution and drill happen when the host is accessible; until then the change delivers the documents and scripts and is verified against a local MAMP/WP-env instance.
- **No application code change.**
- **Coordinates with:** `security-runtime-hardening` (salts inventory), `security-rebuild-transport-trust-boundary` (secrets rotation after a restore), `security-detection-and-response` (recovery step of the runbook). Does not modify those changes.
