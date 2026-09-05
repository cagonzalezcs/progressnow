## 1. Setup

- [x] 1.1 Re-pull the canvas and diff `Progress Now Home v4*.dc.html` against the local copy; fold in any changes (tablet artboards, CTA tweaks)

## 2. Data and contracts

- [x] 2.1 `inc/options.php`: add `cta_line` (per-language front-page field, default `pll__('Progress now, not someday!')`), `progressnow_front_cta()`, context key `cta`; regroup hero/CTA fields if clearer; register strings in `inc/i18n.php`
- [x] 2.2 Remove `hero_headline_image`: ACF field, `inc/identity.php` resolver, `identitySchema` key, `tests/fixtures/*.json`, `site/app/lib/fixtures`, template branches
- [x] 2.3 `src/lib/schemas.ts` front envelope `cta: { line }`; update `tests/fixtures/front-page.json`, PHP fixture test and `site/test/unit` contract test; copy schema to `site/app`

## 3. Templates

- [x] 3.1 `views/front-page.twig` hero: text headline with deep-blue offset, `currentColor` stars in `text-brand-light`, duotone photo (.38), mobile stack (56px padding, 2rem `h1`, 240px photo)
- [x] 3.2 `views/front-page.twig` who-we-are: duotone photo (.30, radius 24/18) + star, right-aligned desktop column, mobile order eyebrow → heading → photo → paragraphs → link
- [x] 3.3 `views/front-page.twig` events band (`alt` tone, row-link cards, mobile 60px tile + date-only meta) and empty state (v4 dashed)
- [x] 3.4 `views/front-page.twig` blog band (radius-24 featured + row cards, blue pills, mobile radius-18 + 96px rows) and empty state
- [x] 3.5 `views/front-page.twig` closing CTA: desktop mask flame band + `#A9C7FF` band + panel + 44 %-inset overlay; mobile star-badge card; mask CSS in `tailwind.css`; delete `.closing-cta`
- [x] 3.6 `RouteFront.vue` ported 1:1 with identical class literals; copy any shared-source edits to `site/app`

## 4. Verification

- [x] 4.1 Theme + `site` lint/typecheck/test; PHP fixture tests; `generate:mock` + `verify:output`
- [x] 4.2 Screenshot both renderers at 1440 / 1200 / 900 / 700 / 390 (EN + ES, HC on/off) against the Home artboards and `screenshots/crop-*.png`; fix drift *(done on the Nuxt mock rendition at 1440/1200/900/700/390, EN + ES, HC on/off — no overflow; the PHP shell is not bootable from this worktree, verify after merge)*
