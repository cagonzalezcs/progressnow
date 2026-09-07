## MODIFIED Requirements

### Requirement: Single contract definition
Island contract types SHALL be defined once as zod schemas in the Nuxt app (`nuxt-js/app/lib/schemas.ts`) with TS types derived via `z.infer`; canonical category slugs derive from the theme's `categories.json`. The shell payload envelope, `/site`, `/routes`, `/front-page`, `/pages/{path}`, `/events/{slug}`, and `shell-manifest.json` SHALL have schemas there too.

#### Scenario: One edit point
- **WHEN** a contract field is added
- **THEN** the type change originates in exactly one schema definition

### Requirement: Dual-sided fixture tests
Committed JSON fixtures in the theme's `tests/fixtures/` SHALL be asserted by PHPUnit (serializer + `rest_do_request` output equality) and by the Nuxt app's vitest suite (zod parse, reading the theme fixtures by relative path), so any contract change fails one side until both layers agree. Fixtures SHALL exist for every envelope listed in "Single contract definition".

#### Scenario: Breaking change caught
- **WHEN** a serializer key is renamed without updating the schema
- **THEN** the PHP fixture test or the zod test fails in CI/pre-merge

#### Scenario: New envelope covered
- **WHEN** the `/routes` serializer changes shape
- **THEN** the `routes-manifest.json` fixture test fails on one side until both are updated
