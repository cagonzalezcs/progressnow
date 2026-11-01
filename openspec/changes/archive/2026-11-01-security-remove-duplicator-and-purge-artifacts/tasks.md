## 1. Replacement backup/restore procedure

- [ ] 1.1 Decide backup mechanism (host snapshots vs WP-CLI db export → encrypted offsite); document in ops runbook — owned by `ops-backup-and-disaster-recovery` (its tasks 1.x)
- [ ] 1.2 Document a full restore drill and run it once against a staging copy; record RTO/RPO — owned by `ops-backup-and-disaster-recovery`
- [ ] 1.3 Write a short migration runbook (temporary, authenticated, delete-after-use tooling only) — owned by `ops-backup-and-disaster-recovery`

## 2. Remove Duplicator

- [ ] 2.1 Deactivate + delete Duplicator on every environment (prod, staging, local) — owner: production and staging hosts are not reachable from this repository; local is plugin-free
- [x] 2.2 Remove `wp-content/plugins/duplicator` from the repo — done: `/wp-content/plugins/` is ignored and nothing under it is tracked (November 1, 2026)
- [x] 2.3 Confirm no site code references Duplicator hooks/paths — done (November 1, 2026): the only mentions are the deny patterns in `.github/scripts/artifact-guard.sh` and the README gate description

## 3. Purge artifacts

- [x] 3.1 Delete `wp-content/themes/progressnow.zip` — done: not tracked, `*.zip` ignored
- [x] 3.2 Delete `wp-content/backups-dup-lite/` — done: not tracked, `**/backups-dup-*/` ignored
- [x] 3.3 Add `.gitignore` rules: `*.zip` under `wp-content/`, `**/dup-installer/`, `**/installer*.php`, `**/backups-dup-*/`, `*.sql`, `*.sql.gz` — done (PR #38): root `.gitignore` carries every pattern
- [ ] 3.4 Audit git history for any previously-committed real archive/dump/secret; scrub if found — owner decision: the first public commit holds a `wp-config.php` with hosted credentials and salts; rotation and any history scrub are the owner's call

## 4. CI / deploy guard

- [x] 4.1 Add a guard script that fails on backup/installer/archive/dump patterns in tracked files and the deploy bundle — done (PR #22): `.github/scripts/artifact-guard.sh`
- [x] 4.2 Wire the guard into `.github/workflows/ci.yml` (and the deploy-pipeline bundle step) — done (PR #22, PR #38): required `artifact-guard` job in `ci.yml`, same guard over the bundle in `rebuild-site.yml`
- [x] 4.3 Verify: planted test artifact fails the job; clean tree passes — done (PR #22): verified on the PR branch, documented in `docs/security-gates.md`
- [ ] 4.4 Coordinate guard placement with the `deploy-pipeline` change owner — moot: the `deploy-pipeline` stub was deleted; the bundle guard lives in `rebuild-site.yml`

## 5. Verification

- [ ] 5.1 Scan prod docroot for `installer.php`/`dup-installer/`/`*.zip` → none reachable — owner: production host not reachable from this repository
- [ ] 5.2 Confirm a scheduled off-docroot backup produces a restorable artifact — owned by `ops-backup-and-disaster-recovery`
