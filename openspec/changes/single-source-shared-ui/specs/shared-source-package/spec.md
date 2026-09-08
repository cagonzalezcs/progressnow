## ADDED Requirements

### Requirement: Shared source exists once as workspace packages
Framework-free contracts (zod schemas, category registry, design tokens, accessibility-settings constants, link rules) SHALL live in `packages/contracts`, and the Vue component library, composables, and shared libs SHALL live in `packages/shared-ui`; the theme, `nuxt-js`, and `next-js` SHALL import them as workspace dependencies and SHALL NOT carry copies.

#### Scenario: No duplicate shared file
- **WHEN** the tracked tree is scanned for files byte-identical to a file in `packages/`
- **THEN** none is found under any app

#### Scenario: React app depends only on contracts
- **WHEN** `next-js`'s dependency graph is inspected
- **THEN** it includes `@progressnow/contracts` and no Vue package

### Requirement: Consumers generate identical output
Each consuming app SHALL produce the same CSS for shared components as before the migration, and shared components SHALL render identically in the theme islands and the Nuxt rendition.

#### Scenario: CSS parity
- **WHEN** the theme's built stylesheet is hashed before and after adopting the package
- **THEN** the hashes match or every difference is listed and justified in the change

### Requirement: The WordPress host needs no workspace
The theme's build SHALL copy every artifact PHP reads (the category registry, built assets) into `dist/`, and PHP SHALL prefer `dist/` so a theme deployed without `packages/` works.

#### Scenario: Theme deployed alone
- **WHEN** `wp-content/themes/progressnow` is deployed without the repository root
- **THEN** the category registry loads and every island mounts
