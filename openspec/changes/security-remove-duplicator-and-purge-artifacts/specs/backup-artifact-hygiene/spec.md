## ADDED Requirements

### Requirement: No migration/backup tooling ships to production

The production site SHALL NOT contain the Duplicator plugin or any other migration/backup tool that auto-loads on request or writes artifacts into the public webroot.

#### Scenario: Duplicator absent on production

- **WHEN** the production plugin directory is inventoried
- **THEN** no `duplicator` (or equivalent in-webroot migration) plugin is present or active

#### Scenario: Migration tooling is ephemeral

- **WHEN** a migration requires temporary tooling
- **THEN** it is installed under authentication, used, and removed within the same maintenance window, leaving no installer or archive behind

### Requirement: No web-reachable backup or installer artifacts

No `*.zip` source archive, `installer.php`, `dup-installer/` directory, database dump, or backup archive SHALL be reachable under the public docroot in any environment.

#### Scenario: Artifacts purged from repo and webroot

- **WHEN** the repository and deployed docroot are scanned
- **THEN** `wp-content/themes/progressnow.zip`, `wp-content/backups-dup-lite/`, and any installer/archive/dump files are absent

#### Scenario: Backups stored off-docroot

- **WHEN** a backup runs
- **THEN** its output is written to a location outside the public webroot (host snapshot or offsite storage), never inside `wp-content/` or the docroot

### Requirement: CI blocks backup/installer/archive artifacts

The CI pipeline SHALL fail when a tracked file or deploy-bundle entry matches a backup, installer, or archive artifact pattern.

#### Scenario: Planted artifact fails CI

- **WHEN** a file matching `\.zip$`, `installer(-backup)?\.php$`, `dup-installer/`, `*_archive.zip`, or a database-dump extension is added to the repo or bundle
- **THEN** the CI guard job fails with a message naming the offending path

#### Scenario: Clean tree passes

- **WHEN** the repository contains no such artifacts
- **THEN** the CI guard job passes
