## 1. Environment

- [ ] 1.1 Add `.wp-env.json` (theme mapped, WP + PHP pinned, `WP_DEBUG` off, permalinks `/%postname%/`); `npm run wp-env` scripts
- [ ] 1.2 Add `bin/seed-core.php` (ACF/Polylang-free: categories, posts for every block type, events with meta fallbacks, pages on each template, menus, Chapter Settings defaults); idempotent
- [ ] 1.3 Boot locally; fix any theme code path that fatals or renders wrong without ACF/Polylang (fallbacks only; no behavior change with plugins present)

## 2. Playwright suite

- [ ] 2.1 `e2e/playwright.config.ts` mirroring `next-js` projects (`e2e`, `a11y`), reporters, artifact paths
- [ ] 2.2 Route specs EN/ES: front, posts index (browse, search, category, paged), single post (every block), calendar (month/list, window fetch), single event (RSVP, add-to-calendar), about, get-involved (FAQ), generic page, 404, author, search, `/es/` redirect
- [ ] 2.3 Chrome specs: islands hydrate (header, footer, archive, calendar), mobile nav toggle, a11y widget persistence, language toggle
- [ ] 2.4 Nuxt-mode specs: place `nuxt-js` `generate:mock` output as `CHAPTER_STATIC_DIR`; assert shell tags, `__SHELL_DATA__` shape, passthrough headers/ETag, freshness guard
- [ ] 2.5 Hostile-content spec: seeded hostile pages produce no dialog, no console error, no script execution
- [ ] 2.6 Feed/REST specs from the browser context: ICS headers and body, REST `ETag`/304, `Cache-Control` anon vs logged-in

## 3. Accessibility gate

- [ ] 3.1 Extract the axe scan helper to `packages/test-a11y` (or copy + drift test); `next-js` imports it
- [ ] 3.2 `a11y` project: every route × language × a11y mode × key interactive states; `baseline.json` with owners; fail on new violations
- [ ] 3.3 Record the initial burn-down list as follow-up tasks

## 4. Real-DB integration tests

- [ ] 4.1 `phpunit.integration.xml` + `tests/integration/bootstrap.php` against `wp-env`'s MySQL
- [ ] 4.2 Cases: pagination bounds, `lang` filtering, ETag/304, `/build-status` signature accept/reject, passthrough resolver on a real directory, cache bump on real saves

## 5. CI and docs

- [ ] 5.1 `ci.yml` job `theme-integration`: wp-env up → seed → build → Playwright e2e + a11y → PHPUnit integration → artifacts
- [ ] 5.2 Optional job with `ACF_PRO_LICENSE`/`POLYLANG_PRO_LICENSE` secrets: full seed, translations specs
- [ ] 5.3 Theme README + root README "Testing"; accessibility statement "How we assessed" cites the gate
