## ADDED Requirements

### Requirement: Privileged accounts require a second factor
Administrator and Editor accounts SHALL be unable to use wp-admin with a password alone once a grace period has elapsed; the gate SHALL be provider-agnostic, SHALL never apply to WP-CLI, and SHALL be disableable by a documented constant or environment variable.

#### Scenario: Un-enrolled editor after grace
- **WHEN** an Editor without a second factor opens wp-admin 15 days after the gate was enabled with a 14-day grace
- **THEN** they see enrolment instructions and no admin screen

#### Scenario: Enrolled administrator
- **WHEN** an Administrator whose provider reports enrolment logs in
- **THEN** wp-admin works normally

### Requirement: Privileged actions are audited
Rebuild requests and results, transport setting changes, Chapter Settings writes, role changes, plugin and theme activation, and user creation SHALL each produce one structured audit line with actor, client address, object, and outcome, and SHALL never include secret values or content bodies.

#### Scenario: Rebuild now audited
- **WHEN** an administrator presses "Rebuild now"
- **THEN** one audit line records the actor, the request id, and the dispatch outcome

### Requirement: Structured logging with shared redaction
PHP logging SHALL emit one JSON object per line with `level`, `time`, `event`, and fields, redacting any key matching the shared secret-key pattern at any depth; the pattern SHALL be asserted by the same fixture on the PHP and Node sides.

#### Scenario: Secret in nested field
- **WHEN** a log call includes `{ github: { token: "…" } }`
- **THEN** the line shows `"token":"[redacted]"`

### Requirement: Failures reach a human
A dispatch that ends in `needs_attention`, a build reported `failed`, and a shell that cannot read its manifest SHALL each trigger a throttled notification (email; optional webhook) that links to the Site build panel; successes SHALL NOT notify.

#### Scenario: Throttled repeat
- **WHEN** the manifest is unreadable for two hours
- **THEN** at most two notifications are sent for that key

### Requirement: CSP violations have a sink
The Next.js app SHALL provide a size-capped, sampled `POST /api/csp-report` endpoint that logs the violated directive, blocked URI, and document URI, usable by the app's own policy and by the theme's report-only rollout.

#### Scenario: Oversized report dropped
- **WHEN** a 100 KB report is posted
- **THEN** the endpoint answers 413 and logs nothing

### Requirement: Health checks and an incident runbook exist
The repository SHALL ship an opt-in scheduled health probe for the health endpoint, the site envelope, and the shell manifest, and a written incident-response runbook covering triage, containment (including transport shutdown and secret rotation), evidence, recovery, and review, walked through at least once.

#### Scenario: Probe detects an outage
- **WHEN** `/api/health` fails three consecutive probes
- **THEN** a GitHub issue is opened with the failing URL and closed when the probe recovers
