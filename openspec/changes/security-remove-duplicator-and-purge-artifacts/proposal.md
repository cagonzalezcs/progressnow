## Why

The Duplicator migration plugin (1.5.16.1) is installed and committed to the repo. Duplicator has a documented history of unauthenticated arbitrary file read/download and installer-file exposure; it is a migration-only tool, not a runtime dependency, so keeping it live on production is pure attack surface. Compounding this, a theme source archive (`wp-content/themes/progressnow.zip`) sits untracked in the webroot and `wp-content/backups-dup-lite/` is committed — any `.zip`, `installer.php`, `dup-installer/`, or backup archive that becomes web-reachable is a direct source-disclosure / site-takeover vector.

## What Changes

- **BREAKING (ops):** Remove the Duplicator plugin from production installs; it is not part of the runtime.
- Purge `wp-content/themes/progressnow.zip` and `wp-content/backups-dup-lite/` from the repo and the deploy bundle.
- Guarantee no `installer.php`, `dup-installer/`, `*_archive.zip`, or backup file is ever web-reachable in any environment.
- Adopt a documented, off-docroot backup approach (server/host-level or offsite) that leaves no artifact in the public webroot.
- Add a CI + pre-deploy guard that fails the build when `*.zip`, installer archives, or backup files appear in the repo or the deploy bundle.

## Capabilities

### New Capabilities
- `backup-artifact-hygiene`: Rules for what backup/migration/archive artifacts may exist, where, and how they are kept out of the webroot and the repo, enforced automatically.

### Modified Capabilities
<!-- None: deploy-pipeline change is complementary; no existing spec requirements change. -->

## Impact

- **Plugins:** Removes `wp-content/plugins/duplicator`.
- **Repo:** Deletes `wp-content/backups-dup-lite/`, `wp-content/themes/progressnow.zip`; adds `.gitignore` rules and a CI guard script.
- **Ops/runbook:** New documented backup + migration procedure; complements the existing `deploy-pipeline` change (bundle composition / guard wiring).
- **No application code change.**
