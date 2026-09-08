## Context

Theme islands are built by Vite (`src/ts/app.ts` → `dist/`), Nuxt builds its own bundle, Next is React. Sharing therefore splits into (a) framework-free code and data usable by all three, and (b) Vue code usable by two. Both are currently shared by copying. `nuxt-js` is frozen for feature work but must keep building; `next-js` is the active build-out.

## Goals / Non-Goals

**Goals:**
- One file per shared artifact; no copy step; no drift test.
- Byte-identical CSS and component output before and after.
- Next's contracts and tokens come from the same package the theme uses.

**Non-Goals:**
- Sharing Vue components with React (no).
- Refactoring component internals.
- Publishing the packages to a registry (workspace-only, `private: true`).

## Decisions

- **Two packages, not one.** `contracts` has no framework dependency and is safe for Next; `shared-ui` depends on Vue/reka-ui. Rationale: a React app must not pull Vue into its dependency graph.
- **Workspace links, not path aliases only.** Each app lists `@progressnow/contracts` / `@progressnow/shared-ui` as `"workspace:*"`-style dependencies (npm: `"*"` with workspaces). Vite/Nuxt resolve symlinked packages; `preserveSymlinks` is set where needed. Rationale: aliases hide the dependency; packages make it explicit to tooling and to Renovate.
- **Tailwind v4 `@source` per consumer.** Tailwind only scans configured sources; each app's stylesheet adds `@source "../../packages/shared-ui/src"` so classes inside shared components exist in that app's CSS. Verified by hashing the built CSS before and after.
- **PHP reads the JSON from the package** via `PROGRESSNOW_CATEGORIES_JSON` constant defaulting to the package path; the theme's `categories.json` becomes a symlink-free copy *only* in the deploy bundle (the theme is deployed alone to a WordPress host) — the build step copies it into `dist/` and PHP prefers `dist/categories.json` when present. Rationale: the WordPress host never sees `packages/`.
- **Divergent files are decided, not merged blindly.** `api.ts` (transport differs), `menu.ts`, `location.ts`, `url-state.ts`: diff each; unify where the difference is accidental, keep per-app where it is architectural, and name it so.
- **Deploy bundle for the theme** (rsync/zip of `wp-content/themes/progressnow`) must include built assets only; `packages/` is a build-time dependency. The theme's `npm run build` produces everything the host needs.

## Risks / Trade-offs

- [Nuxt's frozen state] → only paths change; the Nuxt unit suite and `generate:mock` + `verify:output` are the acceptance tests.
- [Vite HMR across symlinked packages] → `server.fs.allow` includes the workspace root; documented.
- [Theme deployed without `packages/`] → build copies what PHP needs; a PHPUnit test asserts the registry loads from `dist/` when the package path is absent.
- [Tailwind misses classes in shared components] → CSS hash comparison and a test that renders every `components/site` component and checks computed styles for a sample class.

## Migration Plan

1. `packages/contracts` (schemas, categories, tokens, a11y constants); switch Next first (smallest surface), delete its drift tests.
2. Theme + Nuxt import contracts; PHP registry path; delete theme/Nuxt category drift tests.
3. `packages/shared-ui`; theme Vite consumes it; CSS/JS hash parity; delete theme copies.
4. Nuxt consumes it; drift test deleted; `generate:mock` + `verify:output` green.
5. Reconcile the four divergent files; docs.

## Open Questions

- Should the React `components/site` port live under `packages/` too (as `shared-ui-react`) for symmetry? (Recommend no until a second React consumer exists.)
- Keep `categories.json` readable by PHP via the built copy, or move the registry to PHP as the source and generate JSON? (Recommend built copy; the JSON is already the declared source of truth.)
