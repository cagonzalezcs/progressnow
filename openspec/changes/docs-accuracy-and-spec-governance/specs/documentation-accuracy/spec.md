## ADDED Requirements

### Requirement: Status sections are generated from OpenSpec
The root README's roadmap and capabilities sections SHALL be rendered from the OpenSpec CLI's change and spec listings between marker comments, and CI SHALL fail when the committed README differs from a fresh render.

#### Scenario: Change archived
- **WHEN** a change is archived and the README is not regenerated
- **THEN** the docs job fails showing the stale row

### Requirement: Documented paths exist
Every repository path named in backticks in the root README, `docs/`, app READMEs, and open change proposals SHALL exist in the tree, unless marked `(planned)` in a proposal or allowlisted; relative links and anchors SHALL resolve.

#### Scenario: Renamed file
- **WHEN** `inc/rebuild.php` is renamed and a document still names the old path
- **THEN** the docs job fails with the file and line

### Requirement: One canonical owner per topic
The root README SHALL state which document owns each topic (map and quick start, per-app commands and environment, operator guides, intent and history), and non-owning documents SHALL link rather than duplicate; a duplicated-heading check SHALL fail on near-identical sections across files.

#### Scenario: Duplicate testing section
- **WHEN** two READMEs carry the same "Testing" body
- **THEN** the docs job fails naming both files

### Requirement: Security guidance in docs is correct and consistent
No document SHALL recommend disabling TLS verification; local-TLS guidance SHALL be the same in every app's documentation, and development-only relaxations in configuration SHALL be commented as such.

#### Scenario: TLS guidance
- **WHEN** the documentation is searched for `NODE_TLS_REJECT_UNAUTHORIZED`
- **THEN** every occurrence is a prohibition, never an instruction

### Requirement: OpenSpec configuration encodes the project's rules
`openspec/config.yaml` SHALL carry project context (stack, layout, invariants) and per-artifact rules so that generated proposals state their overlaps, designs name rejected alternatives, and tasks name the tests that prove each requirement.

#### Scenario: Artifact drafted with the CLI
- **WHEN** a new proposal is generated with the OpenSpec tooling
- **THEN** it includes an overlap statement and a non-modification statement for related open changes
