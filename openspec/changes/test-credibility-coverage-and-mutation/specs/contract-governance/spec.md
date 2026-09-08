## ADDED Requirements

### Requirement: Fixture changes are deliberate
A change to any committed contract fixture SHALL be accompanied by the `fixtures` pull-request label and a completed reviewer checklist line stating the spec that motivates the change; CI SHALL fail otherwise.

#### Scenario: Unlabeled regeneration
- **WHEN** a pull request modifies `tests/fixtures/posts-envelope.json` without the label
- **THEN** the fixtures guard fails and names the file

#### Scenario: Reviewed regeneration
- **WHEN** the same pull request carries the label and the checklist line
- **THEN** the guard passes and the diff is reviewed field by field
