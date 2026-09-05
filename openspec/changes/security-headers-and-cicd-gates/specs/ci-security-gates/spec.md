## ADDED Requirements

### Requirement: Static analysis gates insecure PHP

CI SHALL run PHP static analysis with WordPress security sniffs over the custom theme code and fail on high-confidence insecure patterns (missing escaping/sanitization/nonce where required).

#### Scenario: Insecure pattern fails CI

- **WHEN** custom theme code introduces an unescaped output or unsanitized input in a flagged sink
- **THEN** the SAST job fails and names the file and rule

### Requirement: Secret scanning runs on every PR

CI SHALL scan for committed secrets and fail when a credential-like string is detected.

#### Scenario: Committed key blocks merge

- **WHEN** an API key, password, or license token is added to a tracked file
- **THEN** the secret-scan job fails and identifies the finding

### Requirement: Security jobs are required for merge

Merges to the default branch SHALL require the security jobs (SAST, secret scan, artifact guard) to pass.

#### Scenario: Failing security job blocks merge

- **WHEN** any required security job fails on a pull request
- **THEN** the pull request cannot be merged until it passes
