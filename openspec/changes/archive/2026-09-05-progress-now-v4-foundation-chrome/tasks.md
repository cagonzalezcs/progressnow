## 1. Reference material and setup

- [x] 1.1 Copy the imported canvas sources (`Progress Now * v4*.dc.html`, `support.js`, `assets/v4/**`) and the project's `screenshots/` exports into `wp-content/themes/design_handoff_vue/v4/` (gitignored) for side-by-side checks
- [x] 1.2 Re-pull the canvas (memory `legacy-claude-design-import`), diff against the local copy, and note any new tablet artboards or header/footer changes before starting 3.x
- [x] 1.3 Add Public Sans variable woff2 (official OFL release) as `static/fonts/public-sans/PublicSans[wght].woff2` + license file
- [x] 1.4 Brand assets: add `flames-tile-light.png`, `cta-panel.svg` (from `cta-panel-blue.svg`), `star.svg`/`star-notch.svg`/`sparkle.svg` with `fill="currentColor"`, neutral `hero-photo.jpg` (drop `@2x` + srcset path in `inc/identity.php`) and `who-photo.jpg`; delete `flames-tile.svg`, `flames-full.svg`, `feature-art.svg`, `logo-header.svg`, `logo-footer.svg`; rewrite the brand README table
- [x] 1.5 Add `site/test/unit/shared-source-drift.test.ts` comparing theme `src/{components/site,composables/useA11ySettings.ts,lib/schemas.ts,css/tailwind.css}` to the `site/app` copies (font URLs normalized); wire into `npm test`

## 2. Foundation: tokens, fonts, tones, photo treatment

- [x] 2.1 `src/css/tailwind.css`: v4 role tokens, shadcn variables (`--background #FFFFFF`, `--radius 4px`), one clearly marked block of v3 aliases (D1); `views/html-header.twig` critical background `#FFFFFF`
- [x] 2.2 `@font-face`: Public Sans variable (400–800), remove Manifold rules and files, `--font-sans`, preload list → Bowlby + Public Sans
- [x] 2.3 Tones: `useA11ySettings.ts` HC rules for `blue|white|alt|ink` (old names tolerated until the last v4 change), `html.a11y-contrast` swaps, white focus ring on `blue`/`ink`, `.hero-headline` → v4 text-shadow, `.prose-chapter`/`.prose-post` on v4 tokens
- [x] 2.4 `DuotoneImage.vue` + `views/partials/duotone.twig` with per-slot opacity and HC override (D4)
- [x] 2.5 Styleguide (`Styleguide.vue`, `styleguide/*`, `page-styleguide.twig`) → v4 kit: palette, type, pills, chips, cards, tones, duotone demo, radius scale
- [x] 2.6 Copy shared source to `site/app`; `npm run lint && npm run typecheck && npm test` in theme and `site/`; boot both renderers and confirm no red/orange/cream remains *(Nuxt mock rendition booted + audited; the PHP shell is not bootable from this worktree — MAMP serves the root checkout — verify after merge)*

## 3. Shared chrome

- [x] 3.1 `SiteHeader.vue` desktop (`lg+`): lockup / uploaded logo via `logoIsDefault`, Bowlby nav with About ▾ restyle, white 42px pill controls; remove the md→lg two-tier strip
- [x] 3.2 `SiteHeader.vue` mobile (<`lg`): Join pill + 44px hamburger + in-header panel (nav, EN/ES, A/A+/A++ row bound to `textSize`) with `aria-controls`, Escape/focus return, close on `data-navigating`; remove vaul `Drawer` usage (drop the dependency if unused)
- [x] 3.3 `LanguageToggle.vue` (white group, brand active segment, `aria-current`) and `A11yWidget.vue` (desktop-only white pill trigger, v4 popover with segmented text size and HC/RM On/Off pills)
- [x] 3.4 `SiteFooter.vue`: v4 grid, lockup + tagline + social icons, three columns, `#1848D8` bottom bar
- [x] 3.5 `base.twig`, `inc/identity.php`, `layouts/default.vue`: pass `logoIsDefault`, tagline, contact email; lockup defaults chapter-neutral
- [x] 3.6 Tests: `language-switcher-refresh.test.ts` green; new header test for panel open/close/Escape/focus/text-size
- [x] 3.7 Copy to `site/app`; responsive audit of header/footer at 320 / 390 / 768 / 1024 / 1440 (no horizontal overflow, 44px targets) against the canvas *(done on the Nuxt rendition at all five widths: no overflow, ≥44px targets below `lg`; Twig shell mirrors the same class recipes, re-check after merge)*
