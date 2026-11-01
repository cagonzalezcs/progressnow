## 1. Workspace root

- [ ] 1.1 Root `package.json` (`private`, `workspaces`, `engines`), `.npmrc` (`engine-strict=true`), root `package-lock.json`; `npm install` at root installs all three
- [ ] 1.2 Verify `npm run build --workspace` for theme, `nuxt-js` (`generate:mock`), `next-js` (`build:mock`); set `install-strategy=nested` per app only if a build breaks
- [ ] 1.3 Root scripts: `lint`, `typecheck`, `test`, `build`, `format`, `format:check`, `ci` fanning out with `--workspaces --if-present`
- [ ] 1.4 `.vercelignore`: re-include root config files the apps import

## 2. Shared tool configuration

- [ ] 2.1 `.editorconfig` at root
- [ ] 2.2 `prettier.config.mjs` at root; apps reference it via the `"prettier"` field; delete per-app `.prettierrc`; `format:check` green
- [ ] 2.3 `tools/eslint/base.mjs` (TS, import order, a11y baseline); each app's flat config extends it; app-specific rules stay local
- [ ] 2.4 `vitest.shared.mts` (reporters, coverage provider, `passWithNoTests: false`); apps `mergeConfig`

## 3. Version alignment

- [ ] 3.1 Align ESLint, TypeScript, vitest, Prettier, `@types/node` majors across apps (check `eslint-config-next` support first); lint/typecheck/test green everywhere
- [ ] 3.2 Normalize script names in each `package.json`
- [x] 3.3 Theme `composer.json`: `require.php >=8.2`, `config.platform.php`, `scripts.lint` placeholder; `composer validate` — done (November 1, 2026): `php: ">=8.2"`, `config.platform.php` `8.2.0` (Timber 2.5 floor; 8.1 is end-of-life), `scripts.lint` = phpcs

## 4. CI and docs

- [ ] 4.1 `ci.yml`: jobs call root scripts per workspace; cache on the root lockfile; PHP matrix 8.2 + 8.4 — partly done (November 1, 2026): the matrix already runs 8.2 and 8.4; root scripts and the root lockfile cache wait on task 1.1
- [ ] 4.2 README "Local development": root quick start (`npm install && npm run ci`); per-app sections shrink to what is unique
- [ ] 4.3 Pointer in `openspec/config.yaml` project context to the root scripts (content owned by `docs-accuracy-and-spec-governance`)
