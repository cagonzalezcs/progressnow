## ADDED Requirements

### Requirement: Front-end responses carry security headers

Public front-end responses SHALL include `X-Content-Type-Options: nosniff`, a frame-protection directive, `Referrer-Policy`, `Permissions-Policy`, and `Strict-Transport-Security`.

#### Scenario: Headers present on a page load

- **WHEN** a public page is fetched over HTTPS
- **THEN** the response includes the nosniff, frame-protection, referrer-policy, permissions-policy, and HSTS headers

### Requirement: Content-Security-Policy protects the islands

A Content-Security-Policy SHALL be served that permits the site's own scripts and required embed origins while disallowing inline/injected script (no `unsafe-inline` for `script-src`), using a per-request nonce for the island bootstrap.

#### Scenario: Injected inline script is blocked

- **WHEN** a page carries an attacker-injected inline `<script>` without the current nonce
- **THEN** the browser refuses to execute it under the enforced CSP

#### Scenario: Legitimate island hydrates

- **WHEN** a normal page renders its Vue island with the nonce'd bootstrap
- **THEN** the island loads and hydrates without CSP violations

### Requirement: CSP rolls out report-only before enforcing

The CSP SHALL first be deployed in report-only mode with a violation sink, then switched to enforcing after tuning.

#### Scenario: Report-only collects violations

- **WHEN** the CSP is in report-only mode and a violation occurs
- **THEN** a report is recorded and the page is not broken
