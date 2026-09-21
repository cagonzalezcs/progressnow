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


## Implementation notes

What changed between this design and what landed (2026-09-21):

- **The premise moved.** By the time this was applied, `open-source-release-readiness` had already taken plugins and core out of git ("adopter-installed, never vendored"). So this change adds the *pins* and the tooling around them, not a removal. Versions had also moved on from the proposal's list (ACF Pro 6.8.10, Polylang Pro 3.8.9, Wordfence 9.0.1, WP Super Cache 3.1.3, core 7.1.1).
- **Root manifest, layout unchanged.** A root `composer.json` manages plugins into `wp-content/plugins/`. `roots/wordpress-core-installer` refuses the project root as an install directory, so core is pinned in the same lock, downloaded to a git-ignored `.wp-core/` as the reference copy, and applied in place with `wp core update --version`. Bedrock-style layout stays deferred.
- **ACF Pro: authenticated endpoint. Polylang Pro: controlled-vendor** — Polylang has no Composer repository. Its pin lives in `dependency-pins.json` rather than `composer.json` `extra`, because `extra` is part of the lock's content hash and neither a person nor Renovate's regex manager should have to re-lock to move it. Renovate tracks the free `polylang` release (same version numbers) as the update signal.
- **No CI secret for ACF.** The ACF repository's metadata is public: locking, `composer validate` and `composer audit --locked` need no key. Only a real install does, and no CI job installs plugins yet (`deploy-pipeline` is a stub). The key path (`auth.json` / `COMPOSER_AUTH`) is documented for hosts and a future deploy job.
- **Wordfence Login Security retired.** The standalone plugin was closed on wordpress.org on 2026-08-17 and is not on wpackagist; Wordfence bundles the same module. It joins Duplicator on the must-not-install list, and `verify-pins.mjs` fails on any installed plugin that is not pinned.
- **Vulnerability feed: Wordfence Intelligence v3**, not WPScan/Patchstack. All three now require an API key; Wordfence's is free for commercial use, carries CVSS ratings, and the site already runs Wordfence. Without the secret the job warns and passes, so forks are not red by default. Findings can be accepted until a date (`dependency-pins.json` `vuln-accepted`) — needed because the feed includes unpatched records.
- **Audits in their own workflow** (`dependency-audit.yml`) rather than `ci.yml`, so they can also run on a daily schedule. `npm audit` gates the full tree at high+ (owner's choice over the `--production` mitigation above): the build tooling produces what ships. `composer audit` fails on any advisory; abandoned packages are reported, not failed.
- **Patch SLA split in two.** An MIT-licensed kit does not owe its users an SLA; a deployed site's operator does. The runbook keeps the design's windows (7 / 30 days) as the default for deployed sites with adopter-assigned owners, and records the kit maintainer's monthly review as a best-effort maintenance target.
- **Parity was verified locally**, not on staging — no host is reachable yet.
