## ADDED Requirements

### Requirement: URL fields exposed to the front-end are scheme-validated

Every URL value placed into a REST payload or an embedded island context SHALL be passed through a shared sanitizer that escapes it and permits only the `http`, `https`, `mailto`, and `tel` schemes. Values with any other scheme SHALL be dropped (the field omitted).

#### Scenario: Dangerous scheme rejected

- **WHEN** a block attribute or post-meta URL field contains `javascript:`, `data:`, or `vbscript:`
- **THEN** the serialized contract does not include that URL and the consuming binding renders no link/src

#### Scenario: Safe URL preserved

- **WHEN** a URL field contains a well-formed `https://` (or `mailto:`/`tel:`) value
- **THEN** the serialized contract includes the escaped URL unchanged in scheme

### Requirement: Known URL sinks are sanitized

The video-block `transcriptUrl` and `url`, the image-block fallback `src`, the blog pagination URLs, and the event `rsvpUrl` (all serializer paths) SHALL be produced through the shared sanitizer.

#### Scenario: Contributor cannot store an executable transcript link

- **WHEN** a Contributor submits a `progressnow/video` block with `transcript_url` set to a `javascript:` URI and it is previewed by an editor
- **THEN** clicking the transcript control executes no script because the URL was dropped at serialization

#### Scenario: Pagination URL cannot inject

- **WHEN** the request URI contains crafted query content and pagination links are generated
- **THEN** the emitted `newerUrl`/`olderUrl` are URL-escaped and non-executable

### Requirement: Regression tests cover hostile URL inputs

The test suite SHALL assert that hostile URL fixtures produce no dangerous-scheme URL in any serialized contract.

#### Scenario: Hostile-fixture test passes

- **WHEN** the URL-sink unit tests run with `javascript:`/`data:`/`vbscript:` fixtures for each covered field
- **THEN** every assertion confirms the field is absent or scheme-safe
