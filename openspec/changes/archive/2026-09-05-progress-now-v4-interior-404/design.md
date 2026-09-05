## Context

Builds on the foundation, home, blog and events changes. Sources: `Progress Now Interior v4.dc.html`, `Progress Now 404 v4.dc.html`. Interior content comes from the editable page sections (`editable-page-sections`: prose fields, visibility toggles, nav that follows visibility) and `chapter.committees` / documents / contact from chapter context. After this change no v3 token, tone or asset may remain.

## Goals / Non-Goals

**Goals:** About, Get Involved, generic pages and 404 match the artboards in both renderers; toggles and anchors keep working; the series ends with a clean v4 codebase and a full verification record.
**Non-Goals:** new page sections; tablet-specific artboards (canvas rework pending — two tiers).

## Decisions

### D1 — One interior layout for three templates
`PageHeader` (breadcrumb Home / <title>) → optional ink mission band (eyebrow `brand-light` `.12em`, Bowlby statement `max-width:38ch`) → `minmax(300px,1fr) 310px` grid: article (Bowlby `h2`s, `text-body` prose, duotone figures, `alt` blockquotes) + sticky sidebar (`CtaCard` Get involved, `LinkListCard` Documents, `DashedNote` Contact — each omitted when empty) → ink subscribe strip. About adds committee cards (`auto-fit minmax(240px,1fr)`) and the FAQ; Get Involved reuses the same skeleton with its own sections; `RoutePage`/`page.twig` use header + article + sidebar. Section ids stay stable so the visibility-driven nav (`editable-page-sections`) is untouched.

### D2 — FAQ keeps the accordion, wears `<details>` styling
`FaqAccordion.vue` stays on reka `Accordion` (one open, keyboard, `aria-expanded`) and is restyled as bordered radius-14 rows — the artboard's `<details>` is a design-tool stand-in.

### D3 — 404 in both error paths
`404.twig` (PHP), `RouteNotFound.vue` (resolver miss) and `error.vue` (Nuxt error boundary) render the same band; strings registered in `inc/i18n.php`; status stays 404 from PHP.

### D4 — Cleanup is a gate, not a sweep
Order: grep gate (`text-red|bg-brand-red|orange|green-dark|cream|data-tone="(red|cream|orange|green)"|font-manifold|Manifold`) across `src`, `site/app`, `views`, `inc` must return nothing → delete the alias block, old tone tolerance, Manifold `@font-face` + files, `hero-photo@2x` code, v3 assets → re-run the gate and the drift test.

## Risks / Trade-offs

- [A page outside the canvas (search, author, password, styleguide) still uses a v3 literal] → the gate catches it; those pages get the nearest v4 recipe.
- [Long committee names] → cards wrap; `text-wrap:balance` on names.
- [Deleting aliases breaks a WP plugin/admin style that reused a token] → grep covers `inc/` and `views/`; plugin CSS is not scanned by Tailwind and never consumed theme tokens.

## Migration Plan

Interior → 404 → cleanup gate → verification. Rollback = revert; nothing destructive to content.

## Verification record (2026-09-05)

Canvas re-pull: all 23 v4 artboards byte-identical to the local copy. Gate (`text-red|bg-brand-red|orange|green-dark|cream|data-tone="(red|cream|orange|green)"|font-manifold|Manifold`) and the wider alias-token grep both return 0 across `src`, `site/app`, `views`, `inc`. Theme lint / typecheck / vitest (27) / build, PHPUnit 160/160 (the pre-existing `test_base_template_renders_the_nuxt_root…` failure fixed by restoring base.twig's `#__nuxt` + `__SHELL_DATA__` branch), `site` lint / typecheck / vitest (64, drift green), `generate:mock` + `verify:output` (15 routes). Headless pass (CDP, both renderers, EN + ES, 1440 / 768 / 390 / 320, HC on/off, reduced motion + A++): zero horizontal overflow on every page at every width.

Residual differences vs. the artboards (accepted):
- 404 keeps the full site footer (artboard shows the bottom bar only); `error.vue` has no site payload so its strings are the English `nf_*` sources.
- The article keeps the data-driven sections the artboard omits (timeline rows, area cards, governance rows with a "Read" pill, dues callout); the artboard's figure/blockquote appear only when a photo is uploaded / the editor uses one.
- Sidebar adds an "On this page" card (the visibility-driven nav, D1) and Get Involved adds "Related"; below `md` the nav is a chip row above the article.
- The tablet tier (260px sidebar, 120px sticky top) applies from `md` through `lg`; the 310px / 56px desktop grid starts at `xl` (the spec says `lg`, the tablet artboard at 834px is the tighter reference).
- The sidebar CTA card is Chapter Settings data ("New here?" copy in the local DB); the shipped default is "Get involved → Join Now".
- Also folded in: the Mobile Menu artboard — the `<md` panel is now a fixed full-viewport panel (uppercase Bowlby nav, Join Now pill, EN/ES + text size at the bottom).
- Photos render full color (owner decision, foundation change).

## Open Questions

- none.
