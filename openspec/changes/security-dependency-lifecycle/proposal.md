## Why

Commercial and open plugins are vendored directly into git — ACF Pro 6.8.5, Polylang Pro 3.8.5, Wordfence 8.2.2, Wordfence Login Security 1.1.16, WP Super Cache 3.1.1, Duplicator 1.5.16.1 — with no dependency-management or update mechanism. Vendored plugins do not auto-update, so security patches require someone to remember to re-vendor a ZIP by hand. Stale plugins are the single largest cause of WordPress compromise. There is no `composer audit`/`npm audit`, no WPScan/vulnerability feed, no defined patch SLA, and committed commercial plugin code risks license exposure. This is a program-level control that protects every other layer.

## What Changes

- Manage plugins and WordPress core as declared, versioned dependencies (Composer via wpackagist for open plugins/core; licensed private endpoints or a documented controlled-vendor process for ACF Pro / Polylang Pro).
- Stop committing plugin/core binaries where feasible; where a plugin must be vendored (licensed), pin its version and track it against a vulnerability feed.
- Add automated update PRs (Renovate or Dependabot) for PHP (Composer), JS (npm), and GitHub Actions.
- Add `composer audit` + `npm audit` (and a WordPress vulnerability check, e.g. WPScan/patchstack feed) as CI gates.
- Define and document a **patch SLA**: critical vulns patched within N days, with an owner and an escalation path.

## Capabilities

### New Capabilities
- `dependency-lifecycle`: How plugins, themes-deps, and core are declared, updated, audited, and patched on a defined SLA.

### Modified Capabilities
<!-- None. -->

## Impact

- **Repo:** `wp-content/themes/progressnow/composer.json` (already Composer-based for theme libs) extended, or a root-level Composer/`bedrock`-style manifest for plugins/core; `.gitignore` for vendored plugin dirs where moved to managed installs.
- **CI:** new audit jobs in `.github/workflows/ci.yml`; Renovate/Dependabot config.
- **Ops:** patch-SLA runbook + ownership; licensed-plugin acquisition process for ACF/Polylang.
- **Interacts with** the Duplicator removal and the CI-gates changes.
