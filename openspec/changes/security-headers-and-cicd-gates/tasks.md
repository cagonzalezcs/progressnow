## 1. Static security headers

- [ ] 1.1 Emit `X-Content-Type-Options`, frame protection, `Referrer-Policy`, `Permissions-Policy` via `send_headers`
- [ ] 1.2 Add `Strict-Transport-Security` (modest max-age first)
- [ ] 1.3 Smoke-test headers present on front-end responses

## 2. CSP

- [ ] 2.1 Enumerate required embed origins from the block library (video, event-embed, maps, fonts)
- [ ] 2.2 Add per-request nonce; wire it into the island bootstrap + enqueued scripts
- [ ] 2.3 Ship `Content-Security-Policy-Report-Only` with a violation sink
- [ ] 2.4 Tune allow-list from collected reports; flip to enforcing `Content-Security-Policy`
- [ ] 2.5 Verify islands hydrate and embeds work under the enforced policy

## 3. CI security gates

- [ ] 3.1 Add PHPCS (WordPress + security sniffs) over `wp-content/themes/progressnow`; fix findings
- [ ] 3.2 (Optional) Add Psalm/PHPStan taint analysis for the theme
- [ ] 3.3 Add gitleaks secret scanning to CI (+ pre-commit hook)
- [ ] 3.4 Wire the archive/dump artifact guard (shared with Duplicator change)

## 4. Enforcement

- [ ] 4.1 Enable branch protection requiring SAST + secret-scan + artifact-guard green
- [ ] 4.2 Document the security-gate policy for contributors
