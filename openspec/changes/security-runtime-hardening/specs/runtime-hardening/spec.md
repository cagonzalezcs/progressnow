## ADDED Requirements

### Requirement: Production disables debug output and off-docroot logging

Under the production environment type, debugging SHALL be off and any debug log SHALL be written outside the public docroot.

#### Scenario: Production has debug off

- **WHEN** the site runs with `WP_ENVIRONMENT_TYPE=production`
- **THEN** `WP_DEBUG` and `WP_DEBUG_DISPLAY` are false and no `debug.log` is reachable under the docroot

### Requirement: Committed production config baseline

The repository SHALL contain a reviewable production hardening baseline that each environment's `wp-config.php` applies, without storing environment secrets.

#### Scenario: Baseline defines the guards

- **WHEN** the committed baseline is reviewed
- **THEN** it specifies `DISALLOW_FILE_EDIT`, SSL-admin enforcement, environment type, and the auto-update policy, and contains no real secrets

### Requirement: Salt/key rotation is documented

Authentication keys and salts SHALL be generated per environment and never committed, with a documented rotation procedure.

#### Scenario: Rotation runbook exists and works

- **WHEN** an operator follows the rotation runbook
- **THEN** salts are regenerated per environment and existing sessions invalidate, with no secret entering source control

### Requirement: XML-RPC is disabled

`xmlrpc.php` functionality SHALL be disabled.

#### Scenario: XML-RPC request refused

- **WHEN** an XML-RPC method (e.g. `pingback.ping`) is invoked
- **THEN** the request is refused (feature disabled / blocked)

### Requirement: Anonymous user enumeration is blocked

Unauthenticated user enumeration via REST `wp/v2/users` and `?author=N` SHALL be blocked, without breaking the theme's intended public author display.

#### Scenario: Anon users endpoint blocked

- **WHEN** an unauthenticated client requests `wp-json/wp/v2/users`
- **THEN** the response does not enumerate site users

#### Scenario: Author-id enumeration blocked but author page works

- **WHEN** an unauthenticated client requests `?author=1`
- **THEN** it does not redirect-leak the author slug, while the theme's author archive page still renders normally

### Requirement: Discovery meta is removed

Generator, RSD, and Windows-Live-Writer discovery output SHALL be removed from the public HTML/headers.

#### Scenario: No generator meta

- **WHEN** a public page is fetched
- **THEN** it contains no `generator`, RSD, or WLW-manifest discovery tags
