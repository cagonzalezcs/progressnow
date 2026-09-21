## Why

The theme's `src/` and `nuxt-js/app/` share **378 byte-identical files** — all of `components/ui/**` (the vendored shadcn-vue set), `components/site/**`, `composables/useA11ySettings.ts`, `lib/schemas.ts`, `css/tailwind.css`, `categories.json` — maintained by the rule "edit the theme copy and re-copy" and a drift test that fails until someone does. `next-js/` carries a third copy of `schemas.ts`, `categories.json`, and the token stylesheet under the same rule. Four files already differ between theme and Nuxt (`lib/menu.ts`, `lib/api.ts`, `lib/location.ts`, `lib/url-state.ts`) without a drift test covering them.

That is roughly 400 duplicated files, a manual copy step every session must remember, and three places a fix to a shared component (the `BlockVideo` iframe allow-list, a kses-bound `v-html`, an a11y attribute) has to land. `open-source-release-readiness` already refers to a future `single-source-shared-ui` change in its CONTRIBUTING task ("three-copy rule until `single-source-shared-ui`"). This is that change.

## What Changes

- **`packages/contracts`** (framework-free): `schemas.ts`, `categories.json`, `tokens.css` (the `@theme` block), `a11y-settings` constants, `links` rules shared by the Nuxt and Next re-homers. Consumed by the theme, `nuxt-js`, and `next-js` as a workspace dependency; the three drift tests for these files are deleted. (planned)
- **`packages/shared-ui`** (Vue 3): `components/ui/**`, `components/site/**`, `composables/**`, `lib/**` that the theme islands and Nuxt both use. Consumed by the theme's Vite build and by Nuxt via a workspace dependency + alias; the `shared-source-drift.test.ts` is deleted. Next keeps its React port and consumes only `packages/contracts`. (planned)
- **Tailwind sources:** each app's stylesheet imports `@progressnow/contracts/tokens.css` and adds `@source "../../packages/shared-ui"` so utilities used inside shared components are generated.
- **The four already-divergent files** are reconciled: either unified into the package or renamed to make the divergence explicit (`api.ts` differs by transport; keep per-app, drop from the package).
- **Vercel and CI:** `.vercelignore` re-includes `packages/`; CI runs the packages' own unit tests once. (planned)

## Capabilities

### New Capabilities
- `shared-source-package`: the framework-free contracts and the Vue UI library live once, as workspace packages, and every app imports them.

### Modified Capabilities
- `contract-governance`: "Single contract definition" — consumers import the package instead of carrying drift-tested copies.
- `next-design-system`: "Shared stylesheet by drift test" and "Shared contracts and category registry" — by import instead of copy.
- `category-registry`: "Single category source of truth" — the JSON lives in the contracts package and PHP reads it from there.

## Impact

- **New:** `packages/contracts/`, `packages/shared-ui/` with their own `package.json`, `tsconfig.json`, vitest config. (planned)
- **Theme:** `src/` shrinks to `ts/` (entry, islands, navigation), `css/tailwind.css` (imports tokens), `StarterSite.php`; `vite.config.js` resolves the packages; `inc/categories.php` reads `packages/contracts/categories.json` (path via constant); `tests/categories-drift.test.ts` deleted. (planned)
- **nuxt-js:** `app/components/site`, `app/components/ui`, `app/composables/useA11ySettings.ts`, `app/lib/schemas.ts` removed; `nuxt.config.ts` alias + `@source`; drift tests deleted. (The app is otherwise frozen; this is a path change, not a behavior change.)
- **next-js:** `lib/schemas.ts`, `categories.json`, the copied `@theme` block in `app/globals.css` replaced by imports; `test/unit/shared-source-drift.test.ts` deleted; `lib/links.ts` optionally imports the shared rule set.
- **Docs:** README "Design system → Shared source rule" rewritten; theme README "Adding a shadcn-vue component" points at the package.
- **Behavior:** none — identical components, identical CSS output (asserted by a before/after CSS hash in the migration).
- **Depends on:** `workspace-toolchain-baseline` (workspaces). **Coordinates with:** `open-source-release-readiness` (CONTRIBUTING wording). Does not modify those changes.
