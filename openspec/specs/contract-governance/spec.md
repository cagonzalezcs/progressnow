# contract-governance Specification

## Purpose
TBD - created by syncing change rest-data-layer. Update Purpose after archive.
## Requirements
### Requirement: Single contract definition
Island contract types SHALL be defined once as zod schemas (`src/lib/schemas.ts`) with TS types derived via `z.infer`; canonical category slugs derive from `categories.json`.

#### Scenario: One edit point
- **WHEN** a contract field is added
- **THEN** the type change originates in exactly one schema definition

### Requirement: Runtime validation
The API client SHALL validate responses against the schemas — throwing in development, logging and rendering an error state in production.

#### Scenario: Drift is visible
- **WHEN** a PHP serializer emits a wrong shape in development
- **THEN** the island fails loudly instead of rendering silently wrong data

### Requirement: Dual-sided fixture tests
Committed JSON fixtures SHALL be asserted by PHPUnit (serializer + `rest_do_request` output equality) and by vitest (zod parse), so any contract change fails one side until both layers agree.

#### Scenario: Breaking change caught
- **WHEN** a serializer key is renamed without updating the schema
- **THEN** the PHP fixture test or the zod test fails in CI/pre-merge
