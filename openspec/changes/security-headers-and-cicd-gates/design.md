## Context

Front-end responses carry no security headers today (verified: no `send_headers`/CSP code in the theme). The app uses Vue islands hydrated from `wp_json_encode`d context and renders kses'd editor HTML via `v-html` — so a strict CSP is both valuable and slightly tricky (inline bootstrap data + Vite-built bundles). CI (`.github/workflows/ci.yml`) runs npm lint/test/build and PHPUnit, but nothing inspects for insecure code, secrets, or artifacts.

## Goals / Non-Goals

**Goals:**
- Every front-end response carries a coherent, tested security-header set.
- A CSP that permits the real app (Vite bundles, island JSON) while blocking inline/injected script — deployed report-only, then enforcing.
- PRs are gated on SAST, secret scanning, and artifact guards.

**Non-Goals:**
- A maximally-strict CSP on day one (report-only rollout first to avoid breaking the site).
- Admin/editor screens CSP (focus on public front-end; wp-admin has its own needs).

## Decisions

- **Emit headers at the app edge via `send_headers`** (mu-plugin/theme) so they live in the repo and apply regardless of host, with the option to move to server/CDN config later. Rationale: reviewable, portable; server-level is an optimization.
- **CSP nonce strategy:** generate a per-request nonce, attach it to the island bootstrap `<script>`/JSON and to enqueued scripts (`wp_scripts` `nonce` attr), and use `script-src 'self' 'nonce-…'`. Avoid `unsafe-inline`. Rationale: works with Vite output and the hydration payload without opening inline injection. Alternative (hashes) is brittle with dynamic JSON.
- **Report-only first:** ship `Content-Security-Policy-Report-Only` with a report sink, watch violations for a release cycle, then flip to enforcing. Rationale: the islands + third-party embeds (maps, video) need real-world tuning.
- **SAST:** PHPCS with `WordPress` + security sniffs (escaping/nonce/sanitization) as the baseline gate; optionally Psalm/PHPStan taint analysis for the theme. Rationale: cheap, WP-idiomatic, catches the exact classes found in this audit.
- **Secret scanning:** gitleaks in CI + (recommended) as a pre-commit hook. **Artifact guard** reuses the Duplicator change's deny-list script.
- **Branch protection:** require security jobs green before merge to `main`.

## Risks / Trade-offs

- [CSP breaks embeds (video/maps/fonts)] → Report-only rollout + explicit allow-list per embed origin; the block library (`video`, `event-embed`) enumerates the needed hosts.
- [Nonce plumbing touches the island bootstrap] → Contained change in the enqueue/bootstrap path; covered by a smoke test that the page hydrates.
- [PHPCS noise on vendored plugin code] → Scope sniffs to `wp-content/themes/progressnow` (custom code only).
- [HSTS is a commitment] → Start with a modest `max-age`, ramp up, add preload only when confident.

## Migration Plan

1. Add the static headers (`nosniff`, frame, referrer, permissions, HSTS) — low risk.
2. Add CSP **report-only** + nonce wiring; collect violations on staging then prod.
3. Tune allow-list; flip CSP to enforcing.
4. Add SAST + gitleaks + artifact-guard jobs; fix findings; enable branch protection.

## Open Questions

- Are headers better owned at the CDN/edge than the app? (Recommend app-level now, edge later — keep it in the repo either way.)
- Which third-party origins must the CSP allow (video providers, maps, fonts, analytics)? Enumerate from the block library before enforcing.
