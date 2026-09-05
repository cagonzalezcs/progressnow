# Design — Home v3 Brand Refresh

## Context

Theme stack: Timber/Twig templates + Tailwind v4 tokens in `src/css/tailwind.css` (`@theme` + `:root` vars), Vue islands for interactive chrome (`SiteHeader.vue`, `SiteFooter.vue` mounted from `base.twig`), data via `inc/*.php` context filters. Home body is pure Twig (`views/front-page.twig`) with v2 skin. Handoff: `design_handoff_vue/06-V3-BRAND-REFRESH.md`; canonical prototype `designs/the chapter Home v3.dc.html`; assets in `design_handoff_vue/design-assets/` (SVG/ canonical, fonts, `1x/` PNGs, `front-page.png` designer mock). Only Home is v3; interior pages remain v2 until a future delta — but shared header/footer go v3 site-wide now.

Existing behavior that must survive unchanged: About dropdown, Polylang EN/ES switcher, Aa a11y widget (`useA11ySettings.ts`, `legacy-a11y`, `data-tone` bands), skip link, sticky header, language-aware content.

## Goals / Non-Goals

**Goals:**
- Pixel-faithful v3 Home per prototype (colors, type, spacing, radii, supplied art).
- v3 token + font system available theme-wide; v3 chrome on all pages.
- Preserve all v2 behavior/i18n/a11y contracts; keep WCAG AA (adjusted `#DC1520` red — never revert to `#EB2028`).
- Production assets from SVG sources (crisp, recolorable), not prototype 1x PNGs.

**Non-Goals:**
- Re-skinning interior pages (calendar, about, blog, events, styleguide) — future delta.
- New CMS fields beyond what v3 sections need; no content invention (blog stays real-posts-driven; empty states own pre-seed).
- Replacing the Twig-body + Vue-island architecture.

## Decisions

1. **Tokens are additive, namespaced v3** — add v3 palette (`--color-v3-red: #DC1520`, orange, yellow, greens, creams, inks) and font tokens to `tailwind.css` alongside v2 tokens; Home + chrome consume v3, interior pages keep v2 untouched. Alternative (wholesale replace) rejected: would silently re-skin v2 interior pages mid-flight. Cleanup consolidation happens in the interior-pages delta.
2. **Fonts self-hosted in `static/fonts/v3/`**, converted to woff2 (originals kept in handoff). Faces: Bowlby One 400, Manifold 500/600/700/800, Special Season Brush 400. Jost/Myriad NOT shipped (unused on v3 Home; add in interior delta). `font-display: swap`.
3. **SVG-first assets** in `static/images/v3/` with semantic names (map `design-assets/SVG/Asset N.svg` → `hero-headline`, `county-map`, `flames-full`, `cta-panel`, `star*`, `sparkle`, logo lockups by visual content during implementation). Exceptions per handoff: `hero-photo` = designer's duotone PNG (request/re-export 2x); cta-figure falls back to 2x PNG only if spray texture rasterized poorly in SVG. `social-icons.png` never ships — real inline-SVG icon links instead. Header logo SVG kept transparent; `#DC1520` bg set in CSS.
4. **Header/footer re-skinned in place** (`SiteHeader.vue`, `SiteFooter.vue`) — same props/behavior, new classes/logo assets. Alternative (v3 variants side-by-side) rejected: chrome is v3 site-wide per handoff, no need for two.
5. **Hero headline is a supplied image inside `<h1>`** with alt "A better the region is possible!" — designer mandate after CSS recreation failed. ACF hero heading field stops driving the `<h1>` on Home; subhead/CTA remain data-driven (`hero.lede`-equivalent, `chapter.join_url`).
6. **Removed sections: template-only removal.** Counties strip + get-involved steps leave `front-page.twig`; their context providers (`legacy_chapter_counties`, `legacy_front_involved`) stay in `inc/options.php` (counties reused elsewhere; cleanup deferred). Closing CTA CTA is a new static Twig section (flames + cta-figure art, brush line CSS-uppercased to preserve `¡`/`!`, JOIN pill → `chapter.join_url`).
7. **CTA overlay geometry proportional** per prototype (`left/right:3.2%; bottom:4.1%; padding-left:44%`); below ~700px stack text under the panel top rather than shrink type — per handoff gotcha #2.
8. **High-contrast mode extends the existing `data-tone` pattern**: v3 bands carry `data-tone` (`red`/`cream`/`ink`/`orange`/`green`); high-contrast swaps `--color-v3-red→#B5121B`, `--color-v3-green-dark→#3F5A23` via the same `useA11ySettings` root-class hook (CSS var overrides, no JS changes expected).
9. **Events/blog stay data-driven** with v3 styling only: same context (`home_events`, `blog_featured`/`blog_rows`), restyled rows/cards/chips; v3 empty states (`#B9B3A9` dashed / prototype copy) render on zero data. All new user-facing strings registered `pll__()` with ES translations.
10. **Verification = prototype diff**: build, then side-by-side against `the chapter Home v3.dc.html` at desktop/~1000px-stack/mobile widths, plus `front-page.png` tie-break; run a11y checks (contrast, `alt`, heading order, `prefers-reduced-motion`/Aa states). Claude Design share link available for ambiguity.

## Risks / Trade-offs

- [SVG exports unlabeled (`Asset N.svg`) → wrong asset mapping] → Visually inspect each against prototype PNGs before wiring; record mapping in a manifest comment.
- [Luchador spray texture may degrade in SVG] → Handoff pre-authorizes 2x PNG fallback for that one asset.
- [Headline art is English; `/es/` home shows EN art] → Open question below; interim: same art with Spanish `alt`.
- [Bowlby/Manifold metrics differ from Montserrat → layout shifts on shared components] → Chrome-only font swap is contained to header/footer/Home; interior pages keep v2 faces via scoped tokens.
- [v2+v3 token coexistence bloats CSS] → Acceptable short-term; consolidation scheduled for interior-page delta.
- [Removing get-involved section orphans its ACF copy/tests] → Template removal only; tests updated in this change; ACF cleanup deferred.
- [Orange `#FF4100` ~3.5:1 on white] → Restricted to large/bold uppercase links per handoff; never body text.

## Migration Plan

Work on feature branch; `npm run build` + tests green; visual diff vs prototype; deploy is a normal theme deploy (assets ship with theme). Rollback = revert commit(s); no data/schema migrations (template + CSS + assets only).

## Open Questions

1. `/es/` hero headline art — reuse EN image w/ ES alt, or request ES export from designer?
2. Real social profile list + URLs for footer icons (only Instagram `@chapterhandle` known today)?
3. Who supplies ES translations for new v3 copy (who-we-are final paragraphs, empty-state copy)?
4. `hero-photo` 2x re-export available from designer, or ship 1x?
