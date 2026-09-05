## Why

Two defense-in-depth gaps remain. (1) The site sends no HTTP security headers — no Content-Security-Policy, HSTS, `X-Content-Type-Options`, frame protection, `Referrer-Policy`, or `Permissions-Policy`. Given the Vue islands render editor HTML via `v-html`, a CSP is the highest-value backstop against any XSS that slips past server-side sanitization. (2) CI runs lint/test/build but has no security gates — no static analysis for insecure PHP patterns, no secret scanning, and no guard against committing archives/dumps. Adding these makes the whole remediation program self-enforcing so fixes don't regress.

## What Changes

- Add HTTP security response headers to all front-end responses: `Content-Security-Policy` (tuned for the islands; rolled out report-only first), `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy`, `Permissions-Policy`.
- Establish a CSP strategy for the island bootstrap (nonce or hash for any inline script/JSON), and a report endpoint/sink for violations during rollout.
- Add CI security gates: PHP static analysis with a WordPress-security ruleset (PHPCS `WordPress-Extra`/security sniffs or Psalm/PHPStan taint), secret scanning (gitleaks), and a repo guard for archives/dumps (shared with the Duplicator change).
- Add branch protection requiring the security jobs to pass.

## Capabilities

### New Capabilities
- `http-security-headers`: A consistent, tested set of security response headers with a workable CSP for the Vue islands.
- `ci-security-gates`: Automated SAST, secret scanning, and artifact guards enforced on every PR.

### Modified Capabilities
<!-- None. -->

## Impact

- **Code:** header emission via theme/mu-plugin (`send_headers`) or server/edge config; CSP nonce wiring into the island bootstrap in `src/`/`inc`.
- **CI:** new jobs in `.github/workflows/ci.yml`; gitleaks + PHPCS/Psalm config; branch-protection settings.
- **Coordinates with** the URL-sink XSS fix (CSP is the backstop), the Duplicator artifact guard, and dependency-lifecycle audits.
