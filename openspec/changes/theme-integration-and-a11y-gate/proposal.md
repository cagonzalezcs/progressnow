## Why

The PHP theme is the frontend every install ships — the default (`islands`) mode and the shell for `nuxt` mode — yet it has **no browser test and no accessibility gate**. Its 174 PHPUnit cases run on WorDBless: no MySQL, no rewrite rules, no real REST server, ACF and Polylang replaced by polyfills in `tests/bootstrap.php`. Nothing ever loads a PHP-rendered page in a browser, hydrates an island, presses the mobile nav toggle, follows the `/es/` redirect, or runs axe. Meanwhile `next-js` has Playwright + axe-core over every route × language × a11y mode, and `nuxt-js` verifies its generated output. The accessibility statement (`docs/accessibility-statement.md`, WCAG 2.2 AA) is therefore unverified for exactly the pages most installs serve, and the README's "assume tests assert the wrong thing" applies most strongly here.

Licensed plugins (ACF Pro, Polylang Pro) cannot be installed in public CI, which is why the theme must render without them (`open-source-release-readiness` task 3.1). A real-WordPress job exercises that path by default and the full path for maintainers who supply licences as secrets.

## What Changes

- **`wp-env` integration job** in CI: boots WordPress + the theme (no licensed plugins), seeds core content through WP-CLI (posts covering every block type, events via a seed subset that needs no ACF, menus, pages with the calendar/about/get-involved templates), builds the islands, and serves on a fixed port.
- **Playwright suite for the theme** (`wp-content/themes/progressnow/e2e/`): routes in EN and ES, islands hydrate (header, footer, blog archive, calendar, single post/event, FAQ), search and category filter through REST, mobile nav and a11y widget, `/es/` → front page, 404, ICS feed headers, REST ETag/304 against a real server, static passthrough and shell tags in `nuxt` mode (against `nuxt-js` `generate:mock` output), and the hostile-content pages from `security-template-output-escaping` rendered without script execution. (planned)
- **axe-core gate** reusing `next-js/test/e2e/a11y/scan.ts` (moved to a shared test helper package or copied with a drift test until `single-source-shared-ui` lands) over every theme route × language × a11y mode; baseline JSON for known issues that must burn down, no new violations allowed.
- **Real-DB REST integration tests** (PHPUnit against `wp-env`'s MySQL) for pagination bounds, language filtering, ETag/304, and the `/build-status` signature — the behaviors WorDBless cannot prove.
- **Licensed path (optional job):** when `ACF_PRO_LICENSE`/`POLYLANG_PRO_LICENSE` secrets exist (per `security-dependency-lifecycle`), install both, run the full seed, and run the same suites with translations.
- **Screenshot parity artifacts** per template for review against the Next styleguide screenshots.

## Capabilities

### New Capabilities
- `theme-test-harness`: browser, accessibility, and real-WordPress integration coverage for the PHP theme, mirroring `next-test-harness`.

### Modified Capabilities
- none.

## Impact

- **Theme:** new `e2e/` (Playwright config, specs, axe baseline), `.wp-env.json`, `bin/seed-core.php` (ACF-free subset of `bin/seed.php`), `tests/integration/` (PHPUnit against MySQL, separate phpunit config), `package.json` scripts (`test:e2e`, `test:a11y`, `wp-env`). (planned)
- **CI:** new `theme-integration` job (Docker), ~5–8 minutes; artifacts: axe reports, screenshots.
- **Shared:** axe scan helper shared with `next-js` (see above).
- **Docs:** theme README "Testing"; root README "Testing"; `docs/accessibility-statement.md` "How we assessed this site" can cite the gate.
- **Behavior:** none at runtime; the theme may need small fixes the browser exposes (expected).
- **Coordinates with:** `open-source-release-readiness` (theme renders without licensed plugins), `security-template-output-escaping` (hostile fixtures), `security-dependency-lifecycle` (licence secrets), `single-source-shared-ui` (shared axe helper), `test-credibility-coverage-and-mutation` (coverage of the new suites). Does not modify those changes.
