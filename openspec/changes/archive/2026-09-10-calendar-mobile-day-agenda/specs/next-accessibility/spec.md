## MODIFIED Requirements

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
