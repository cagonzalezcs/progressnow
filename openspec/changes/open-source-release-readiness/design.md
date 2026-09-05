## Context

The repo is a whole WordPress checkout with core ignored but `wp-content/` mostly tracked: the live theme `wp-content/themes/progressnow` (541 files), the retired `wp-content/themes/rgvdsatheme` (25,381 files: 20,471 `node_modules`, 2,915 WorDBless `wordpress/`, 1,940 `vendor/`), six plugins (3,324 files), and the Duplicator backup dir. The Nuxt app lives in `site/`, OpenSpec in `openspec/`, reference infra in `infra/terraform`, workflows in `.github/`. `wp-content/uploads` is already ignored; no analytics code exists; `humans.txt` and the theme README are already neutral; `tests/test-brand-audit.php` already scans shipped files, seed, contexts, ICS, and SEO head for regional tokens. Owner decisions: the project will be open-sourced under a fresh fork with a clean history; no analytics, ever; ACF Pro and Polylang Pro are hard dependencies; production hosting is out of scope for now.

## Goals / Non-Goals

**Goals:**
- A fresh clone contains only the theme, `site/`, docs, infra reference, workflows, and OpenSpec — no dependencies, plugins, legacy code, or artifacts.
- Every tracked text file is free of chapter identifiers, personal data patterns, messaging-platform defaults, and analytics tokens, and CI keeps it that way.
- The repository is legally and socially publishable: licence, attribution, contribution guide, conduct policy, security-reporting policy.
- Adopters know exactly which plugins they must buy/install and are told in wp-admin when one is missing.

**Non-Goals:**
- Rewriting git history in this repository (done once, at fork time, per the release checklist).
- The GitHub Pages demo (`github-pages-demo`), Composer-managed plugin installs, Renovate, audits, or the patch SLA (`security-dependency-lifecycle`).
- Hosting, backups, or deploy tooling for a production host.
- Renaming the owner's local dev host; only the committed defaults change.

## Decisions

- **Untrack with `git rm -r --cached`, then ignore.** Local working copies of the plugins and the old theme stay on disk (MAMP still needs the plugins to run the site); only the index changes. Alternative — `git rm` outright — rejected because it would delete the owner's working plugins and force an immediate reinstall.
- **Plugins are adopter-installed, never vendored.** `.gitignore` gets `/wp-content/plugins/` wholesale. ACF Pro and Polylang Pro are commercial: redistributing them in a public repo is both a licence-terms and a support-key exposure problem. Wordfence and WP Super Cache are free but installable from wordpress.org, so vendoring buys nothing. Alternative — Composer/wpackagist manifests — deferred to `security-dependency-lifecycle`; this change only needs the repo clean and the requirement documented.
- **Runtime dependency notice.** `functions.php`/`inc/` gains a single `admin_notices` check for ACF Pro (`class_exists('ACF')` + `acf_get_field_group`) and Polylang (`function_exists('pll_current_language')`) with the minimum versions from the README, so an adopter who forgets a plugin sees why nothing renders. Alternative — hard-fail the theme — rejected: wp-admin must stay usable to install the plugin.
- **One licence, GPL-2.0-or-later, at the root.** WordPress themes are derivative works and the ecosystem expects GPL; the Timber starter is MIT (compatible, attribution kept in `composer.json` authors + README). The Nuxt app is not WP-derived, but a single licence keeps the project simple for adopters and contributors. Alternative — MIT for `site/` — noted as an open question; easy to split later because `site/package.json` carries its own `license` field.
- **Community files are minimal and standard.** `CODE_OF_CONDUCT.md` = Contributor Covenant 2.1 with a placeholder contact; `SECURITY.md` points to GitHub private vulnerability reporting; `CONTRIBUTING.md` covers dev setup for both trees, the OpenSpec workflow, the three-copy rule (until `single-source-shared-ui`), and the hygiene script. Root `README.md` is the project front door: what it is, architecture map (theme + `site/` + shell), quick start, required plugins, links to theme/site READMEs and `docs/`.
- **Delete `bin/scrub-brand.sh` instead of genericizing it.** Its brand-scrub section is literally the original chapter's copy; its rename section only serves databases created under the pre-rename theme, which after the fork exist only at the original chapter. The migration has already been executed. The owner can keep a copy outside the repo. Alternative — parameterize into `bin/migrate-from.sh <old-prefix> <phrase-file>` — rejected as machinery nobody else will use.
- **Neutral committed defaults.** Dev origin `https://chapter.test:8890` everywhere (theme README already uses it); the legacy a11y storage-key migration is removed rather than renamed (its only purpose was continuity for the original chapter's visitors); seed/fixture copy replaces "WhatsApp" with "members' group chat" / "el chat de miembros" and "Member's garage (address in WhatsApp)" with "A member's home (address shared after RSVP)" / ES equivalent. Fixtures regenerate with `PROGRESSNOW_WRITE_FIXTURES=1 vendor/bin/phpunit --filter TestContracts`; the `site/app/lib/fixtures` copy is updated in lockstep.
- **OpenSpec archive is scrubbed, not excluded.** The archive is part of the public history of decisions and worth shipping, but the owner wants no chapter references anywhere. Mechanical replacement (`RGV DSA` / `Rio Grande Valley …` → "the original chapter"; `rgvdsa/v1` → "the pre-rename REST namespace" where it is prose, left as-is where it is a literal identifier being migrated). Alternative — exclude `openspec/changes/archive` from the grep — rejected: it would ship the identifiers.
- **One hygiene script, one token list.** `.github/scripts/repo-hygiene.mjs` (Node, no deps, runs on `git ls-files`) implements two checks: *paths* (deny-list: `\.zip$`, `\.(sql|sql\.gz|tar|tgz)$`, `installer(-backup)?\.php$`, `dup-installer/`, `\.log$`, `(^|/)node_modules/`, `(^|/)vendor/`, `^wp-content/plugins/`, `^wp-content/themes/(?!progressnow/)`, `backups-dup-`) and *content* (deny-list tokens: chapter identifiers, `whatsapp|telegram|signal group`, analytics tokens `gtag|googletagmanager|google-analytics|fbq\(|plausible|matomo|fathom|umami|hotjar|clarity\.ms`, e-mail regex, US phone regex; allowlist: `example\.(org|com)`, `you@progressnow\.org`, `\(555\) 555-`, lockfiles, binary extensions). The chapter-identifier tokens live in one JSON file consumed by both the script and `tests/test-brand-audit.php`, so the two audits cannot drift. Alternative — gitleaks — kept for `security-headers-and-cicd-gates` (secrets), not identifiers.
- **Supersession is explicit.** `security-remove-duplicator-and-purge-artifacts` is deleted as a change directory once this change's tasks cover its repo-facing requirements; `security-dependency-lifecycle`'s proposal loses its "stop committing plugin binaries" bullet with a pointer here.

## Risks / Trade-offs

- [Untracking plugins leaves a fresh clone unable to run WordPress until plugins are installed] → root README quick start lists them first; admin notice names the missing plugin; `github-pages-demo` gives a no-WordPress preview path.
- [The hygiene grep false-positives on legitimate text (e.g. a Spanish word containing "dsa", `vendor/` in a Composer path string)] → tokens use word boundaries and are case-insensitive only where safe; the script prints path:line and supports an inline `hygiene-allow` comment for reviewed exceptions.
- [Scrubbing the OpenSpec archive rewrites historical documents] → replacements are limited to identifiers; decisions and dates stay intact; the diff is reviewed once.
- [Removing the legacy a11y key migration resets preferences for the original chapter's returning visitors] → one-time, harmless (defaults restore); accepted by the owner's "remove everything" direction.
- [`git rm --cached` of 28k files makes one enormous commit] → single dedicated commit, no other changes in it, so history stays reviewable until the fork discards it.
- [Licence choice may be revisited] → all licence declarations are in five well-known places; changing them is a one-commit follow-up.

## Migration Plan

1. Land `.gitignore` + `git rm --cached` for legacy theme, plugins, backup dir in one commit.
2. Land licence, metadata, community files, and root README.
3. Land the identifier/PII scrub (code, seed, fixtures, tests, OpenSpec archive) with regenerated fixtures and green tests in both trees.
4. Land the hygiene script + CI job; prove it fails on a planted artifact and a planted token, then passes clean.
5. Retire the superseded security change; trim `security-dependency-lifecycle`.
6. At fork time: follow `docs/open-source-release.md` (fresh history, tag, advisories, branch protection).

Rollback: every step is a plain revert; untracked directories are still on disk.

## Open Questions

- Keep the owner's name as theme `Author:` (normal OSS attribution) or switch to a project handle?
- Single GPL-2.0-or-later licence for `site/` too, or MIT for the Nuxt app?
- Should `infra/terraform` ship in the public repo (reference-only, AWS-specific) or move to `docs/`?
