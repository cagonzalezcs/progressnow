## Context

Site is WordPress + Timber theme (`wp-content/themes/progressnow`). Duplicator 1.5.16.1 is committed under `wp-content/plugins/duplicator` and installed. Duplicator's installer flow (`installer.php`, `dup-installer/`, archive `.zip`) and its lite-backups dir are classic breach vectors: unauthenticated file download, leftover installers granting DB/config access, source disclosure. Today `wp-content/backups-dup-lite/` is committed (placeholder `index.php`/`.htaccess`) and `wp-content/themes/progressnow.zip` sits untracked in the working tree. No real archives are web-reachable at the docroot right now — the goal is to keep it that way permanently and remove the tool that produces them.

## Goals / Non-Goals

**Goals:**
- Duplicator absent from production; migrations use a controlled, ephemeral process.
- No `*.zip` / installer / backup artifact in the repo or the deployed docroot, enforced by CI.
- A documented backup strategy that stores artifacts off the public webroot.

**Non-Goals:**
- Building a new backup system from scratch — prefer host-level snapshots or an established off-docroot plugin/CLI (WP-CLI + object storage).
- The full deploy-bundle composition (owned by the `deploy-pipeline` change); here we only add the artifact guard and the ignore rules.

## Decisions

- **Remove Duplicator entirely rather than "harden in place."** Rationale: it is migration-only; there is no runtime need, and every version carries installer-exposure risk. Alternative (keep + restrict via `.htaccess`) rejected — one misconfig re-exposes it, and it still auto-loads on every request.
- **Backups run off-docroot.** Prefer provider snapshots (DB + files) or WP-CLI `db export` piped to encrypted offsite storage, written to a path outside `public_html`. Alternative (in-webroot backup plugins) rejected — reintroduces the exact artifact-in-docroot class.
- **CI guard is a deny-list script** run in the `js`/`php` workflow: fail if tracked files match `\.zip$`, `installer(-backup)?\.php$`, `dup-installer/`, `*_archive.zip`, or common dump extensions. Alternative (rely on `.gitignore` only) rejected — ignore rules don't catch force-adds or deploy-bundle contents.
- **Migration runbook** documents the temporary, authenticated, immediately-deleted nature of any future migration tooling.

## Risks / Trade-offs

- [Removing Duplicator breaks an existing migration habit] → Publish the WP-CLI/snapshot runbook before removal; verify a full restore once.
- [History still contains committed artifacts] → Purge from working tree now; optionally scrub git history if any real archive/secret was ever committed (scope check in tasks).
- [CI guard false-positives on legitimate zips] → Scope the deny-list to backup/installer patterns and the docroot; allow an explicit annotated exception list.

## Migration Plan

1. Document + validate the replacement backup/restore procedure.
2. Deactivate & delete Duplicator on all environments; remove from repo.
3. Delete `backups-dup-lite/` and `progressnow.zip`; add ignore rules.
4. Land the CI guard; confirm it fails on a planted test artifact, then passes clean.

## Open Questions

- Host-level snapshots vs. WP-CLI-to-offsite: which does the ops team standardize on?
- Was any real Duplicator archive or `.sql` dump ever committed historically (drives whether a git-history scrub is needed)?
