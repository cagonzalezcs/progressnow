## ADDED Requirements

### Requirement: Plugins and core are declared and version-pinned

WordPress core and all plugins SHALL have a declared, pinned version under source control, with a documented update path per dependency (managed install or controlled-vendor).

#### Scenario: Every dependency has a pinned version

- **WHEN** the dependency manifest/lockfile is inspected
- **THEN** each plugin and core has an explicit pinned version and a stated update mechanism

### Requirement: Known-vulnerable dependencies fail CI

CI SHALL fail when a declared dependency (Composer, npm) has a known high/critical advisory, and a scheduled check SHALL flag newly-disclosed vulnerabilities affecting pinned plugin versions.

#### Scenario: Vulnerable package blocks merge

- **WHEN** a dependency with a high/critical advisory is present at CI time
- **THEN** the audit job fails and names the package and advisory

#### Scenario: Post-pin disclosure is surfaced

- **WHEN** a vulnerability is disclosed for an already-pinned plugin version
- **THEN** the scheduled vuln-feed job opens/annotates an alert for that plugin

### Requirement: Automated update PRs

An automated tool SHALL open update pull requests for Composer, npm, and GitHub Actions dependencies on a defined schedule.

#### Scenario: Update PR is raised

- **WHEN** a newer compatible version of a managed dependency is released
- **THEN** an update PR is opened for review and CI runs against it

### Requirement: Documented patch SLA

A written patch SLA SHALL define remediation timeframes by severity, an accountable owner, and an emergency-patch path.

#### Scenario: Critical patch within SLA

- **WHEN** a critical plugin/core vulnerability is disclosed
- **THEN** the runbook specifies the owner applies the patch within the critical-severity window and records the action

### Requirement: License keys are never committed

Credentials for licensed-plugin installs SHALL be provided via secrets, never stored in the repository.

#### Scenario: No secret in repo

- **WHEN** the repo and CI config are scanned
- **THEN** no ACF/Polylang license key or install token appears in tracked files
