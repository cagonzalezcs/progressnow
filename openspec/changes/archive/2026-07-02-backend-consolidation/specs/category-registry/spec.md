# category-registry

## ADDED Requirements

### Requirement: Single category source of truth
The theme SHALL define the six canonical category slugs, labels, and colors once in `categories.json`, consumed by PHP (`legacy_category_registry()`), TypeScript (JSON import), and verified against Tailwind `--color-cat-*` tokens by an automated test.

#### Scenario: PHP and TS agree
- **WHEN** the registry JSON defines a color for a slug
- **THEN** PHP serializers and island fixtures/types both resolve that color with no per-layer literals

#### Scenario: Tailwind drift fails CI
- **WHEN** a `--color-cat-*` token diverges from the JSON color
- **THEN** the vitest drift test fails

### Requirement: Term overrides
`legacy_categories()` SHALL merge the WP term name and ACF term-meta `color` over the registry defaults when the term exists.

#### Scenario: Term recolor
- **WHEN** an admin sets a color on the `mutual` category term
- **THEN** category payloads emit the override, falling back to the registry color when unset

### Requirement: Canonical slug protection
The theme SHALL prevent renaming the slug of any term whose current slug is canonical, in both `category` and `event_category` taxonomies.

#### Scenario: Rename attempt blocked
- **WHEN** an admin edits the `labor` term and changes its slug
- **THEN** the slug is forced back to `labor` on save and post categorization is unaffected
