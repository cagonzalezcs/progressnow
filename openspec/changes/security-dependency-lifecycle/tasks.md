## 1. Dependency inventory & strategy

- [x] 1.1 Inventory all plugins + core with current versions and source (open vs licensed) — `docs/dependency-lifecycle.md` §1 (core 7.1.1, ACF Pro 6.8.10, Polylang Pro 3.8.9, Wordfence 9.0.1, WP Super Cache 3.1.3; Duplicator and the closed-upstream Wordfence Login Security are "must not be installed")
- [x] 1.2 Confirm ACF Pro / Polylang Pro licensing terms for authenticated Composer installs — ACF: official repository, HTTP basic with the site key; Polylang: no Composer endpoint
- [x] 1.3 Decide per-dependency: managed install vs pinned controlled-vendor — Composer for core/Wordfence/WP Super Cache/ACF Pro, controlled-vendor for Polylang Pro

## 2. Manage open dependencies

- [x] 2.1 Add Composer management for WP core + open plugins (wpackagist / johnpbloch) — root `composer.json` (`roots/wordpress`, wpackagist); core is pinned there and applied with WP-CLI because the docroot layout is unchanged
- [x] 2.2 Pin versions in `composer.lock`; verify parity on staging — no staging host exists yet; verified locally instead: a scratch `composer install` of the lock is byte-identical to the on-disk Wordfence, WP Super Cache and core, and `scripts/deps/verify-pins.mjs` passes for all five pins on the local docroot (it flags Duplicator and Wordfence Login Security as undeclared). Re-run `verify-pins.mjs --docroot` on staging/production when a host is reachable
- [x] 2.3 Remove now-managed plugin binaries from git where applicable; update `.gitignore` — binaries already left the tree (`open-source-release-readiness`); `.gitignore` gains the root `vendor/`, `.wp-core/`, `auth.json`

## 3. Licensed dependencies

- [x] 3.1 Wire ACF/Polylang authenticated endpoints with keys from CI secrets (or document pinned-vendor process) — ACF repository in the root manifest, key via `auth.json` / `COMPOSER_AUTH` (no CI job installs plugins, so no CI secret exists to wire; lock, validate and audit run keyless); Polylang controlled-vendor process in `docs/dependency-lifecycle.md` §4
- [x] 3.2 Verify no license key is committed anywhere — tracked files and full history scanned (gitleaks with the new `acf-pro-license-key` rule, pickaxe for key/define patterns): none; `artifact-guard` now fails on a tracked `auth.json`

## 4. Automation & audit gates

- [x] 4.1 Add Renovate (or Dependabot) config for Composer + npm + Actions — `.github/renovate.json5`, validated with `renovate-config-validator --strict`. Owner step: install the Renovate GitHub App
- [x] 4.2 Add `composer audit` + `npm audit --audit-level=high` jobs to CI — `.github/workflows/dependency-audit.yml` (`composer-audit`, `npm-audit`); the theme lock was re-resolved so the gate starts green (8 advisories, 4 high)
- [x] 4.3 Add a scheduled WordPress vuln-feed check (WPScan/Patchstack) for pinned plugin versions — `wp-vuln-feed` job + `scripts/deps/check-vuln-feed.mjs` against Wordfence Intelligence v3 (owner's choice; every feed now needs a key). Owner step: Actions secret `WORDFENCE_INTEL_API_KEY`
- [x] 4.4 Verify a planted vulnerable dep fails CI — run locally with the exact job commands: `lodash` 4.17.15 → `npm audit` exit 1, `guzzlehttp/guzzle` 7.4.0 → `composer audit` exit 1, a feed record covering the Wordfence pin → `check-vuln-feed` exit 1 with annotation and report; matcher cases are permanent tests

## 5. Patch SLA

- [x] 5.1 Write the patch-SLA runbook (severity windows, owner, escalation, emergency path) — `docs/dependency-lifecycle.md` §8
- [x] 5.2 Assign the accountable owner and record first review date — kit: @cagonzalezcs (best-effort maintenance target, not a warranty), first review 2026-10-19; deployed sites: adopter-assigned rows in the same table
