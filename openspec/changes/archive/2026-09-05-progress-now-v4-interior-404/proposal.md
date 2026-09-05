## Why

The remaining canvas artboards — Interior (About / Get Involved) — Desktop 1440 and 404 — Desktop 1440 — cover every page not yet at v4. This last change of the series also retires the v3 scaffolding the earlier changes left in place (token aliases, tolerated tone names, Manifold, v3 art) and runs the site-wide verification. Change 5 of 5.

## What Changes

- **Interior pages (About, Get Involved, generic page):** v4 page header + breadcrumb; ink "What we believe" mission band; article + sticky sidebar (Get involved card, Documents list, dashed Contact box); committee cards; FAQ as bordered disclosure rows; ink subscribe strip. Section-visibility toggles and in-page navigation preserved.
- **404:** blue full-bleed band with giant Bowlby "404", star art, Back home / See the calendar pills, translatable strings.
- **Cleanup (BREAKING):** delete the v3 token aliases, old `data-tone` names, Manifold files, `hero-photo@2x` code path and any v3-only asset; update docs.
- **Verification:** full lint/typecheck/test in both trees, PHPUnit, `generate:mock` + `verify:output`, headless screenshot pass (EN/ES, both renderers, 1440/390, HC on/off, reduced motion).

## Capabilities

### New Capabilities
- `interior-presentation`: presentation contract for interior templates (header, mission band, article + sidebar, committees, FAQ, subscribe strip) and the 404 page.

### Modified Capabilities
- none (`editable-page-sections`, `internationalization` behavior unchanged; the alias deletion fulfils the `design-tokens` requirement already specified by the foundation change).

## Impact

- Shared source: `components/site/{PageHeader,FaqAccordion}.vue` + `CtaCard`/`LinkListCard`/`DashedNote`; `css/tailwind.css` (alias block removed); `composables/useA11ySettings.ts` (old tone tolerance removed).
- Theme: `views/{page-about,page-get-involved,page,404}.twig`, `inc/i18n.php` (404 strings), `static/fonts/manifold/` removed, `bin/scrub-brand.sh` if it names v3 assets, READMEs.
- Nuxt: `routes/{RouteAbout,RouteGetInvolved,RoutePage,RouteNotFound}.vue`, `error.vue`, `site/README.md`.
- Depends on all four earlier v4 changes.
