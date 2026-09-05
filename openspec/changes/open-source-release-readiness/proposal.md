## Why

The project is going to be open-sourced as a chapter-neutral organizing-site kit that anyone can adopt, with a public GitHub Pages demo. Today the repository cannot be published: the retired `rgvdsatheme` is still tracked (25,381 files, mostly `node_modules`/`vendor`/a WorDBless WordPress copy), six plugins are vendored (3,324 files, including the commercially licensed ACF Pro and Polylang Pro), there is no LICENSE anywhere, and chapter identifiers and personal-data-shaped defaults survive in live code (`rgvdsa.test` dev origin, the `rgv-dsa-a11y` storage key, the original chapter's copy embedded in `bin/scrub-brand.sh`, WhatsApp/garage defaults in the seed and fixtures, chapter names throughout the OpenSpec archive). Fixing this first shrinks the repo, speeds CI, and makes every later change publishable by default.

## What Changes

- **BREAKING (repo layout):** untrack and ignore `wp-content/themes/rgvdsatheme/`, all of `wp-content/plugins/`, and `wp-content/backups-dup-lite/`. Plugins are never vendored again; the public repo ships only the theme, the Nuxt site, docs, infra reference, workflows, and OpenSpec.
- **Declared dependencies:** ACF Pro and Polylang Pro are documented as required, licence-bearing plugins the adopter installs themselves (minimum versions recorded); Wordfence and WP Super Cache become optional recommendations; Duplicator is dropped. The theme shows an admin notice when a required plugin is inactive.
- **Licensing + community files:** root `LICENSE` (GPL-2.0-or-later) and matching `license` fields in `style.css`, `composer.json`, and both `package.json`; root `README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`; theme `package.json` renamed from `vite-project`.
- **Identifier + PII scrub:** neutral dev origin (`chapter.test`) in `nuxt.config.ts`, `site/.env.example`, `docs/deployment.md`; drop the `rgv-dsa-a11y` legacy-key migration in both `useA11ySettings.ts` copies; delete `bin/scrub-brand.sh` (the one-time migration has run; it embeds the original chapter's copy); replace messaging-platform and private-address defaults in `bin/seed.php` (EN + ES), `tests/fixtures/*.json`, `tests/test-pages.php`, and both `lib/fixtures/index.ts`; rewrite chapter names in the OpenSpec archive to neutral wording.
- **No-analytics policy:** the theme and site SHALL ship no analytics, tag-manager, pixel, or session-recording code; the only client storage is the visitor's own accessibility preferences. Enforced by the hygiene script.
- **CI hygiene gate:** a root-level `hygiene` job in `ci.yml` running one script that fails on (a) tracked archives, installers, dumps, logs, `node_modules`/`vendor`, plugin or legacy-theme paths and (b) chapter identifiers, e-mail/phone patterns outside an allowlist, messaging-platform names, and analytics tokens anywhere in tracked text files. The theme's existing `tests/test-brand-audit.php` shares the same token list.
- **Public-fork release checklist** (`docs/open-source-release.md`): hygiene pass, fresh git history at fork, version tag, GitHub security advisories + branch protection. Documented here, executed at fork time.
- **Supersedes** `security-remove-duplicator-and-purge-artifacts` (plugin removal, backup dir purge, artifact guard all land here; the off-docroot backup runbook is dropped with the prod-host deferral) and the "stop committing plugin binaries" bullet of `security-dependency-lifecycle` (which keeps audits, Renovate, and the patch SLA).

## Capabilities

### New Capabilities
- `open-source-distribution`: what the public repository is and declares — licence and community files, required vs optional plugins installed by the adopter, the no-analytics policy, and the release checklist for the public fork.
- `repository-hygiene`: what may be tracked (no dependencies, build output, legacy code, archives, dumps, logs, plugins) and what shipped text may contain (no chapter identifiers, personal data, messaging-platform defaults, or analytics tokens), enforced by a CI gate shared with the theme's brand-audit test.

### Modified Capabilities
- none (the `chapter-neutral-branding` requirements introduced by `nuxt4-static-platform` are extended by `repository-hygiene`, not changed).

## Impact

- **Repo:** `git rm --cached` of ~28,700 files; `.gitignore` gains plugin/legacy/artifact rules; new root files `LICENSE`, `README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `docs/open-source-release.md`; `bin/scrub-brand.sh` deleted.
- **Theme:** `style.css` header, `composer.json`, `package.json`, `README.md`; `inc/` admin notice for missing required plugins; `bin/seed.php`, `tests/fixtures/*.json`, `tests/test-pages.php`, `tests/test-brand-audit.php`, `src/lib/fixtures/index.ts`, `src/composables/useA11ySettings.ts`.
- **Site:** `nuxt.config.ts`, `.env.example`, `package.json`, `app/lib/fixtures/index.ts`, `app/composables/useA11ySettings.ts`, `README.md`.
- **CI:** `.github/workflows/ci.yml` new `hygiene` job + `.github/scripts/repo-hygiene.mjs`.
- **OpenSpec:** archive text rewritten; `security-remove-duplicator-and-purge-artifacts` retired; `security-dependency-lifecycle` proposal trimmed.
- **Local dev:** the owner's `.env` and MAMP host stay `rgvdsa.test` (gitignored); untracked plugin and legacy-theme directories remain on disk until the owner deletes them.
