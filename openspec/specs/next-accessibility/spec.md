# next-accessibility Specification

## Purpose
Accessibility contract for the Next.js frontend: landmarks and focus behavior across client navigation, motion preferences, the settings widget's parity with the theme, keyboard-complete interactions, and the axe-core gate that holds the app to WCAG 2.2 Level AA.

## Requirements

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
Every interaction SHALL be operable by keyboard: the calendar month grid is one tab stop whose roving tabindex sits on each day's `<button>` (in every renderer of the island — next-js, the theme Vue islands and nuxt-js), arrow keys move it by day and week, Home / End go to the week's edges and PageUp / PageDown to the previous / next month, each day button exposes the date and its event count, `aria-current="date"` marks today, Enter / Space on a day at ≥ 700px opens its event (or focuses its chips when there are several) and under 700px selects the day (`aria-pressed`), and the day agenda is a polite live region so the selection is announced without moving focus; the view toggle and the list's past toggle use `aria-pressed`; dialogs trap and restore focus and close on Escape; the mobile nav and a11y popover close on Escape and return focus to their trigger; accordions follow the disclosure pattern.

#### Scenario: Calendar by keyboard
- **WHEN** a keyboard user at ≥ 700px focuses the month grid and presses ArrowRight then Enter on a day with an event
- **THEN** focus moves to the next day's button and the event detail dialog opens with focus inside it

#### Scenario: Compact day by keyboard
- **WHEN** a keyboard user under 700px presses ArrowRight to a day with two events and then Space
- **THEN** that day's button reports `aria-pressed="true"`, focus stays on it, and the day agenda region lists the two events and is announced politely

#### Scenario: Dialog escape
- **WHEN** Escape is pressed in the event detail dialog
- **THEN** the dialog closes and focus returns to the triggering day button or chip

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
CI SHALL run axe-core (via `@axe-core/playwright`, one pinned `axe-core` version) against the production build served with the mock API, over every route kind × `en|es` × widget mode (default, high contrast, xl text, reduce motion) × interactive state (mobile nav open, a11y popover open, calendar list view, archive with a query, event dialog open, and — at a 390px viewport — the calendar day agenda with a selected event day, an empty selected day, and the grouped list with past days shown), with rules `wcag2a, wcag2aa, wcag21aa, wcag22aa` as errors and `best-practice` as warnings until the chrome and routes milestones land, then as errors. Zero violations SHALL be the pass bar for the app's own code; violations confined to the vendored shadcn registry examples inside the styleguide's kitchen sink SHALL be reported separately as a node-count baseline that MAY only decrease (`test/e2e/a11y/kitchen-sink-baseline.json`, target zero), so upstream demo debt is visible without masking regressions in site code; per-page JSON reports SHALL be emitted as CI artifacts.

#### Scenario: Violation fails CI
- **WHEN** a control loses its accessible name on the Spanish calendar in high-contrast mode
- **THEN** the `test:a11y` job fails naming the rule, the selector, the route, and the mode

#### Scenario: Matrix coverage
- **WHEN** the a11y job runs
- **THEN** every route kind has been scanned in both languages and all four widget modes, and the report lists each scan

#### Scenario: Compact calendar states are scanned
- **WHEN** the a11y job scans the calendar at 390px
- **THEN** the day agenda (with and without events on the selected day) and the grouped list with past days shown report zero violations, including color contrast on past-day cards

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
