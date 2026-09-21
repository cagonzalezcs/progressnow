# Dependency lifecycle

How WordPress core, the plugins and every package the kit builds with are
declared, pinned, updated, audited and patched (openspec
`security-dependency-lifecycle`, capability `dependency-lifecycle`). Stale
plugins are the most common way a WordPress site is compromised; nothing here
depends on someone remembering to look.

Plugins and core are **not** in git ([README](../README.md) § Repository
layout). What is in git is the *pin*: the version every environment is
supposed to run, and the tooling that notices when a pin is vulnerable or an
environment has drifted from it.

## 1. Inventory

Pins live in three files at the repository root: `composer.json` +
`composer.lock` (what Composer installs) and `dependency-pins.json` (what it
cannot). `node scripts/deps/verify-pins.mjs --list` prints them.

| Dependency | Pinned | Source | Licence | Mechanism | Update path |
| --- | --- | --- | --- | --- | --- |
| WordPress core | 7.1.1 | packagist `roots/wordpress` (wordpress.org build) | GPL | Composer pin; applied with WP-CLI (§2) | Renovate PR → `wp core update --version` |
| Wordfence | 9.0.1 | wpackagist | GPL | Composer install | Renovate PR → `composer install` |
| WP Super Cache | 3.1.3 | wpackagist | GPL | Composer install | Renovate PR → `composer install` |
| ACF Pro | 6.8.10 | `connect.advancedcustomfields.com` (vendor's Composer repository) | commercial, per-site key | Composer install, authenticated (§3) | Renovate PR → `composer install` |
| Polylang Pro | 3.8.9 | Polylang account download | commercial, per-site key | **controlled-vendor** — no Composer endpoint exists (§4) | Renovate PR on the pin → manual ZIP install |
| Theme PHP libraries (Timber, vite-for-wp, test tooling) | theme `composer.lock` | packagist | MIT/GPL | Composer | Renovate PR |
| npm packages (theme, `nuxt-js/`, `next-js/`) | each `package-lock.json` | npm | various | npm | Renovate PR |
| GitHub Actions | commit SHA + version comment | GitHub | various | workflow files | Renovate PR (digest pin) |

Not pinned, because they must not be installed:

| Plugin | Why | Action |
| --- | --- | --- |
| Duplicator | migration tool that leaves installers and archives in the docroot | remove from every environment (openspec `open-source-release-readiness`) |
| Wordfence Login Security (standalone) | **closed on wordpress.org on 2026-08-17** — it will never receive another update. The same module ships inside Wordfence | remove; configure 2FA in Wordfence → Login Security ([runtime-hardening.md](runtime-hardening.md) §4) |

`verify-pins.mjs` reports any installed plugin that is not pinned as
`undeclared` and fails — a plugin is either managed or absent.

## 2. Installing and updating from the pins

Run at the docroot (the repository root). Requires Composer 2, WP-CLI and
Node 22.

```bash
composer install                                   # plugins → wp-content/plugins/, tooling → vendor/, core → .wp-core/
wp core update --version=7.1.1                     # the version composer.lock pins; no-op when already there (--force to go back down to it)
git checkout -- wp-config-sample.php               # core ships its own sample; the kit's is the tracked one
node scripts/deps/verify-pins.mjs                  # every pin matches what is on disk
```

- `composer install` replaces each managed plugin directory with the pinned
  release. Plugin *settings* live in the database and are untouched.
- Core stays at the docroot — this layout is unchanged. Composer's core
  installer refuses to write to the project root, so the pinned core is
  downloaded to `.wp-core/` (git-ignored) as the reference copy and WP-CLI
  applies the same version in place, running WordPress's own upgrade routine
  (database upgrade, removal of files the release dropped). Moving core into a
  subdirectory so Composer owns it outright is a separate, later decision.
- Turn off dashboard-driven updates once an environment is installed from the
  pins — otherwise it drifts ahead of them: set
  `PROGRESSNOW_DISALLOW_FILE_MODS` ([runtime-hardening.md](runtime-hardening.md)
  §2) and Wordfence's own auto-update off. Updates then arrive as merged pull
  requests, applied with the four commands above.

**Applying a merged update.** Pull `main` on the host (or in the deploy job),
run the block above, check the site, record it in the log (§8) when it was a
security patch. `--docroot <dir>` points `verify-pins.mjs` at another
environment's files.

## 3. ACF Pro: authenticated Composer install

ACF publishes an official Composer repository; its licence terms allow
installing with the site's key. Composer authenticates with HTTP basic —
**username = the licence key, password = the site URL** the key is activated
for.

```bash
composer config --auth http-basic.connect.advancedcustomfields.com "<licence key>" "https://<site>"
```

That writes `auth.json` beside `composer.json`. It is git-ignored, the
`artifact-guard` job fails if one is ever tracked, and gitleaks carries a rule
for the key's fixed prefix (`.gitleaks.toml`, `acf-pro-license-key`). In
automation supply the same JSON through the `COMPOSER_AUTH` environment
variable from a secret store — never a file in the workspace, never `echo`ed.

Nothing in CI needs the key: the repository's metadata is public, so locking,
`composer validate` and `composer audit --locked` all run without it. Only
`composer install` (a host or a future deploy job) downloads the ZIP. If
Renovate's lock update for ACF ever fails with a 401, add the key as a secret
in the Renovate app settings and reference it from a `hostRules` entry for
`connect.advancedcustomfields.com` in `.github/renovate.json5`.

## 4. Polylang Pro: controlled-vendor

Polylang offers no Composer repository, and third-party installers work by
handing the key to unofficial code. So the plugin is installed by hand and the
*pin* is what is versioned:

1. `dependency-pins.json` → `controlled-vendor.polylang-pro.version` is the
   version every environment must run.
2. Polylang Pro and the free Polylang release together under the same version
   number. Renovate watches the free plugin on wpackagist and opens a pull
   request that bumps the pin — that pull request is the update notice.
3. Download that version from the Polylang account, then on every environment:
   `wp plugin install <zip> --force`, `node scripts/deps/verify-pins.mjs`.
4. Merge the pull request once production runs the new version. A Pro-only
   point release that the free plugin does not mirror is covered by the monthly
   review (§8).

The ZIP and the key never enter the repository (`*.zip` is ignored and
`artifact-guard` fails on one).

## 5. Renovate

`.github/renovate.json5` — one configuration for Composer (root + theme), npm
(three apps), GitHub Actions digests, the `next-js/Dockerfile` base image and
the Polylang pin.

**One-time owner step:** install the [Renovate GitHub App](https://github.com/apps/renovate)
on the repository. Until then no update pull requests are opened. Adopters who
fork the kit install it on their fork.

- Routine updates: Monday before 06:00 UTC. Non-major npm updates are grouped
  per app, the theme's PHP libraries into one pull request, Actions digests
  into one; each WordPress dependency gets its own.
- Security updates (OSV, plus GitHub Dependabot alerts when the owner has
  enabled them) ignore the schedule and the three-day release-age wait.
- Lockfiles are re-resolved monthly, which is what picks up a patched
  *transitive* package.
- Nothing auto-merges. CI runs on every Renovate pull request; a person merges.
- A Node major is never proposed — that is a repo-wide change
  ([security-gates.md](security-gates.md) § Bumping the pins).

## 6. Audit gates

`.github/workflows/dependency-audit.yml`, on every push and pull request and
daily at 06:23 UTC:

| Job | Runs | Fails when |
| --- | --- | --- |
| `composer-audit` | `composer validate` on the root manifest; `composer audit --locked --abandoned=report` on the root and theme locks | the lock is stale, or any locked PHP package has a published advisory |
| `npm-audit` | `node --test` over `scripts/deps/`; `npm audit --audit-level=high` in the theme, `nuxt-js/` and `next-js/`, devDependencies included | a locked npm package has a high or critical advisory |
| `wp-vuln-feed` | `scripts/deps/check-vuln-feed.mjs` — schedule, `main`, manual runs | a pinned core/plugin version is in the affected range of a Wordfence Intelligence record (§7) |

Both audits read lockfiles only, so they take seconds and need no install. Add
`composer-audit` and `npm-audit` to the "Protect main" ruleset's required
checks ([security-gates.md](security-gates.md) § The required jobs).

**When one fails.** The output names the package and the advisory. Take the
Renovate security pull request if there is one; otherwise, in the app that
failed, `npm audit fix` (or `composer update <package> --with-dependencies`),
run that app's tests, open a pull request. The patch windows in §8 apply. A
failure on a branch that did not touch dependencies means an advisory was
published since `main` last ran — fix it on its own branch first, then rebase.

If `npm audit fix` dies with `Cannot read properties of null (reading
'edgesOut')` (an npm 10 resolver crash on this tree), run the same command
through npm 11: `npx npm@11 audit fix --package-lock-only`, then `npm ci`.

Verified when the gates landed (2026-09-21), with the exact job commands: a
project pinning `lodash` 4.17.15 fails `npm-audit`, one pinning
`guzzlehttp/guzzle` 7.4.0 fails `composer-audit`, and a feed record covering
the pinned Wordfence version fails `wp-vuln-feed` — each naming the package
and advisory. The feed matcher's cases are permanent tests in
`scripts/deps/deps.test.mjs`.

## 7. Vulnerability feed

`composer audit` and `npm audit` know nothing about WordPress plugins.
`scripts/deps/check-vuln-feed.mjs` downloads the Wordfence Intelligence
production feed (free for personal and commercial use, API key required since
March 2026) and matches every pin against each record's affected ranges.

**One-time owner step:** create a free wordfence.com account → Integrations →
create an API key → add it as the Actions secret `WORDFENCE_INTEL_API_KEY`.
Without the secret the job passes with a *warning* that nothing was checked, so
forks are not red by default — and an unconfigured upstream is visibly
unprotected.

On a match the job fails, annotates the run, and opens one issue — "Vulnerability
feed: a pinned WordPress dependency is affected" — or refreshes its body; when a
later run is clean it closes the issue. The issue lists severity, the patched
version and the patch window.

**Accepting a finding.** A record with no patch, or one that does not apply to
how the site uses the plugin, can be accepted *until a date* in
`dependency-pins.json`:

```json
"vuln-accepted": {
  "<record id from the issue link>": { "reason": "no patch yet; the affected shortcode is not registered", "until": "2026-11-01" }
}
```

It reappears the day after `until`. An acceptance is a pull request like any
other change, and goes in the log (§8).

Local run: `WORDFENCE_INTEL_API_KEY=… node scripts/deps/check-vuln-feed.mjs`,
or `--feed <file>` against a saved copy. Feed records are © Defiant Inc. (and
MITRE for CVE text); the alert issue reproduces the notice and links each
record, as the feed's licence requires.

## 8. Patch SLA

Two different commitments, deliberately kept apart:

- **The kit (this repository)** is MIT-licensed software offered as is. Its
  maintainers keep the pins, lockfiles and gates current on a *best-effort*
  basis against the windows below; that is a maintenance target, not a
  warranty to anyone running the code.
- **A deployed site** is someone's production system, and its operator owns a
  real SLA. The table below is the default; an adopter fills in the owner rows
  at deploy time and may only tighten the windows.

| Severity (CVSS rating; vendor "critical/high" when unrated) | Patched on production within | Clock starts |
| --- | --- | --- |
| Critical, High | **7 days** | when the alert exists: the feed issue, a failed audit job, a Renovate security pull request, or a vendor notice |
| Medium | **30 days** | same |
| Low | next routine update cycle, at most 90 days | same |
| Actively exploited, any rating | **emergency path, same day** | same |

The same numbers drive the "Window" column of the alert issue
(`SLA_DAYS` in `scripts/deps/check-vuln-feed.mjs`).

**Routine path.** Alert → the owner triages within one working day (does the
affected code run here? is there a patched release?) → merge the update pull
request once CI is green → apply it on staging where one exists, then
production (§2) → `verify-pins.mjs` → close the alert → log entry.

**Emergency path** (exploited in the wild, or Critical with a trivial
exploit). The owner may act alone, immediately, in this order:

1. Contain: if no patched release exists, deactivate the plugin
   (`wp plugin deactivate <slug>`) or block the vulnerable route at the
   firewall — a degraded site beats a compromised one.
2. Patch production directly: `wp plugin update <slug> --version=<patched>` /
   `wp core update --version=<patched>`, or the vendor ZIP. This is the one case
   where production may run ahead of the pins.
3. Within one working day, bring the repository back in line: bump the pin in
   a pull request (review happens here, after the fact), confirm with
   `verify-pins.mjs`, write the log entry.
4. If compromise is suspected, rotate credentials
   ([secrets-rotation.md](secrets-rotation.md), salts in
   [runtime-hardening.md](runtime-hardening.md) §3).

**When a window cannot be met** (no patch, a breaking major): record an
acceptance with an end date (§7) and the compensating control — plugin
deactivated, feature disabled, firewall rule. An expired acceptance fails the
feed job again.

**Escalation.** A window at risk of being missed goes to the backup the same
day it becomes clear; a missed window is itself a log entry with the reason.

### Ownership

| Scope | Accountable owner | Backup / escalation | Review cadence |
| --- | --- | --- | --- |
| This repository: pins, lockfiles, gates, Renovate queue | @cagonzalezcs (maintainer, best-effort) | any maintainer with merge rights | monthly — **first review 2026-10-19**, then the third Monday of each month |
| A deployed site | *adopter fills in: a named person* | *adopter fills in* | monthly; first review within 30 days of going live |

The monthly review, about fifteen minutes: the Renovate dashboard issue has no
security pull request older than its window; the last scheduled
`Dependency audit` run is green and the feed job ran *with* a key; the Polylang
account shows no Pro release newer than the pin; every acceptance in
`dependency-pins.json` is still justified; `verify-pins.mjs` passes on each
environment.

### Log

Newest first. One line per security patch, emergency action, acceptance or
missed window.

| Date | Dependency | From → to | Severity | Path | Within window | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-09-21 | theme npm: vite, vitest, postcss, nanoid, brace-expansion, esbuild, postcss-selector-parser | lockfile re-resolve (vite 7.3.3 → 7.3.6, vitest 4.1.9 → 4.1.11, postcss 8.5.16 → 8.5.28) | 4 High, 2 Medium, 2 Low | routine | yes (same day) | found by the first `npm-audit` run; dev-server and build-tool advisories |
| 2026-09-21 | Wordfence Login Security 1.1.16 | retired | — (closed upstream) | routine | — | removed from the supported plugin set; 2FA moves to Wordfence's bundled module |
