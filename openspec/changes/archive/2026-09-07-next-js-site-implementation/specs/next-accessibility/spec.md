## ADDED Requirements

### Requirement: Landmarks and skip link
Every document SHALL expose one `<header>`, one `<main id="main" tabindex="-1">`, one `<footer>`, and `<nav aria-label>` per navigation region; the first focusable element SHALL be a skip link labelled with `strings.skip_link` that moves focus to `<main>`.

#### Scenario: Skip link works
- **WHEN** a keyboard user presses Tab once on any route and activates the skip link
- **THEN** focus lands on `<main>` and the next Tab reaches the first content control

### Requirement: Focus and announcement on client navigation
After a client-side route change focus SHALL move to `<main>` (not the document top) and the new page title SHALL be announced to assistive technology; hash navigations SHALL move focus to the target element.

#### Scenario: Post navigation
- **WHEN** a screen-reader user activates a post card link
- **THEN** the post title is announced and `document.activeElement` is `<main>`

### Requirement: Motion preferences
When `prefers-reduced-motion: reduce` is set or the widget's reduce-motion setting is on, the app SHALL disable view transitions and non-essential animations (including `tw-animate-css` utilities) while keeping essential state changes visible.

#### Scenario: Widget reduce motion
- **WHEN** reduce motion is enabled in the widget
- **THEN** route changes have no view transition and popovers open without animation

### Requirement: Accessibility settings widget parity
The widget SHALL offer text size (`default` 16 px, `large` 18 px, `xl` 20 px applied to `html`), high contrast (`data-tone` token swaps), and reduce motion; settings SHALL persist under `localStorage["chapter-a11y"]` with the same JSON shape as the theme, migrate `rgv-dsa-a11y` once, apply before first paint without a flash, and announce changes via `role="status"`.

#### Scenario: Persisted before paint
- **WHEN** a returning visitor with `xl` text loads any route
- **THEN** the first painted frame already has 20 px root font size

#### Scenario: Legacy key migrated
- **WHEN** only `rgv-dsa-a11y` exists in storage
- **THEN** its settings apply, are written to `chapter-a11y`, and the legacy key is removed

### Requirement: Keyboard-complete interactions
Every interaction SHALL be operable by keyboard: the calendar month grid is navigable with arrow keys and exposes day/event names; the view toggle uses `aria-pressed`; dialogs trap and restore focus and close on Escape; the mobile nav and a11y popover close on Escape and return focus to their trigger; accordions follow the disclosure pattern.

#### Scenario: Calendar by keyboard
- **WHEN** a keyboard user focuses the month grid and presses ArrowRight then Enter on a day with an event
- **THEN** focus moves to the next day and the event detail dialog opens with focus inside it

#### Scenario: Dialog escape
- **WHEN** Escape is pressed in the event detail dialog
- **THEN** the dialog closes and focus returns to the triggering day cell

### Requirement: Names, roles, and live states
Every icon-only control SHALL have an accessible name from `strings`; the archive results region SHALL expose `aria-busy` while pending and a `role="status"` result count; the calendar month heading SHALL be `aria-live="polite"`; loading placeholders SHALL be `aria-hidden` with a visible `role="status"` message.

#### Scenario: Pending results announced
- **WHEN** a search is in flight
- **THEN** the results region has `aria-busy="true"` and the status line reads the loading string; on completion the count is announced

### Requirement: Content semantics
Rendered content SHALL preserve heading order (one `<h1>` per document), carry the envelope's `alt` on every content image, and use empty `alt` for decorative artwork; kses-sanitized HTML SHALL be rendered without introducing inline scripts or event handlers.

#### Scenario: Single h1
- **WHEN** any route renders
- **THEN** exactly one `<h1>` exists and heading levels do not skip

### Requirement: axe-core gate against the production build
CI SHALL run axe-core (via `@axe-core/playwright`, one pinned `axe-core` version) against the production build served with the mock API, over every route kind × `en|es` × widget mode (default, high contrast, xl text, reduce motion) × interactive state (mobile nav open, a11y popover open, calendar list view, archive with a query, event dialog open), with rules `wcag2a, wcag2aa, wcag21aa, wcag22aa` as errors and `best-practice` as warnings until the chrome and routes milestones land, then as errors. Zero violations SHALL be the pass bar for the app's own code; violations confined to the vendored shadcn registry examples inside the styleguide's kitchen sink SHALL be reported separately as a node-count baseline that MAY only decrease (`test/e2e/a11y/kitchen-sink-baseline.json`, target zero), so upstream demo debt is visible without masking regressions in site code; per-page JSON reports SHALL be emitted as CI artifacts.

#### Scenario: Violation fails CI
- **WHEN** a control loses its accessible name on the Spanish calendar in high-contrast mode
- **THEN** the `test:a11y` job fails naming the rule, the selector, the route, and the mode

#### Scenario: Matrix coverage
- **WHEN** the a11y job runs
- **THEN** every route kind has been scanned in both languages and all four widget modes, and the report lists each scan

### Requirement: Component-level and static checks
Every site component SHALL have a jest-axe (axe-core) assertion in its component test, and `eslint-plugin-jsx-a11y` (strict) SHALL run in lint; neither substitutes for the build gate.

#### Scenario: Component regression
- **WHEN** a component test renders a control without a label
- **THEN** the jest-axe assertion fails in `test:unit`

### Requirement: Conformance target
The app SHALL target WCAG 2.2 Level AA; the accessibility statement SHALL list the Next.js frontend, the axe-core gate, and known exceptions.

#### Scenario: Statement updated
- **WHEN** the change ships
- **THEN** `docs/accessibility-statement.md` names the Next.js frontend and its testing method
