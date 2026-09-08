## MODIFIED Requirements

### Requirement: Single category source of truth
The six canonical category slugs, labels, and colors SHALL be defined once in `packages/contracts/categories.json`, consumed by PHP (`progressnow_category_registry()`, reading the built copy in the theme's `dist/` when the package path is absent), by TypeScript in every app (package import), and verified against Tailwind `--color-cat-*` tokens by an automated test in the package.

#### Scenario: PHP and TS agree
- **WHEN** the registry JSON defines a color for a slug
- **THEN** PHP serializers and every app's types resolve that color with no per-layer literals

#### Scenario: Tailwind drift fails CI
- **WHEN** a `--color-cat-*` token diverges from the JSON color
- **THEN** the package's vitest drift test fails
