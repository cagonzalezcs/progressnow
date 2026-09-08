## Why

Three JavaScript apps and one PHP theme each carry their own toolchain, and they have drifted: ESLint 10 in the theme and `nuxt-js` versus ESLint 9 in `next-js`; TypeScript `~6.0.2` in two apps versus `^5` in the third; three Prettier config files pinned to the same version; three vitest configs; no root `package.json`, so "run everything" is a README paragraph of `cd` commands and the CI workflow repeats setup four times; Node is `>=22` by `engines` hint only (no `.nvmrc`, no `engine-strict`), PHP has neither a `require.php` nor a `config.platform` (CI runs 8.4, the README promises 8.1+); there is no `.editorconfig`. An engineer — or an AI agent — working in one app cannot discover the others' commands or be sure the same rules apply.

`security-cicd-supply-chain-hardening` pins the *versions* (Node, PHP, actions); this change gives the repository a single entry point and one set of shared tool configurations so the pins have somewhere to live. `single-source-shared-ui` (the shared-package change) depends on the workspace this creates.

## What Changes

- **Root `package.json`** with npm workspaces for `wp-content/themes/progressnow`, `nuxt-js`, `next-js`, and root scripts that fan out: `lint`, `typecheck`, `test`, `build`, `format`, `format:check`, `ci` (the whole CI matrix locally). Workspace hoisting is evaluated per app; if hoisting breaks Nuxt or Next, `install-strategy=nested` or per-app `npm ci --prefix` keeps isolation while the root scripts stay.
- **Shared configs at the root:** `.editorconfig`; one `prettier.config.mjs` referenced by each app; `tools/eslint/base.mjs` (TS + import hygiene + a11y baseline) extended by each app's flat config; one `vitest.shared.mts` (reporters, coverage provider, `passWithNoTests: false`).
- **Version alignment:** ESLint, TypeScript, vitest, Prettier on one major each across apps (pinned with `~`), `@types/node` matching the pinned Node; PHP `require.php: ">=8.1"`, `config.platform.php: 8.1.0`, CI matrix 8.1 + 8.4.
- **Discoverability:** root README "Local development" collapses to `npm install && npm run ci`; `openspec/config.yaml` project context lists the root scripts (owned by `docs-accuracy-and-spec-governance`; pointer only).

## Capabilities

### New Capabilities
- `workspace-toolchain`: one entry point, shared tool configuration, and aligned tool versions across every package in the repository.

### Modified Capabilities
- none.

## Impact

- **Root:** `package.json`, `package-lock.json` (workspaces), `.editorconfig`, `prettier.config.mjs`, `tools/eslint/base.mjs`, `vitest.shared.mts`, `.npmrc`.
- **Apps:** `package.json` (devDependency majors, `prettier` field, script names normalized: `lint`, `typecheck`, `test`, `build`), `eslint.config.*` (extend base), `vitest.config.*` (merge shared).
- **Theme PHP:** `composer.json` (`require.php`, `config.platform`, `scripts.lint` placeholder for the PHPCS gate).
- **CI:** `ci.yml` jobs call root scripts with `--workspace` so job definitions shrink; caching keys move to the root lockfile.
- **Vercel:** root directory settings unchanged; `.vercelignore` re-includes root config files the apps import.
- **Behavior:** none at runtime.
- **Coordinates with:** `security-cicd-supply-chain-hardening` (pins), `single-source-shared-ui` (needs workspaces), `security-headers-and-cicd-gates` (PHPCS config slot), `docs-accuracy-and-spec-governance`. Does not modify those changes.
