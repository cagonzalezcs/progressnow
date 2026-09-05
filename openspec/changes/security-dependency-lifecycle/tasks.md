## 1. Dependency inventory & strategy

- [ ] 1.1 Inventory all plugins + core with current versions and source (open vs licensed)
- [ ] 1.2 Confirm ACF Pro / Polylang Pro licensing terms for authenticated Composer installs
- [ ] 1.3 Decide per-dependency: managed install vs pinned controlled-vendor

## 2. Manage open dependencies

- [ ] 2.1 Add Composer management for WP core + open plugins (wpackagist / johnpbloch)
- [ ] 2.2 Pin versions in `composer.lock`; verify parity on staging
- [ ] 2.3 Remove now-managed plugin binaries from git where applicable; update `.gitignore`

## 3. Licensed dependencies

- [ ] 3.1 Wire ACF/Polylang authenticated endpoints with keys from CI secrets (or document pinned-vendor process)
- [ ] 3.2 Verify no license key is committed anywhere

## 4. Automation & audit gates

- [ ] 4.1 Add Renovate (or Dependabot) config for Composer + npm + Actions
- [ ] 4.2 Add `composer audit` + `npm audit --audit-level=high` jobs to CI
- [ ] 4.3 Add a scheduled WordPress vuln-feed check (WPScan/Patchstack) for pinned plugin versions
- [ ] 4.4 Verify a planted vulnerable dep fails CI

## 5. Patch SLA

- [ ] 5.1 Write the patch-SLA runbook (severity windows, owner, escalation, emergency path)
- [ ] 5.2 Assign the accountable owner and record first review date
