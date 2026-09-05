## 1. Replacement backup/restore procedure

- [ ] 1.1 Decide backup mechanism (host snapshots vs WP-CLI db export → encrypted offsite); document in ops runbook
- [ ] 1.2 Document a full restore drill and run it once against a staging copy; record RTO/RPO
- [ ] 1.3 Write a short migration runbook (temporary, authenticated, delete-after-use tooling only)

## 2. Remove Duplicator

- [ ] 2.1 Deactivate + delete Duplicator on every environment (prod, staging, local)
- [ ] 2.2 Remove `wp-content/plugins/duplicator` from the repo
- [ ] 2.3 Confirm no site code references Duplicator hooks/paths

## 3. Purge artifacts

- [ ] 3.1 Delete `wp-content/themes/progressnow.zip`
- [ ] 3.2 Delete `wp-content/backups-dup-lite/`
- [ ] 3.3 Add `.gitignore` rules: `*.zip` under `wp-content/`, `**/dup-installer/`, `**/installer*.php`, `**/backups-dup-*/`, `*.sql`, `*.sql.gz`
- [ ] 3.4 Audit git history for any previously-committed real archive/dump/secret; scrub if found

## 4. CI / deploy guard

- [ ] 4.1 Add a guard script that fails on backup/installer/archive/dump patterns in tracked files and the deploy bundle
- [ ] 4.2 Wire the guard into `.github/workflows/ci.yml` (and the deploy-pipeline bundle step)
- [ ] 4.3 Verify: planted test artifact fails the job; clean tree passes
- [ ] 4.4 Coordinate guard placement with the `deploy-pipeline` change owner

## 5. Verification

- [ ] 5.1 Scan prod docroot for `installer.php`/`dup-installer/`/`*.zip` → none reachable
- [ ] 5.2 Confirm a scheduled off-docroot backup produces a restorable artifact
