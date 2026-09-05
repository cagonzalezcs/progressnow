## 1. Setup

- [x] 1.1 Re-pull the canvas and diff the Interior and 404 artboards (and any new tablet artboards) against the local copy; fold in changes

## 2. Interior pages

- [x] 2.1 `RouteAbout.vue` + `page-about.twig`: `PageHeader` with breadcrumb, mission band, article + sidebar (`CtaCard`, Documents `LinkListCard`, `DashedNote` contact), committee cards, subscribe strip; section-visibility navigation preserved
- [x] 2.2 `FaqAccordion.vue` restyled as bordered radius-14 rows (reka accordion semantics kept)
- [x] 2.3 `RouteGetInvolved.vue` + `page-get-involved.twig`, `RoutePage.vue` + `page.twig` on the same layout

## 3. 404

- [x] 3.1 `RouteNotFound.vue`, `error.vue`, `404.twig`: v4 blue band with stars, giant "404", two pills; strings in `inc/i18n.php`; PHP status 404 verified

## 4. Cleanup

- [x] 4.1 Grep gate for v3 tokens/tones/fonts across `src`, `site/app`, `views`, `inc`; migrate any page outside the canvas (search, author, password, styleguide) to v4 recipes
- [x] 4.2 Delete the alias block in `tailwind.css`, old tone tolerance in `useA11ySettings.ts`, Manifold `@font-face` + `static/fonts/manifold/`, `hero-photo@2x` code, remaining v3 assets; update `bin/scrub-brand.sh` if it names them
- [x] 4.3 Docs: theme README, brand README, `site/README.md` (shared-source list, fonts, tones, radius)

## 5. Verification

- [x] 5.1 Copy shared source to `site/app`; drift test green; theme `lint`/`typecheck`/`test`/`build` + PHPUnit; `site` `lint`/`typecheck`/`test`; `generate:mock` + `verify:output`
- [x] 5.2 Headless pass (EN + ES, both renderers, 1440 + 390 + 768, HC on/off, reduced motion) against the canvas screenshots; no horizontal overflow at 320; record residual differences in the change
