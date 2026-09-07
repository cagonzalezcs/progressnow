## ADDED Requirements

### Requirement: Signed request verification
`POST /api/rebuild` SHALL accept only requests carrying `X-Chapter-Timestamp` (9–11 digit Unix seconds within ±300 s of server time) and `X-Chapter-Signature` (`sha256=` + lowercase hex HMAC-SHA256 of `"<timestamp>.<raw body>"` with `CHAPTER_REBUILD_SECRET`), compared in constant time. Missing or invalid headers SHALL answer 401 with no cache side effects. The scheme SHALL be byte-compatible with the theme's `progressnow_rebuild_sign()` / `progressnow_rebuild_verify()`.

#### Scenario: Valid signature
- **WHEN** WordPress posts a rebuild payload signed with the shared secret
- **THEN** the receiver answers 202

#### Scenario: Stale timestamp
- **WHEN** the timestamp is 301 s old and the signature is otherwise valid
- **THEN** the receiver answers 401 and invalidates nothing

#### Scenario: Wrong secret
- **WHEN** the signature was produced with a different secret
- **THEN** the receiver answers 401 and invalidates nothing

### Requirement: Payload and response contract
The receiver SHALL accept the dispatcher payload `{ event: "rebuild", requestId, contentVersion, reason, siteUrl, requestedAt }`, reject bodies over 16 KB with 413 and malformed JSON or a missing `event` with 400, and on acceptance answer `202 { buildId: <uuid>, status: "started" }` — the shape `progressnow_rebuild_send_webhook()` requires.

#### Scenario: Accepted payload
- **WHEN** a valid signed payload is posted
- **THEN** the response is 202 JSON with a UUID `buildId` and `status: "started"`

#### Scenario: Oversized body
- **WHEN** the body exceeds 16 KB
- **THEN** the receiver answers 413 before verifying the signature

### Requirement: Cache invalidation on acceptance
On acceptance the receiver SHALL invalidate the `content`, `routes`, and `site` cache tags so the next request for any route, the manifest, and the chrome reflects current WordPress content.

#### Scenario: Content refreshed
- **WHEN** a post title changes in WordPress and the receiver accepts the dispatched webhook
- **THEN** the next request for that post renders the new title

### Requirement: Replay rejection
A repeated `(timestamp, signature)` pair within the validity window SHALL be rejected with 401; cache invalidation SHALL be idempotent so a replay that reaches a different instance has no harmful effect.

#### Scenario: Replayed request
- **WHEN** the same signed request is posted twice to one instance
- **THEN** the second answer is 401 and the first invalidation is not repeated

### Requirement: Optional status callback
When `WP_BUILD_STATUS_URL` is configured, the receiver SHALL, after invalidating, post `{ buildId, status: "succeeded", contentVersion }` to it signed with the same scheme; callback failures SHALL be logged and SHALL NOT change the 202 already returned to WordPress.

#### Scenario: Callback marks live
- **WHEN** the receiver accepts a webhook and the callback URL is set
- **THEN** WordPress receives a signed `/build-status` request with the payload's `contentVersion` and marks the build live

#### Scenario: Callback unreachable
- **WHEN** the callback request fails
- **THEN** the failure is logged with the `requestId` and no retry storm occurs (at most 3 attempts with backoff)

### Requirement: Health endpoint
`GET /api/health` SHALL answer `200 { ok: true, buildId }` without contacting WordPress, for load balancers and the deployment guide's smoke test.

#### Scenario: Health without upstream
- **WHEN** `/api/health` is requested while WordPress is down
- **THEN** the response is 200 and `ok` is true

### Requirement: Failure isolation and logging
Bad input SHALL never produce a 5xx; every rejection and acceptance SHALL be logged as a structured line including `requestId` (when present), outcome, and reason, without logging the secret or the signature.

#### Scenario: Structured rejection log
- **WHEN** a request is rejected for a bad signature
- **THEN** one log line records `outcome=rejected reason=signature` and no secret material

### Requirement: Test vectors from the PHP scheme
Unit tests SHALL include signing vectors reproduced from the PHP implementation (`hash_hmac('sha256', ts . '.' . body, secret)`) so a divergence on either side fails before deployment.

#### Scenario: Cross-implementation vector
- **WHEN** the PHP vector's timestamp, body, and secret are signed by the receiver's helper
- **THEN** the hex digest equals the vector's signature
