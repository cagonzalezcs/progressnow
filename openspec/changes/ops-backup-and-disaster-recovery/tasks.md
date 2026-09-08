## 1. Runbook

- [ ] 1.1 Write `docs/backup-and-recovery.md`: scope (DB, uploads, secrets inventory, licence references), RPO/RTO defaults, retention, encryption and key escrow
- [ ] 1.2 Document the provider-snapshot path and the WP-CLI + rclone fallback (cron line, environment variables, off-docroot working dir)
- [ ] 1.3 Write the restore checklist (fresh host → core → theme → plugins → DB → uploads → constants → search-replace → smoke → rebuild) with the exact commands
- [ ] 1.4 Cross-link from `docs/deployment.md` §8 and (when it exists) `docs/incident-response.md`

## 2. Scripts

- [ ] 2.1 `bin/backup.sh`: `wp db export` (single transaction) + uploads sync, encrypted, content-version in the filename, no secrets in the file; `shellcheck` clean
- [ ] 2.2 `bin/restore-check.sh`: import a dump into a scratch DB, activate the theme, run `wp chapter build-status` and the HTTP smoke against a local URL
- [ ] 2.3 Test both scripts end to end against a local WordPress; record the run in the doc

## 3. First execution (gated on host access)

- [ ] 3.1 Configure the backup job on the production host; verify the first off-site copy decrypts
- [ ] 3.2 Perform the first restore drill on staging; record date, duration, and issues in the drill log
