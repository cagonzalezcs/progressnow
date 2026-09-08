## ADDED Requirements

### Requirement: Durable state is backed up off the host
The database, `wp-content/uploads`, and an inventory of per-environment secrets SHALL be backed up on a documented schedule to encrypted storage outside the web host and outside the document root, without any WordPress plugin, meeting a documented recovery-point objective.

#### Scenario: Daily backup lands off-site
- **WHEN** the scheduled job runs
- **THEN** an encrypted database dump named with the current content version and an uploads delta exist in the off-site store and no artifact exists under the document root

### Requirement: Restore is documented and rehearsed
The repository SHALL contain a step-by-step restore procedure ending in the deployment smoke test, and a restore drill SHALL be performed on a non-production host at least twice a year with its outcome recorded.

#### Scenario: Maintainer restores from the document
- **WHEN** a maintainer follows the restore checklist on a fresh host with the latest backup
- **THEN** the site renders both languages, `wp chapter build-status` reports the restored content version, and a rebuild is dispatched within the recovery-time objective

#### Scenario: Drill recorded
- **WHEN** a drill completes
- **THEN** the drill log in the runbook gains a dated entry with duration and issues
