## Context

Two renderers draw every page and must stay pixel-coherent: the Twig shell (`wp-content/themes/progressnow/views/**`) and the Nuxt 4 app (`site/`), sharing one Tailwind v4 stylesheet and one set of Vue site components (theme `src/**` is the source; `site/app/**` is a copy). Brand values live on tokens in a plain `@theme` block so a token change reaches every consumer; the Aa widget's high-contrast mode re-declares tokens under `html.a11y-contrast` and paints bands by `data-tone`.

The v4 canvas is a system change (palette, body face, page ground, tones, photos, wordmark). Source facts used below come from the `.dc.html` files imported to `wp-content/themes/design_handoff_vue/v4/` (gitignored; re-import recipe in memory `legacy-claude-design-import`). Contrast (computed): white on brand 7.1:1; accent on white 5.4:1, on alt 4.9:1; deep on white 11.1:1; muted `#4A5568` on white 7.5:1; `#C3CBE2` on ink 10.6:1; light-blue dashed border on brand 4.2:1 (non-text ✓); white on `#A9C7FF` 1.7:1 — never text on the light band.

Owner decisions taken 2026-09-05: mobile a11y controls = text size only; social icons stay; shadcn radius 4px; v3 aliases are deleted within the v4 series; tablet artboards are being reworked in Claude Design — the canvas will grow, so each v4 change re-pulls it first.

## Goals / Non-Goals

**Goals:** one token system that turns every page blue at once; header/footer at v4 in both renderers; no regression in EN/ES, a11y settings, keyboard/focus, view transitions, contracts; self-hosted fonts only; fully responsive 320–1920 with two layout tiers.

**Non-Goals:** page compositions (home, blog, calendar, event, interior, 404 — later changes); content changes; deployment; vectorizing the raster flame tile.

## Decisions

### D1 — Role-named tokens, v3 names as temporary aliases
Add `--color-brand`, `--color-brand-deep`, `--color-accent`, `--color-brand-light`, `--color-alt`, `--color-ink`, `--color-yellow`, `--color-muted`, `--color-muted-on-ink`, `--color-text-body`, `--color-line`, `--color-control`, `--color-control-faint`, `--color-border-muted`, `--color-cta-card`, `--color-ink-hairline`; shadcn vars follow (`--primary` brand, `--background #FFFFFF`, `--muted` alt, `--accent` accent, `--ring` ink, `--border/--input` control, `--radius 4px` → `sm/md/lg/xl` 4/6/8/12). v3 color-named tokens are re-declared as aliases of role tokens so un-migrated class literals render blue; `progress-now-v4-interior-404` deletes them after a grep gate.
*Alternatives:* new values under old names (names lie); hard rename (site broken mid-series).

### D2 — Public Sans as one variable file
`static/fonts/public-sans/PublicSans[wght].woff2` (OFL), `font-weight: 400 800`, `font-display: swap`; `--font-sans: "Public Sans", system-ui, sans-serif`; Manifold rules/files removed; preload Bowlby + Public Sans; `font-synthesis: none` stays.

### D3 — Tone vocabulary `blue | white | alt | ink`
`useA11ySettings.ts` HC: `white`/`alt` → `#FFFFFF`/`#000000`, `blue` → `#0F2E9C`, `ink` → `#000000`; `html.a11y-contrast` swaps brand/accent → `#0F2E9C`, brand-deep → `#071B5E`; focus ring white on `blue`/`ink`. Old tone names are tolerated by the widget until the last page migrates.

### D4 — Photo treatment in CSS
`DuotoneImage.vue` + `partials/duotone.twig`: wrapper `relative overflow-hidden`, `<img>` `grayscale(1) contrast(1.05)`, `::after` `var(--color-brand)` multiply at `--duotone-opacity` (hero .38, cards .30, figures .25, thumbnails 0); HC hides the overlay. Chapter uploads render on-brand unprocessed; the shipped placeholders become neutral photos.

### D5 — Wordmark lockup is the default logo
When `identity.logo_header/footer.is_default`: yellow diamond (20/18/16px, `rotate(45deg)`) + `identity.name` Bowlby uppercase (1.35/1.25/1.1rem) as the home link. Uploaded logo → `<img>` same height, `max-width:240px`. Islands get `logoIsDefault`; `logo-header.svg`/`logo-footer.svg` deleted.

### D6 — Header: three tiers, in-flow mobile panel, text size only on mobile
Desktop (`lg+`): lockup · nav (About ▾ `DropdownMenu`, Calendar, Blog, Get Involved) · EN/ES group, Aa popover (text size + HC + RM), Join Now — all white 42px pills. Tablet (`md`→`xl`, per the tablet artboard that landed during task 1.2; the one-row desktop needs ~1160px so desktop starts at `xl`): two rows on the same blue — lockup + EN/ES, Aa, Join Now as 44px pills (artboard says 40px; the ≥44px touch-target rule wins), then the nav row (About ▾ dropdown + links at 0.98rem, 44px tall). Below `md`: lockup · Join pill · 44px hamburger toggling an in-header panel (`aria-controls`, Escape + focus return, closes on navigation via `lib/menu`) with the flat nav, EN/ES and an A / A+ / A++ row bound to the same `textSize` store. HC/RM are desktop/tablet-only by owner decision. The vaul Drawer (and the dependency) and the v3 deep-red md→lg strip go away.

### D7 — Footer
`minmax(220px,1.1fr) repeat(3,minmax(170px,auto))` at `lg`, two columns at `md`, stacked below; lockup + tagline + social icon links (kept, data-driven) · three menu-driven columns; `#1848D8` bottom bar.

### D8 — Shell parity + drift guard
`site/test/unit/shared-source-drift.test.ts` fails when theme `src/{components/site,composables/useA11ySettings.ts,lib/schemas.ts,css/tailwind.css}` differ from `site/app` copies (font URLs normalized). `html-header.twig` critical background `#FFFFFF`. Visual checks with the headless recipe at 1440/390 (+768/1024 for wrap) against the canvas `screenshots/`.

### D9 — Artwork
Add `flames-tile-light.png` (mask source), `cta-panel.svg` (blue), `currentColor` stars, neutral `hero-photo.jpg`/`who-photo.jpg`; remove `flames-tile.svg`, `flames-full.svg`, `feature-art.svg`, `logo-header.svg`, `logo-footer.svg`, `hero-photo@2x.jpg` (+ its srcset code). README table rewritten.

## Risks / Trade-offs

- [Aliases linger past the series] → grep gate in `progress-now-v4-interior-404`; this change lists every alias in one block with a `/* DELETE in v4-interior-404 */` marker.
- [Public Sans metrics shift line counts] → `ch`-based max widths; check longest EN/ES strings.
- [Removing HC/RM from mobile] → OS-level settings still honored (`prefers-reduced-motion` respected in code; HC via OS zoom/contrast); desktop keeps the toggles; documented in the styleguide.
- [Drawer removal] → in-flow panel needs no trap/scroll lock; header test covers open/close/Escape/focus/navigation.
- [Chapter logos of odd aspect] → fixed height, `width:auto`, `max-width:240px`.
- [Canvas keeps changing (tablet rework)] → first task of every v4 change re-pulls the canvas and diffs against the local copy.

## Migration Plan

Foundation ships alone: after it, every page is "v3 layout in v4 paint" and the chrome is v4. Rollback = revert; no data changes. Then `-home`, `-blog`, `-events`, `-interior-404` (which also deletes aliases and v3 leftovers).

## Canvas re-pull (task 1.2, 2026-09-05)

The re-pull found the tablet rework landed: new `Progress Now {Home,Blog,Blog Post,Interior,Calendar} v4 Tablet` artboards (834px) plus `{404,Blog Post,Interior,Single Event} v4 Mobile`. Header/footer changes vs. the local copy:

- **Tablet header (834px) = two rows on the same blue:** lockup + EN/ES (40px) + Aa (40px) + Join Now (40px), then a nav row (About ▾, Calendar, Blog, Get Involved at 0.98rem). Applied here as a third tier (`md`→`xl`) instead of stretching the mobile panel to `lg`; the hamburger panel is `< md`. The one-row desktop header needs ~1160px (lockup + 1.06rem Bowlby nav + three pills), so at `lg` (1024) it wrapped the pill cluster onto a second line; the desktop tier therefore starts at `xl` (1280) and the two-row tablet layout covers 768–1279. D6 amended accordingly.
- **Tablet footer:** `1.2fr 1fr 1fr` (lockup + two nav columns in the mock). The footer is data-driven with three columns, so the `md` tier keeps two columns with the lockup spanning both (spec text); the third column wraps.
- **Mobile footer bottom bar** now splits the a11y line into two lines ("Built to be accessible." / "Tell us how we can do better." as the link). Kept as one wrapping line driven by the existing Polylang strings.
- Home-only diffs (communities strip, "Get involved" ink section with `#26262F` cards, flame tile `top center` + `margin-top:-2px`, `[data-ink-link]` hover) and the Calendar event modal belong to `-home` / `-events`.
- `assets/v4/*` and `support.js` unchanged; five new `screenshots/seam-*` exports.

Also landed here at the owner's request: a **static header/footer shell in `base.twig`** (same class recipes as the islands) so the PHP first paint already shows the blue bar and ink footer — the white→brand cross-fade on cross-document view transitions came from capturing the page before the header island mounted.

## Open Questions

- Footer at the tablet tier: keep the spec's two-column `md` layout or match the artboard's `1.2fr 1fr 1fr` (third data column would wrap)?
