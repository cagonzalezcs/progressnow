## 1. Untrack legacy code, plugins, and artifacts

- [ ] 1.1 Add `.gitignore` rules: `/wp-content/plugins/`, `/wp-content/themes/rgvdsatheme/`, `/wp-content/backups-dup-lite/`, `*.zip`, `*.tar`, `*.tgz`, `*.sql`, `*.sql.gz`, `**/dup-installer/`, `**/installer*.php`, `**/.phpunit.result.cache`, `**/wordpress/` (WorDBless install dirs)
- [ ] 1.2 `git rm -r --cached wp-content/themes/rgvdsatheme wp-content/plugins wp-content/backups-dup-lite` in a single dedicated commit; confirm `git ls-files wp-content` lists only `wp-content/themes/progressnow/**`
- [ ] 1.3 Grep theme, site, workflows, docs for references to `rgvdsatheme`, `duplicator`, `backups-dup-lite`; remove or reword

## 2. Licence, metadata, and community files

- [ ] 2.1 Add root `LICENSE` (GPL-2.0-or-later full text)
- [ ] 2.2 Declare the licence in `style.css` (`License:` + `License URI:`), theme `composer.json` (`license`, keep Timber starter attribution in `authors`), theme `package.json` (rename `vite-project` → `progressnow-theme`, add `license`), `site/package.json` (`license`)
- [ ] 2.3 Add root `README.md`: what the project is, architecture map (theme + `site/` + PHP shell), quick start for both trees, required plugins (ACF Pro, Polylang Pro + minimum versions + where to buy) and optional plugins, no-analytics statement, links to theme/site READMEs and `docs/`, acknowledgements (Timber, shadcn-vue)
- [ ] 2.4 Add `CONTRIBUTING.md` (dev setup both trees, OpenSpec workflow, three-copy rule until `single-source-shared-ui`, running the hygiene script locally), `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1, placeholder contact), `SECURITY.md` (GitHub private vulnerability reporting, supported versions)
- [ ] 2.5 Add `docs/open-source-release.md`: hygiene pass, fresh history at fork, initial tag, enable private vulnerability reporting, branch protection requiring CI

## 3. Required-plugin runtime notice

- [ ] 3.1 Add `inc/dependencies.php` (or equivalent) with an `admin_notices` check for ACF Pro and Polylang at the documented minimum versions; register from `functions.php`; theme must not fatal when either is missing
- [ ] 3.2 PHPUnit: notice rendered when a required plugin function/class is absent; no notice when both present

## 4. Identifier and PII scrub

- [ ] 4.1 Replace the `rgvdsa.test` default with `https://chapter.test:8890` in `site/nuxt.config.ts`, `site/.env.example`, `docs/deployment.md`; confirm the owner's gitignored `.env` still overrides
- [ ] 4.2 Remove the `LEGACY_STORAGE_KEY` migration from `site/app/composables/useA11ySettings.ts` and `wp-content/themes/progressnow/src/composables/useA11ySettings.ts`; update any test covering it; keep the drift test green
- [ ] 4.3 Delete `wp-content/themes/progressnow/bin/scrub-brand.sh`; remove its section from the theme README (owner archives a copy outside the repo if wanted)
- [ ] 4.4 Neutralize seed copy in `bin/seed.php` (EN + ES): messaging-platform channel → "members' group chat" / "el chat de miembros", "Member's garage (address in WhatsApp)" → "A member's home (address shared after RSVP)" / ES equivalent; scan the whole seed for any other platform, address, or person defaults
- [ ] 4.5 Update `tests/test-pages.php` expectations and regenerate `tests/fixtures/*.json` with `PROGRESSNOW_WRITE_FIXTURES=1 vendor/bin/phpunit --filter TestContracts`; mirror the copy changes into `src/lib/fixtures/index.ts` and `site/app/lib/fixtures/index.ts`
- [ ] 4.6 Scrub the OpenSpec archive and active changes: chapter/region names → "the original chapter"; leave literal identifiers that document a rename migration (e.g. `rgvdsa_*` in `2026-07-02-*` task text) only where they are the migration's own subject and mark them `hygiene-allow`
- [ ] 4.7 Re-run the theme brand audit (`vendor/bin/phpunit --filter BrandAudit`) and fix anything it flags

## 5. Hygiene script and CI gate

- [ ] 5.1 Create `.github/hygiene/tokens.json` (chapter-identifier tokens, messaging-platform tokens, analytics tokens, placeholder allowlist) and make `tests/test-brand-audit.php` read the chapter-identifier list from it
- [ ] 5.2 Create `.github/scripts/repo-hygiene.mjs`: path deny-list + content scan over `git ls-files` text files (skip lockfiles/binaries), inline `hygiene-allow` support, `path:line` output, non-zero exit on any hit
- [ ] 5.3 Add a root-level `hygiene` job to `.github/workflows/ci.yml` running the script on push + pull_request
- [ ] 5.4 Verify: plant a `.zip`, a `node_modules/` file, and a chapter token in a scratch branch → job fails naming each; remove → job passes

## 6. Retire superseded changes

- [ ] 6.1 Delete `openspec/changes/security-remove-duplicator-and-purge-artifacts/` (requirements absorbed by `repository-hygiene`; off-docroot backup runbook dropped with the prod-host deferral)
- [ ] 6.2 Edit `openspec/changes/security-dependency-lifecycle/proposal.md`: remove the "stop committing plugin binaries" bullet, point to `open-source-release-readiness`

## 7. Verification

- [ ] 7.1 Theme: `npm run lint`, `npm test`, `npm run build`, `composer test` green (pre-existing `test-shell.php:540` failure noted, owned by `shell-chrome-parity`)
- [ ] 7.2 Site: `npm run lint`, `npm run typecheck`, `npm test` (incl. drift test), `npm run generate:mock`, `npm run verify:output` green
- [ ] 7.3 Fresh-clone smoke on a temp dir: `git clone` → theme `composer install` + `npm ci` + `npm run build`; site `npm ci` + `npm run generate:mock`; repo hygiene script passes; `git ls-files | wc -l` recorded in the PR description
- [ ] 7.4 Update `wp-content/themes/progressnow/README.md` and `site/README.md` for the new root files, plugin policy, and neutral dev origin
