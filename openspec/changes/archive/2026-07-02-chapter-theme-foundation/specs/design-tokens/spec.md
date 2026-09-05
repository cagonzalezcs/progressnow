# design-tokens

## ADDED Requirements

### Requirement: Brand token custom properties
`global/_global.scss` SHALL define `:root` CSS custom properties for the DSA palette — red `#dd1111`, dark red `#7c0909`, cream `#fff5e5`, black, white — plus spacing/max-width tokens, and map brand colors onto webawesome `--wa-color-brand-*` variables so `wa-*` components inherit the brand.

#### Scenario: Tokens applied globally
- **WHEN** the compiled stylesheet loads
- **THEN** the page background is cream and components reference `var(--color-*)` tokens

### Requirement: Global baseline styles
The theme SHALL ship a light reset (border-box sizing, zero body margin, fluid images) and a `.wrapper` layout utility (max-width, centered, inline padding) in `_global.scss`.

#### Scenario: Wrapper constrains content
- **WHEN** a section uses `.wrapper`
- **THEN** its content is centered with a max width and side padding

### Requirement: Button system
`ui/_button.scss` SHALL provide a `.btn` class usable on anchors (red fill, uppercase Montserrat, hover state) and brand overrides for `wa-button`. All SCSS partials in use (`button`, `hero`, header partials, `home`) SHALL be registered in the `app.scss` `@use` manifest.

#### Scenario: Anchor CTA styled
- **WHEN** an `<a class="btn">` renders
- **THEN** it appears as a red uppercase button with hover feedback

#### Scenario: Manifest complete
- **WHEN** `npm run build` compiles SCSS
- **THEN** all populated partials are included and stylelint passes
