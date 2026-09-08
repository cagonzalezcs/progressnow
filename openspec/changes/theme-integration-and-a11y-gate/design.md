## Context

`next-js/test/e2e/a11y/` scans routes × languages × a11y modes × interactive states with axe and asserts against a baseline; `test/e2e/*.spec.ts` covers routes, chrome, search, calendar, images, SEO, headers. None of that exists for PHP. The theme's own tests re-`require` `functions.php` per test under WorDBless and polyfill `get_field()`. `@wordpress/env` provides a Docker WordPress with WP-CLI, theme mounting, and a MySQL container, and is the standard way to run a theme in CI.

## Goals / Non-Goals

**Goals:**
- Every public template renders in a real browser, in both languages, hydrated, with axe clean (or baselined) in default, large-text, high-contrast, and reduced-motion modes.
- Behaviors WorDBless cannot prove (rewrites, REST caching headers, feeds, passthrough) are proven against a real WordPress.
- The suite runs without licensed plugins; the licensed path is additive.

**Non-Goals:**
- Visual-regression pixel diffs (screenshots are review artifacts, not assertions).
- Replacing the WorDBless unit suite (fast; keep it).
- Testing wp-admin UI beyond the Site build panel smoke.

## Decisions

- **`wp-env` over a hand-rolled Docker Compose.** `.wp-env.json` maps the theme, sets `WP_DEBUG` off, pins WordPress and PHP versions, and exposes WP-CLI; CI caches the images. Rationale: maintained by WordPress, familiar to adopters.
- **ACF-free core seed.** `bin/seed-core.php` inserts posts/events/pages/menus using only core APIs and post meta the theme reads through its `progressnow_*_get_field()` fallbacks; the full `bin/seed.php` stays for licensed environments. Rationale: exercises the "renders without ACF" contract every run.
- **Playwright config mirrors `next-js`** (projects `e2e`, `a11y`, same reporters, same `test-results/axe/` layout) so the two suites can be read side by side; the axe helper is imported from one place.
- **Baseline, not exceptions.** Known violations are recorded in `e2e/a11y/baseline.json` with an owner and must only shrink; CI fails on any new rule/selector pair.
- **REST integration tests run in the same job** via `wp-env run tests-cli` + a second PHPUnit config (`phpunit.integration.xml`) that bootstraps against the container's MySQL instead of WorDBless.
- **Nuxt-mode coverage uses `generate:mock` output** placed at `CHAPTER_STATIC_DIR` inside the container, so the shell tags, `__SHELL_DATA__`, passthrough, and freshness guard are exercised without a live build pipeline.
- **Hostile-content pages** are seeded by the core seed with the fixtures from `security-template-output-escaping`; a Playwright test listens for `dialog`/console errors and asserts none fire.

## Risks / Trade-offs

- [CI time] → job runs in parallel with the others; Docker layer caching; a11y project only on `main` and PRs labeled `a11y`, or always if under ~4 minutes.
- [Theme depends on ACF for real content] → the ACF-free seed is the contract; gaps found become theme fixes (fallbacks), which is the point.
- [Licensed job needs secrets] → optional, skipped when absent; documented for maintainers.
- [Flaky hydration timing] → wait on `data-vue-island` mounted markers already present in the DOM.

## Migration Plan

1. `.wp-env.json` + `bin/seed-core.php`; boot locally; fix anything the theme needs to render without ACF/Polylang.
2. Playwright config + route/hydration/chrome specs; CI job.
3. axe project + baseline; burn-down list.
4. REST integration PHPUnit; nuxt-mode passthrough tests.
5. Licensed optional job; docs.

## Open Questions

- Run the a11y project on every PR or only on `main` + labeled PRs? (Recommend every PR if under 4 minutes.)
- Share the axe helper via `packages/` now (small package) or copy with a drift test until `single-source-shared-ui`? (Recommend a tiny `packages/test-a11y` now.)
