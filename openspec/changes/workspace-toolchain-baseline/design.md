## Context

Each app was scaffolded by its generator (Vite + shadcn-vue, Nuxt 4, `create-next-app` + shadcn) at different times; the theme and Nuxt copy each other's source, Next is a port. `ci.yml` has four jobs with near-identical `setup-node` + `npm ci` preambles and different cache paths. Renovate (planned) will open one PR per app per dependency without workspaces.

## Goals / Non-Goals

**Goals:**
- `npm run ci` at the root reproduces CI.
- One version of each dev tool across the repo; one place to bump it.
- Adding a fourth package (`packages/shared-ui`) is a one-line workspace entry.

**Non-Goals:**
- Merging the apps' runtime dependencies or build outputs.
- Turborepo/Nx (no need at this size; revisit if `npm run ci` exceeds a few minutes).
- Changing PHP tooling beyond platform declaration (PHPCS lives in the CI-gates change).

## Decisions

- **npm workspaces, not pnpm/yarn.** The apps, Vercel, and CI already use npm and `package-lock.json`. Switching package managers is a separate decision with no security payoff.
- **Hoisting is measured, not assumed.** Phase 1 creates the root manifest with `workspaces` and runs each app's build; if Nuxt's `nuxt prepare` or Next's tracing (`output: standalone`) misbehaves with hoisted deps, `.npmrc` sets `install-strategy=nested` (npm ≥ 9) for that app. Vercel builds from each app's root directory with its own lockfile unaffected.
- **Shared configs are imported, not copied.** `prettier.config.mjs` via the `"prettier"` field; ESLint via `import base from "../tools/eslint/base.mjs"`; vitest via `mergeConfig`. Rationale: the copy-and-drift pattern is exactly what this repo suffers from.
- **Align on the newest major already in use** (ESLint 10, TS 6, vitest 4) unless a framework config pins lower — `eslint-config-next` for ESLint 10 support is checked first; if unsupported, all apps stay on ESLint 9 until it is.
- **Normalize script names** (`lint`, `lint:fix`, `typecheck`, `test`, `test:e2e`, `build`, `format`, `format:check`) so the root fan-out is `npm run <script> --workspaces --if-present`.
- **PHP platform in `composer.json`** so Composer resolves for 8.1 even when the developer runs 8.4; CI matrix proves both.

## Risks / Trade-offs

- [Hoisting changes module resolution in one app] → per-app nested strategy; builds are the test.
- [Vercel root-directory builds lose access to root configs] → `.vercelignore` re-includes `prettier.config.mjs`, `tools/`, `vitest.shared.mts` (lint/test do not run on Vercel, but imports must resolve).
- [ESLint major mismatch with `eslint-config-next`] → hold at the highest common major; record the blocker.
- [Bigger root lockfile] → one lockfile is what Renovate and `dependency-review` want.

## Migration Plan

1. Root manifest + workspaces + root scripts; verify each app installs/builds; `.npmrc` as needed.
2. Shared Prettier/EditorConfig; format check green.
3. Shared ESLint base + vitest shared config; align majors.
4. Composer platform + CI matrix; CI jobs switched to root scripts.
5. README "Local development" and `openspec/config.yaml` pointer.

## Open Questions

- Hoisted or nested by default? (Recommend hoisted; fall back per app on evidence.)
- Keep four CI jobs (parallel, per app) or one job running `npm run ci`? (Recommend keep four for parallelism; each becomes a two-line body.)
