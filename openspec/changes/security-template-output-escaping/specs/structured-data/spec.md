## ADDED Requirements

### Requirement: Script-safe JSON-LD encoding
JSON-LD blocks SHALL be serialized with the theme's script-context encoder so that no editor-controlled value (headline, description, author or committee name, venue, chapter name) can terminate the `<script type="application/ld+json">` element or inject markup, while the block remains valid JSON-LD.

#### Scenario: Hostile headline stays data
- **WHEN** a post titled `</script><script>alert(1)</script>` renders
- **THEN** the JSON-LD block parses as JSON with that exact headline string and the document contains exactly one `ld+json` script element

#### Scenario: Structured data still validates
- **WHEN** the encoded block is parsed by a schema.org validator
- **THEN** the `Organization`, `Article`, and `Event` entities are unchanged from the unencoded output
