## MODIFIED Requirements

### Requirement: Single contract definition
Contract types SHALL be defined once as zod schemas — the theme's `src/lib/schemas.ts` is the source of truth — with TS types derived via `z.infer`; canonical category slugs derive from the theme's `categories.json`. Each consuming app (`nuxt-js/`, `next-js/`) SHALL carry a byte-identical copy guarded by a drift test, so a contract field is still edited in exactly one place.

#### Scenario: One edit point
- **WHEN** a contract field is added
- **THEN** the type change originates in exactly one schema definition and every copy's drift test fails until re-copied

### Requirement: Runtime validation
Every API client (theme islands, `nuxt-js`, `next-js`) SHALL validate responses against the schemas — throwing in development, logging and rendering an error state in production.

#### Scenario: Drift is visible
- **WHEN** a PHP serializer emits a wrong shape in development
- **THEN** the consuming app fails loudly instead of rendering silently wrong data

### Requirement: Dual-sided fixture tests
Committed JSON fixtures in the theme's `tests/fixtures/` SHALL be asserted by PHPUnit (serializer + `rest_do_request` output equality) and by each consuming app's vitest suite (zod parse, reading the theme fixtures by relative path), so any contract change fails one side until all layers agree.

#### Scenario: Breaking change caught
- **WHEN** a serializer key is renamed without updating the schema
- **THEN** the PHP fixture test or a consuming app's zod test fails in CI/pre-merge

#### Scenario: Second consumer covered
- **WHEN** the `next-js` unit suite runs
- **THEN** every theme fixture parses with its schema
