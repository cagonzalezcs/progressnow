## ADDED Requirements

### Requirement: No role can store executable markup

Content sanitization SHALL apply to all roles; no user, regardless of capability, SHALL be able to persist `<script>` or equivalent executable markup into rendered content.

#### Scenario: Administrator script is stripped

- **WHEN** an Administrator saves post/field content containing a `<script>` tag
- **THEN** the stored and rendered content contains no executable script

#### Scenario: Legitimate formatting preserved

- **WHEN** any author saves allowed rich content (links, headings, images, lists)
- **THEN** that content is preserved through kses

### Requirement: unfiltered_html is disabled for every role

The `unfiltered_html` capability SHALL NOT be granted to any role.

#### Scenario: Capability absent

- **WHEN** roles/capabilities are inspected
- **THEN** no role reports the `unfiltered_html` capability

#### Scenario: Regression test enforces it

- **WHEN** the capability regression test runs
- **THEN** it asserts `unfiltered_html` is absent for all roles

### Requirement: Least-privilege role model is documented

The intended role-to-capability model SHALL be documented, and users SHALL be assigned the lowest role sufficient for their function.

#### Scenario: Role model exists

- **WHEN** the authoring trust-model doc is reviewed
- **THEN** it defines each role's purpose and confirms Administrator is reserved for maintainers
