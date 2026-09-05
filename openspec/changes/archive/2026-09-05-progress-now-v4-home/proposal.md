## Why

The home page is the chapter's front door and the first artboard pair on the v4 canvas (Home — Desktop 1440, Home — Mobile 390). With `progress-now-v4-foundation-chrome` supplying tokens, fonts, tones, photo treatment and header/footer, this change brings the page composition itself to v4 in both renderers. Change 2 of 5.

## What Changes

- **Hero:** real-text Bowlby headline with the `#0F2E9C` offset, blue star art, dashed light-blue secondary CTA, duotone photo; mobile stacks copy above a 240px photo. **BREAKING:** the `hero_headline_image` Chapter Settings override is removed.
- **Who we are:** duotone photo + star replaces the feature artwork; right-aligned copy on desktop, eyebrow/heading/photo/paragraphs on mobile.
- **Upcoming events:** `alt` band, row-link cards with brand date tiles, mobile compact rows.
- **From the blog:** radius-24 cards with blue pills; mobile stack.
- **Closing CTA:** editor-owned `cta_line` (default "Progress now, not someday!"); desktop flame-mask band + light band + blue panel with 44 %-inset overlay; mobile star-badge card. **BREAKING:** the Closing CTA band, `.closing-cta` CSS and its artwork are removed.
- ACF: any hero/who/CTA field may be renamed or regrouped as needed (owner-approved); the front envelope gains `cta.line`.

## Capabilities

### New Capabilities
- none

### Modified Capabilities
- `front-page`: template order/tones, hero, who-we-are (v4), events band + empty state (v4), blog teasers, closing CTA (v4); Closing CTA and headline-artwork requirements removed.

## Impact

- Theme: `views/front-page.twig`, `inc/options.php` (`cta_line`, front hero/who groups), `inc/identity.php` (drop `hero_headline_image`), `inc/i18n.php`, `tests/fixtures/front-page.json`, `tests/test-blog-front-page.php`, `src/css/tailwind.css` (flame mask rule; `.closing-cta` removed), `src/lib/schemas.ts`.
- Nuxt: `app/components/routes/RouteFront.vue`, `app/lib/fixtures`, `site/test/unit` contract tests.
- Depends on `progress-now-v4-foundation-chrome` (tokens, `DuotoneImage`, stars, panel/flame assets).
