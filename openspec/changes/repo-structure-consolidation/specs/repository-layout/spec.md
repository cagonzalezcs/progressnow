## ADDED Requirements

### Requirement: Tracked tree contains only source, specs, docs, config, and provenance-bearing assets
The repository SHALL NOT track build output, generated caches, or AI session artifacts; every top-level directory SHALL be described in the root README's layout section.

#### Scenario: No stale build tree
- **WHEN** `git ls-files` is inspected
- **THEN** no path under `site/`, `*/.output/`, `*/.nuxt/`, or `Claude outputs/` is returned

#### Scenario: Layout section is complete
- **WHEN** a top-level directory exists in the tracked tree
- **THEN** the README layout section names it

### Requirement: Exactly one OpenSpec root
All specifications and changes SHALL live under the repository-root `openspec/`; no nested `openspec/` directory SHALL exist in any app.

#### Scenario: Nested root removed
- **WHEN** `find . -name openspec -type d -not -path ./openspec` runs over tracked paths
- **THEN** it returns nothing and `openspec list` at the root shows every open change

### Requirement: Shipped third-party assets carry provenance
Every self-hosted font SHALL ship with its licence file, and every brand placeholder image SHALL have its source and licence recorded in the brand README; an asset whose licence forbids redistribution SHALL NOT be tracked.

#### Scenario: Font without licence
- **WHEN** a `.woff2` is added without a licence file in its directory
- **THEN** the release checklist step fails

### Requirement: Package metadata names this project
The theme's Composer and npm manifests SHALL name this project and its maintainer, crediting upstream starters in descriptions rather than as package identity.

#### Scenario: Composer identity
- **WHEN** `composer validate` and `composer show --self` run in the theme
- **THEN** the package name is `progressnow/theme` and the licence is MIT
