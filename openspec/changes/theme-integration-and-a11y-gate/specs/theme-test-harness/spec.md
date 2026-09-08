## ADDED Requirements

### Requirement: The theme runs in a real WordPress in CI
CI SHALL boot a real WordPress with the theme and no licensed plugins, seed content covering every template and block type through core APIs, build the islands, and serve the site for browser tests.

#### Scenario: Renders without licensed plugins
- **WHEN** the integration job boots without ACF Pro or Polylang Pro
- **THEN** every public template renders with neutral defaults and no PHP error

### Requirement: Browser coverage of every public template
A Playwright suite SHALL load every public template in both languages, assert island hydration, exercise search, filtering, calendar navigation, mobile navigation, the accessibility widget, the language toggle, the `/es/` redirect, the 404, the ICS feed, and REST caching headers, in islands mode and in Nuxt shell mode against generated output.

#### Scenario: Island hydrates
- **WHEN** the posts index loads in a browser
- **THEN** the archive island mounts and a category filter updates results without a full navigation

#### Scenario: Shell mode passthrough
- **WHEN** the site runs in `nuxt` mode with a generated build at `CHAPTER_STATIC_DIR`
- **THEN** the shell emits the manifest's tags and `/_nuxt/*` is served with the immutable cache header

### Requirement: Accessibility gate against the PHP theme
axe-core SHALL scan every public route in each language and accessibility mode; violations SHALL be compared to a baseline that may only shrink, and any new violation SHALL fail the job.

#### Scenario: New violation blocks
- **WHEN** a template change introduces a missing form label
- **THEN** the accessibility job fails naming the route, rule, and selector

### Requirement: Hostile content does not execute
Seeded hostile strings SHALL render on every template without any script execution, dialog, or console error observed by the browser.

#### Scenario: Hostile title page
- **WHEN** the browser loads a post whose title contains a script terminator and an event handler attribute
- **THEN** no dialog opens and the page's console records no error

### Requirement: Real-database integration tests
PHPUnit SHALL run a second configuration against the integration MySQL covering REST pagination bounds, language filtering, ETag/304, the signed build-status endpoint, the static passthrough resolver, and cache-version bumps on real saves.

#### Scenario: Conditional request
- **WHEN** a client repeats a REST request with the previous `ETag`
- **THEN** the real server answers 304 with no body
