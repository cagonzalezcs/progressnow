## ADDED Requirements

### Requirement: Tracked tree excludes dependencies, artifacts, and legacy code
The repository SHALL NOT track installed dependencies (`node_modules/`, `vendor/`, WorDBless `wordpress/`), build output, archives (`*.zip`, `*.tar*`), database dumps (`*.sql*`), installer files (`installer*.php`, `dup-installer/`), log files, backup directories, any directory under `wp-content/plugins/`, or any theme other than `wp-content/themes/progressnow/`.

#### Scenario: Legacy theme and plugins are untracked
- **WHEN** `git ls-files wp-content` is run
- **THEN** only paths under `wp-content/themes/progressnow/` are returned

#### Scenario: Ignore rules prevent re-adding
- **WHEN** a file is created under `wp-content/plugins/`, `wp-content/themes/rgvdsatheme/`, `wp-content/backups-dup-lite/`, or matches an artifact pattern
- **THEN** `git status` does not list it as untracked

#### Scenario: Planted artifact fails CI
- **WHEN** a tracked file matches an artifact, dependency, plugin, or legacy-theme pattern
- **THEN** the hygiene job fails and names the offending path

### Requirement: Shipped text carries no chapter identifiers or personal data
Tracked text files — including seed content, test fixtures, both fixture libraries, OpenSpec documents, docs, workflows, and configuration defaults — SHALL NOT contain identifiers of any specific chapter or region, e-mail addresses or phone numbers outside a documented placeholder allowlist, or names of specific messaging platforms as defaults.

#### Scenario: Identifier scan passes
- **WHEN** the hygiene script scans every tracked text file with the shared chapter-identifier token list
- **THEN** it reports no matches

#### Scenario: Seed and fixtures are neutral
- **WHEN** `bin/seed.php` runs on an empty site and the contract fixtures are regenerated
- **THEN** no seeded string or fixture value names a messaging platform, a private address, a real person, or a region, in either language

#### Scenario: Committed development defaults are neutral
- **WHEN** `site/nuxt.config.ts`, `site/.env.example`, and `docs/deployment.md` are read
- **THEN** the default WordPress origin is a neutral host (`chapter.test`) and no chapter-specific host or storage key appears in shipped code

#### Scenario: Reviewed exception is explicit
- **WHEN** a line must legitimately contain an allow-listed placeholder (e.g. `example.org`, `(555) 555-0142`, `you@progressnow.org`)
- **THEN** it is covered by the script's allowlist or an inline `hygiene-allow` comment and the scan passes

### Requirement: CI enforces repository hygiene
The CI workflow SHALL run a root-level hygiene job on every push and pull request that executes the path and content checks, and the theme's brand-audit test SHALL consume the same chapter-identifier token list.

#### Scenario: Planted token fails CI
- **WHEN** a tracked text file gains a chapter identifier, an unallowed e-mail or phone number, a messaging-platform default, or an analytics token
- **THEN** the hygiene job fails with `path:line` output for each match

#### Scenario: Clean tree passes
- **WHEN** the tracked tree contains none of the denied paths or tokens
- **THEN** the hygiene job passes and the theme brand-audit test passes using the same token list
