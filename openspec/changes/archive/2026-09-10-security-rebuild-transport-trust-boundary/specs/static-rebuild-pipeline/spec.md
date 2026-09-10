## MODIFIED Requirements

### Requirement: GitHub transport
With `github`, WordPress SHALL `POST https://api.github.com/repos/{CHAPTER_GITHUB_REPO}/dispatches` with `event_type: "rebuild-site"` and the payload as `client_payload`, authenticated by `CHAPTER_GITHUB_TOKEN`, and SHALL treat a 204 as accepted. Failed dispatches SHALL retry three times with backoff, then set `needs_attention` and show an admin notice. The token SHALL be supplied by the `CHAPTER_GITHUB_TOKEN` environment variable or `wp-config.php` constant (environment first), SHALL be scoped to a repository that cannot change deployed frontend code (the dispatch repository pattern), and SHALL never be echoed in any output.

#### Scenario: Dispatch accepted by GitHub
- **WHEN** a correctly authenticated dispatch is sent
- **THEN** GitHub responds 204 and build state becomes `requested` with the request id

#### Scenario: GitHub unreachable
- **WHEN** the API is unreachable for all retries
- **THEN** build state becomes `needs_attention` with the last error and an admin notice appears

#### Scenario: Token scoped away from code
- **WHEN** `CHAPTER_GITHUB_REPO` names the dispatch repository
- **THEN** the build still runs from the main repository's `main` and the token has no write access to it
