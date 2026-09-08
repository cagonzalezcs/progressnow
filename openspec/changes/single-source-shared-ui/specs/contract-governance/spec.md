## MODIFIED Requirements

### Requirement: Single contract definition
Contract types SHALL be defined once as zod schemas in `packages/contracts` — the source of truth — with TS types derived via `z.infer`; canonical category slugs derive from that package's `categories.json`. Each consuming app (the theme, `nuxt-js/`, `next-js/`) SHALL import the package rather than carry a copy, so a contract field is edited in exactly one place. The shell payload envelope, `/site`, `/routes`, `/front-page`, `/pages/{path}`, `/events/{slug}`, and `shell-manifest.json` SHALL have schemas in that definition too.

#### Scenario: One edit point
- **WHEN** a contract field is added
- **THEN** the type change originates in `packages/contracts` and every consumer's typecheck reflects it without a copy step
