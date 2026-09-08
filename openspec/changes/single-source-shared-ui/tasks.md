## 1. Contracts package

- [ ] 1.1 Create `packages/contracts` (`schemas.ts`, `categories.json`, `tokens.css`, `a11y-settings.ts`, `links.ts` rules) with `package.json`, `tsconfig`, vitest; move the contract fixture parse test here
- [ ] 1.2 `next-js`: depend on the package; replace `lib/schemas.ts`, `categories.json`, the copied `@theme` block; delete `test/unit/shared-source-drift.test.ts` and categories drift; `npm run ci` green
- [ ] 1.3 Theme + `nuxt-js`: import schemas/categories/tokens from the package; delete `tests/categories-drift.test.ts` and the Nuxt equivalents
- [ ] 1.4 PHP: `progressnow_category_registry()` reads `dist/categories.json` (built copy) else the package path; PHPUnit for both

## 2. Shared UI package

- [ ] 2.1 Create `packages/shared-ui` from the theme's `src/components/{ui,site}`, `src/composables`, shared `src/lib`; own `package.json` (peer `vue`, `reka-ui`, …), tsconfig, vitest; move the theme's component tests
- [ ] 2.2 Theme: Vite resolves the package (`server.fs.allow`, `preserveSymlinks` as needed); `@source` in `tailwind.css`; record CSS + JS output hashes before/after; delete `src/components`, `src/composables`, shared `src/lib`
- [ ] 2.3 `nuxt-js`: depend on the package; alias `~/components/site` etc. or update imports; `@source`; delete copies and `test/unit/shared-source-drift.test.ts`; `npm test`, `generate:mock`, `verify:output` green
- [ ] 2.4 Reconcile `lib/menu.ts`, `lib/api.ts`, `lib/location.ts`, `lib/url-state.ts`: unify or keep per-app with a comment naming the architectural reason

## 3. Build, deploy, CI

- [ ] 3.1 Theme `npm run build` copies everything PHP needs into `dist/`; document that the WordPress host never needs `packages/`
- [ ] 3.2 `.vercelignore` re-includes `packages/`; Vercel builds for `nuxt-js` and `next-js` succeed
- [ ] 3.3 CI: run the packages' unit tests once; remove drift steps
- [ ] 3.4 Parity: CSS hash equal (or diff explained), styleguide screenshots unchanged, axe gate green

## 4. Docs

- [ ] 4.1 README "Shared source rule" → "Shared packages"; theme README "Adding a shadcn-vue component" → add to `packages/shared-ui`
- [ ] 4.2 Note for `open-source-release-readiness` CONTRIBUTING task: the three-copy rule is retired (pointer only)
