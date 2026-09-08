## Context

The site's durable state is the WordPress database (content, ACF options, Polylang tables, `chapter_build_state`), `wp-content/uploads`, and per-environment secrets in `wp-config.php` or the environment. Everything else is reproducible from git (theme, apps), from vendors (core, licensed plugins), or from WordPress (static builds, Next cache). The previous backup plan was tied to a plugin (Duplicator) that has been removed for good reasons.

## Goals / Non-Goals

**Goals:**
- Documented, plugin-free backups of the durable state, stored encrypted off the host.
- A restore that a maintainer can perform from the document alone within the RTO.
- Evidence that the restore works (drills recorded).

**Non-Goals:**
- Backing up derived data (static builds, caches, `node_modules`).
- A backup plugin or admin UI.
- High-availability or multi-region operation.

## Decisions

- **Provider snapshots first.** Most hosts offer daily VM/DB snapshots; use them and document how to restore from them. Rationale: least code, tested by the provider.
- **Fallback: WP-CLI + rclone from system cron.** `wp db export --single-transaction | gzip | age -r <key>` → `rclone copy` to an object store; uploads via `rclone sync` with versioning. Secrets (age key, rclone remote) live in the cron user's environment, never in the script or the repo.
- **Off-docroot, always.** Working directory outside the web root; no archive ever passes through `wp-content/` (`repository-hygiene` and the future artifact guard forbid it).
- **Restore is a checklist with commands**, ordered so a wrong step fails loudly (DB import before theme activation, `wp core verify-checksums`, `wp plugin verify-checksums`), ending with the same smoke used for deploys.
- **Correlate with builds.** The dump filename embeds the content version (`progressnow_content_ver`) so a restore knows which static build/Next cache is stale and triggers a rebuild.
- **Drill twice a year on staging**, logged in the doc with date, dump size, restore duration, and issues. Rationale: an untested backup is a hope.

## Risks / Trade-offs

- [No host yet] → verify the scripts against a local WordPress (MAMP or `wp-env`); the drill on real infrastructure is a follow-up task gated on host access.
- [Licensed plugins cannot be backed up legally] → the runbook restores them from the vendor with the adopter's licence; only their *settings* (in the DB) are backed up.
- [Encrypted backups lose the key] → key escrow instructions (two holders) in the runbook.

## Migration Plan

1. Write `docs/backup-and-recovery.md` (scope, objectives, snapshot path, WP-CLI path, restore checklist, drill log).
2. Add `bin/backup.sh` + `bin/restore-check.sh`; test locally end to end (export → restore into a fresh local DB → smoke).
3. When the host is reachable: configure the job, run one backup, perform the first drill on staging, record it.

## Open Questions

- Which object store for off-site copies (S3 bucket from `infra/terraform/` with a separate prefix and lifecycle, or the host's own)? (Recommend a dedicated bucket, not the static-site bucket.)
- Default RPO/RTO for the reference docs: 24 h / 4 h acceptable? (Recommend yes; adopters override.)
