## ADDED Requirements

### Requirement: Coverage is measured and cannot silently decrease
Every unit and component suite SHALL report statement and branch coverage in CI, with per-package floors that fail the job when coverage drops below them and a script that raises the floors when coverage rises.

#### Scenario: Coverage regression
- **WHEN** a change removes tests so a package's branch coverage falls below its floor
- **THEN** the CI job fails naming the package and the metric

### Requirement: Security-critical modules are mutation-tested
The signing and verification code, the replay cache, link re-homing, the security-header builder, environment validation, the request-trust helpers, the passthrough resolver, the kses helpers, and the output/URL sanitizers SHALL have per-file mutation-score floors checked on a schedule and on demand.

#### Scenario: Guard removed
- **WHEN** the timestamp window check in `verify()` is mutated away
- **THEN** at least one test fails and the mutant is reported killed

#### Scenario: Score below floor
- **WHEN** a scheduled mutation run scores a listed file below its floor
- **THEN** the workflow fails and lists the surviving mutants

### Requirement: Tests are not tautological
The repository SHALL provide an audit script that lists tests with no assertion, snapshot-only assertions, or self-equality assertions, and the documented count of such tests SHALL be zero after the audit.

#### Scenario: Audit clean
- **WHEN** the audit script runs over all suites
- **THEN** it reports no findings

### Requirement: Test taxonomy is documented
`docs/testing.md` SHALL describe each test layer (unit, contract, integration, e2e, accessibility, mutation): tool, location, what it proves, when it runs, and how to add a test.

#### Scenario: New contributor adds a test
- **WHEN** a contributor needs to cover a new REST parameter
- **THEN** the document tells them which layer, which directory, and which command to run
