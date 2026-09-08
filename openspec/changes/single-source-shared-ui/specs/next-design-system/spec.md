## MODIFIED Requirements

### Requirement: Shared stylesheet by drift test
`next-js/app/globals.css` SHALL import the design tokens from `@progressnow/contracts/tokens.css` and contain only the app-specific `@source` and layer declarations; the tokens file in the package is the source of truth and no copy of the `@theme` block SHALL exist in the app.

#### Scenario: Token edited in the package only
- **WHEN** `--color-brand` changes in the package's tokens file
- **THEN** the next build of `next-js` reflects it without any other edit

### Requirement: Shared contracts and category registry
`next-js` SHALL import zod schemas and the category registry from `@progressnow/contracts`; category colors SHALL come from the registry with `/site.categories` overriding at render.

#### Scenario: Registry renamed in the package
- **WHEN** a category slug is renamed in the package's `categories.json`
- **THEN** `next-js` typecheck fails on every stale reference without a drift test
