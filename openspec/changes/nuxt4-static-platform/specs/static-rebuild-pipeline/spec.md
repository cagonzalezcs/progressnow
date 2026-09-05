## ADDED Requirements

### Requirement: Rebuild triggers
A rebuild SHALL be requestable from three sources: automatically when the content version is bumped (post/event/term/options saves), from a "Rebuild now" button on the Site build panel in wp-admin (`manage_options`, nonce-protected), and from WP-CLI (`wp chapter rebuild [--wait]`).

#### Scenario: Publish triggers a rebuild
- **WHEN** an editor publishes an event
- **THEN** a dispatch is scheduled without any editor action

#### Scenario: Manual rebuild
- **WHEN** an admin clicks "Rebuild now"
- **THEN** a dispatch is sent immediately and the panel shows the result

### Requirement: Coalesced dispatch with a lost-update guard
Automatic triggers SHALL be debounced into one dispatch per 90-second window via a single scheduled cron event. WordPress SHALL record the content version requested; when a build completes for an older version than the current one, WordPress SHALL schedule another dispatch.

#### Scenario: Burst of edits
- **WHEN** an editor saves five posts within a minute
- **THEN** exactly one dispatch is sent after the window elapses

#### Scenario: Edit during a build
- **WHEN** content changes while a build is running and that build completes
- **THEN** WordPress dispatches again so the live build reaches the newest version

### Requirement: Pluggable transport
`CHAPTER_REBUILD_TRANSPORT` SHALL select how a dispatch leaves WordPress: `github` (default), `webhook`, or `none`. With `none`, nothing is sent and the site SHALL remain fully functional through the freshness guard. Every transport SHALL send the same payload `{ event: "rebuild", requestId, contentVersion, reason, siteUrl, requestedAt }`.

#### Scenario: No transport configured
- **WHEN** the transport is `none` and an editor publishes
- **THEN** no request leaves WordPress, build state shows `not_configured`, and visitors keep getting fresh content through REST-backed navigation

### Requirement: GitHub transport
With `github`, WordPress SHALL `POST https://api.github.com/repos/{CHAPTER_GITHUB_REPO}/dispatches` with `event_type: "rebuild-site"` and the payload as `client_payload`, authenticated by the `CHAPTER_GITHUB_TOKEN` constant, and SHALL treat a 204 as accepted. Failed dispatches SHALL retry three times with backoff, then set `needs_attention` and show an admin notice. The token SHALL live only in `wp-config.php`.

#### Scenario: Dispatch accepted by GitHub
- **WHEN** a correctly authenticated dispatch is sent
- **THEN** GitHub responds 204 and build state becomes `requested` with the request id

#### Scenario: GitHub unreachable
- **WHEN** the API is unreachable for all retries
- **THEN** build state becomes `needs_attention` with the last error and an admin notice appears

### Requirement: Signed webhook transport
With `webhook`, WordPress SHALL `POST` the JSON payload to `CHAPTER_REBUILD_WEBHOOK_URL` with headers `X-Chapter-Timestamp` and `X-Chapter-Signature: sha256=<HMAC-SHA256(CHAPTER_REBUILD_SECRET, timestamp + "." + body)>`, and SHALL expect `202 { buildId, status }` with `status` ∈ `queued | in_progress | coalesced`. Receivers SHALL reject bad signatures and timestamps outside ±5 minutes. Retries and failure handling SHALL match the GitHub transport.

#### Scenario: Valid dispatch accepted
- **WHEN** a correctly signed request arrives within the window
- **THEN** the receiver starts (or coalesces into) a build and returns 202 with a build id

#### Scenario: Tampered request rejected
- **WHEN** the body is altered after signing or the timestamp is stale
- **THEN** the receiver returns 401 and starts nothing

### Requirement: Build state is recorded and visible
WordPress SHALL persist `chapter_build_state` (`requestedVersion`, `liveVersion`, `liveBuildId`, `status`, `lastError`, `updatedAt`) and expose it on the Site build panel and via `wp chapter build-status`.

#### Scenario: Panel reflects state
- **WHEN** an admin opens the Site build panel
- **THEN** it shows the live build id/version, the requested version, status, last error, and timestamp

### Requirement: Rebuild workflow
The repository SHALL ship `.github/workflows/rebuild-site.yml` triggered by `repository_dispatch` (`rebuild-site`), `workflow_dispatch`, and pushes to `main` touching `site/`, using `concurrency: rebuild-site` without cancel-in-progress so concurrent requests coalesce into one queued run. It SHALL run `nuxt generate` on Node 22 with `NUXT_PUBLIC_WP_API_BASE` and `CHAPTER_CONTENT_VERSION`, then deploy according to `STATIC_DEPLOY_TARGET`: `s3` (OIDC credentials, `aws s3 sync` with `public, max-age=31536000, immutable` for `/_nuxt/**` and `public, max-age=60` otherwise, `shell-manifest.json` uploaded last, CloudFront invalidation of payload/manifest/build-meta paths when a distribution id is set), `rsync` (SSH into the host, sync into `CHAPTER_STATIC_DIR`, manifest last), or `artifact` (upload only). It MAY post a signed `POST /build-status` callback when the secret is configured.

#### Scenario: Coalesced runs
- **WHEN** three dispatches arrive while a run is in progress
- **THEN** one additional run is queued and executes after the current one

#### Scenario: Manifest published last
- **WHEN** a run deploys
- **THEN** every asset the manifest references exists at the target before the manifest itself is written

### Requirement: Completion detection and cache purge
WordPress SHALL detect a completed build by observing a new `buildId` in `shell-manifest.json` (primary) and MAY additionally accept a signed `POST /progressnow/v1/build-status` callback (same signature scheme, idempotent by build id) carrying `succeeded | failed` with an error message. On success it SHALL update `liveBuildId`/`liveVersion`, purge the page cache and manifest transient; on failure it SHALL record the error and notify admins.

#### Scenario: Success observed via manifest
- **WHEN** the manifest's `buildId` changes
- **THEN** `chapter_build_state` reflects the new live build and the page cache is purged

#### Scenario: Failure callback
- **WHEN** a signed `failed` callback arrives
- **THEN** state becomes `failed` with the message and admins see a notice; an unsigned callback is rejected with 401

### Requirement: No process execution on the WordPress host
The theme SHALL trigger rebuilds only through outbound HTTPS and SHALL NOT call `exec`, `shell_exec`, `system`, `passthru`, `proc_open`, or `popen`. Node SHALL run only inside the workflow runner (or the operator's receiver).

#### Scenario: Static check
- **WHEN** the theme's PHP is scanned for process-execution functions
- **THEN** none are found

### Requirement: Reference infrastructure and guide
The repository SHALL ship `infra/terraform/` (S3 bucket with OAC, optional CloudFront distribution with the static path behaviors and the WordPress origin, a GitHub OIDC role scoped to the bucket/distribution, outputs matching the workflow variables) that passes `terraform validate`, and `docs/deployment.md` covering both transports, both static-serving modes, variables/secrets, `wp-config.php` constants, cron, the first build, and rollback. Nothing SHALL be provisioned by this change and no secret SHALL be committed.

#### Scenario: Operator follows the guide
- **WHEN** the operator applies the module and sets the documented variables and constants
- **THEN** a content save produces a new live build without any further code change

#### Scenario: No secrets in the repo
- **WHEN** the repository is scanned
- **THEN** no token, key, or secret value is present — only names of variables and secrets
