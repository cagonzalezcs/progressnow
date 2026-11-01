## 1. Untrack legacy code, plugins, and artifacts

- [x] 1.1 Add `.gitignore` rules: `/wp-content/plugins/`, `/wp-content/themes/legacytheme/`, `/wp-content/backups-dup-lite/`, `*.zip`, `*.tar`, `*.tgz`, `*.sql`, `*.sql.gz`, `**/dup-installer/`, `**/installer*.php`, `**/.phpunit.result.cache`, `**/wordpress/` (WorDBless install dirs) — done (November 1, 2026): every pattern is in the root `.gitignore` (plugins, backups-dup, installer, zip/tar/sql) or the theme `.gitignore` (`.phpunit.result.cache`, `wordpress/`); the guard that fails CI is `.github/scripts/artifact-guard.sh` (PR #22, PR #38)
- [x] 1.2 `git rm -r --cached wp-content/themes/legacytheme wp-content/plugins wp-content/backups-dup-lite` in a single dedicated commit; confirm `git ls-files wp-content` lists only `wp-content/themes/progressnow/**` — done (November 1, 2026): `git ls-files wp-content` lists only `wp-content/themes/progressnow/**`; plugins and backups were never tracked after the public fork
- [x] 1.3 Grep theme, site, workflows, docs for references to `legacytheme`, `duplicator`, `backups-dup-lite`; remove or reword — done (November 1, 2026): the only remaining mentions are the deny patterns in `.github/scripts/artifact-guard.sh`, the README gate description and `scripts/docs/paths-allowlist.txt`

## 2. Licence, metadata, and community files

- [x] 2.1 Add root `LICENSE` (MIT full text) — done: root `LICENSE` is the MIT text
- [ ] 2.2 Declare the licence in `style.css` (`License:` + `License URI:`), theme `composer.json` (`license`, keep Timber starter attribution in `authors`), theme `package.json` (rename `vite-project` → `progressnow-theme`, add `license`), `nuxt-js/package.json` (`license`) — partly done (November 1, 2026): `style.css`, theme `composer.json`, theme `package.json` (`progressnow-theme`) and `nuxt-js/package.json` declare MIT; remaining: `next-js/package.json` has no `license` field
- [x] 2.3 Add root `README.md`: what the project is, architecture map (theme + `nuxt-js/` + PHP shell), quick start for both trees, required plugins (ACF Pro, Polylang Pro + minimum versions + where to buy) and optional plugins, no-analytics statement, links to theme/site READMEs and `docs/`, acknowledgements (Timber, shadcn-vue) — done (PR #36): root `README.md` with architecture, frontends, requirements, plugins, documentation map, generated OpenSpec sections
- [ ] 2.4 Add `CONTRIBUTING.md` (dev setup both trees, OpenSpec workflow, three-copy rule until `single-source-shared-ui`, running the hygiene script locally), `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1, placeholder contact), `SECURITY.md` (GitHub private vulnerability reporting, supported versions)
- [ ] 2.5 Add `docs/open-source-release.md`: hygiene pass, fresh history at fork, initial tag, enable private vulnerability reporting, branch protection requiring CI

## 3. Required-plugin runtime notice

- [ ] 3.1 Add `inc/dependencies.php` (or equivalent) with an `admin_notices` check for ACF Pro and Polylang at the documented minimum versions; register from `functions.php`; theme must not fatal when either is missing
- [ ] 3.2 PHPUnit: notice rendered when a required plugin function/class is absent; no notice when both present

## 4. Identifier and PII scrub

- [ ] 4.1 Replace the `chapter.test` default with `https://chapter.test:8890` in `nuxt-js/nuxt.config.ts`, `nuxt-js/.env.example`, `docs/deployment.md`; confirm the owner's gitignored `.env` still overrides — partly done (November 1, 2026): `nuxt-js/nuxt.config.ts` and `docs/deployment.md` default to `https://chapter.test:8890`; `nuxt-js/.env.example` not yet checked
- [ ] 4.2 Remove the `LEGACY_STORAGE_KEY` migration from `nuxt-js/app/composables/useA11ySettings.ts` and `wp-content/themes/progressnow/src/composables/useA11ySettings.ts`; update any test covering it; keep the drift test green — partly done (November 1, 2026): gone from the theme and `nuxt-js`; `LEGACY_STORAGE_KEY` (`rgv-dsa-a11y`) still lives in `next-js/lib/a11y-settings.ts` and `next-js/lib/a11y-bootstrap.ts`
- [x] 4.3 Delete `wp-content/themes/progressnow/bin/scrub-brand.sh`; remove its section from the theme README (owner archives a copy outside the repo if wanted) — done: `bin/scrub-brand.sh` no longer exists and the theme README has no section for it
- [x] 4.4 Neutralize seed copy in `bin/seed.php` (EN + ES): messaging-platform channel → "members' group chat" / "el chat de miembros", "Member's garage (address in WhatsApp)" → "A member's home (address shared after RSVP)" / ES equivalent; scan the whole seed for any other platform, address, or person defaults — done (November 1, 2026): `bin/seed.php` carries no platform, address or person defaults (grep for whatsapp/garage is empty)
- [ ] 4.5 Update `tests/test-pages.php` expectations and regenerate `tests/fixtures/*.json` with `PROGRESSNOW_WRITE_FIXTURES=1 vendor/bin/phpunit --filter TestContracts`; mirror the copy changes into `src/lib/fixtures/index.ts` and `nuxt-js/app/lib/fixtures/index.ts`
- [ ] 4.6 Scrub the OpenSpec archive and active changes: chapter/region names → "the original chapter"; leave literal identifiers that document a rename migration (e.g. `legacy_*` in `2026-07-02-*` task text) only where they are the migration's own subject and mark them `hygiene-allow`
- [ ] 4.7 Re-run the theme brand audit (`vendor/bin/phpunit --filter BrandAudit`) and fix anything it flags

## 5. Hygiene script and CI gate

- [ ] 5.1 Create `.github/hygiene/tokens.json` (chapter-identifier tokens, messaging-platform tokens, analytics tokens, placeholder allowlist) and make `tests/test-brand-audit.php` read the chapter-identifier list from it
- [ ] 5.2 Create `.github/scripts/repo-hygiene.mjs`: path deny-list + content scan over `git ls-files` text files (skip lockfiles/binaries), inline `hygiene-allow` support, `path:line` output, non-zero exit on any hit
- [ ] 5.3 Add a root-level `hygiene` job to `.github/workflows/ci.yml` running the script on push + pull_request
- [ ] 5.4 Verify: plant a `.zip`, a `node_modules/` file, and a chapter token in a scratch branch → job fails naming each; remove → job passes

## 6. Retire superseded changes

- [x] 6.1 Delete `openspec/changes/security-remove-duplicator-and-purge-artifacts/` (requirements absorbed by `repository-hygiene`; off-docroot backup runbook dropped with the prod-host deferral) — done (November 1, 2026) as an archive instead of a delete: the change landed its artifact purge and CI guard (PR #22, PR #38), so it was archived with its `backup-artifact-hygiene` spec merged; its backup runbook tasks moved to `ops-backup-and-disaster-recovery`
- [ ] 6.2 Edit `openspec/changes/security-dependency-lifecycle/proposal.md`: remove the "stop committing plugin binaries" bullet, point to `open-source-release-readiness`

## 7. Verification

- [ ] 7.1 Theme: `npm run lint`, `npm test`, `npm run build`, `composer test` green (pre-existing `test-shell.php:540` failure noted, owned by `shell-chrome-parity`)
- [ ] 7.2 Site: `npm run lint`, `npm run typecheck`, `npm test` (incl. drift test), `npm run generate:mock`, `npm run verify:output` green
- [ ] 7.3 Fresh-clone smoke on a temp dir: `git clone` → theme `composer install` + `npm ci` + `npm run build`; site `npm ci` + `npm run generate:mock`; repo hygiene script passes; `git ls-files | wc -l` recorded in the PR description
- [ ] 7.4 Update `wp-content/themes/progressnow/README.md` and `nuxt-js/README.md` for the new root files, plugin policy, and neutral dev origin
