## Context

The theme already uses Composer (`timber/timber`, `kucrut/vite-for-wp`) and npm with a CI pipeline (lint/test/build + PHPUnit). Plugins and (on disk) core are NOT managed by any tool — they are copied in. Two plugins are commercial (ACF Pro, Polylang Pro) and cannot come from public wpackagist; the rest (Wordfence, WP Super Cache) and WordPress core can. No vulnerability scanning exists.

## Goals / Non-Goals

**Goals:**
- Every plugin + core has a declared, pinned version and a routine, low-friction update path.
- Known-vulnerable dependencies fail CI; humans get an update PR without manual ZIP wrangling.
- A written patch SLA with an accountable owner.

**Non-Goals:**
- Migrating the whole site to Bedrock in one step (can be a later evolution).
- Removing Wordfence (it stays as runtime WAF/scanner; this change governs *updating* it).

## Decisions

- **Composer-manage what can be:** open plugins + core via `wpackagist.org` (already a declared repo) and `roots/wordpress`/`johnpbloch/wordpress`. Rationale: reuses existing tooling; pins versions in `composer.lock`.
- **Controlled-vendor for licensed plugins:** ACF Pro and Polylang Pro via their authenticated Composer endpoints if licensing allows (`connect.advancedcustomfields.com`, Polylang's endpoint) with the license key injected from CI secrets — never committed. If licensing forbids, keep a *pinned, documented* vendored copy plus a manual monthly version check tracked in the SLA. Rationale: keeps license keys out of git while still enabling updates.
- **Renovate over Dependabot** for grouped, scheduled PRs across Composer + npm + Actions in one config (Dependabot also acceptable). Rationale: grouping and custom schedules reduce PR noise.
- **Audit gates:** `composer audit` + `npm audit --audit-level=high` fail the build; a scheduled job queries a WordPress vuln feed (WPScan API / Patchstack) for the pinned plugin versions. Rationale: catches vulns disclosed after a version was pinned.
- **Patch SLA:** Critical/High within 7 days, Medium within 30, tracked in the ops runbook with a named owner and a break-glass emergency-patch path.

## Risks / Trade-offs

- [Licensed-plugin Composer endpoints need a key in CI] → Store as encrypted Actions secret; scope to a machine account; never echo it.
- [`npm audit` noise from transitive dev deps] → Gate on `--production` / `--audit-level=high`; triage advisories, don't auto-fail on low.
- [Composer-managing core changes deploy layout] → Pilot on staging; the deploy-pipeline change coordinates docroot layout.

## Migration Plan

1. Introduce Composer management for core + open plugins on a branch; verify parity on staging.
2. Resolve licensed-plugin strategy (authenticated endpoint vs pinned-vendor) and wire secrets.
3. Add audit jobs + Renovate; let the first update PRs land.
4. Publish the patch-SLA runbook and assign the owner.

## Open Questions

- Do the ACF Pro / Polylang Pro licenses permit authenticated Composer installs in CI, or must they stay vendored-and-pinned?
- Adopt Bedrock-style layout now or keep the current docroot and only manage dependencies? (Recommend: manage deps first, defer layout.)
