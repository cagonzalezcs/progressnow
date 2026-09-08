## ADDED Requirements

### Requirement: One entry point for the whole repository
The repository root SHALL provide `npm run lint`, `typecheck`, `test`, `build`, `format:check`, and `ci` that run the corresponding script in every workspace, and CI SHALL invoke those same scripts.

#### Scenario: Local reproduction of CI
- **WHEN** a contributor runs `npm install && npm run ci` at the root on the pinned Node version
- **THEN** every check that CI runs for the JavaScript packages runs locally with the same result

### Requirement: Shared tool configuration is imported, not copied
Prettier, the ESLint base ruleset, and the vitest baseline SHALL be defined once at the root and imported by each package; per-package files SHALL contain only package-specific overrides.

#### Scenario: Formatting rule changed once
- **WHEN** a Prettier option changes in the root config
- **THEN** `format:check` in every package reflects it without another edit

### Requirement: Tool versions are aligned
Each development tool (ESLint, TypeScript, vitest, Prettier) SHALL be on one major version across all packages, and the theme's Composer manifest SHALL declare the minimum PHP version and platform.

#### Scenario: Version drift detected
- **WHEN** a package's `devDependencies` pin a different major of a shared tool
- **THEN** a root check (`npm run check:versions`) fails naming the package and tool
