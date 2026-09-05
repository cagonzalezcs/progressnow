# Tasks — home-v3-brand-refresh

## 1. Assets & fonts

- [x] 1.1 Inspect `design_handoff_rgvdsa_vue/design-assets/SVG/Asset *.svg` against prototype PNGs (`designs/assets/v3/`) and record the semantic mapping (hero-headline, county-map, flames-full, luchador-panel, star/star-notch/sparkle, logo lockups)
- [x] 1.2 Copy/rename SVGs into `static/images/v3/` with semantic names; verify header logo is transparent (recolor if `#EB2028` baked in); check luchador SVG texture — fall back to designer 2x PNG only if degraded
- [x] 1.3 Copy `hero-photo.png` (duotone) into `static/images/v3/` (2x if obtainable, else prototype 1x)
- [x] 1.4 Convert v3 fonts (BowlbyOne-Regular, ManifoldDSA Medium/DemiBold/Bold/Heavy, SpecialSeason-Brush) to woff2 into `static/fonts/v3/`; exclude Jost/Myriad

## 2. Tokens & type system

- [x] 2.1 Add namespaced v3 color tokens to `src/css/tailwind.css` (`#DC1520`, `#FF4100`, `#FFC800`, `#719655`, `#5F813A`, `#F7F5F1`, `#F5F2EC`, `#231F20`, `#211E1E`); leave v2 tokens untouched
- [x] 2.2 Add v3 `@font-face` set + font-family tokens (Bowlby, Manifold weights, Special Season Brush); confirm no external font requests
- [x] 2.3 Add high-contrast overrides: v3 red→`#B5121B`, green-dark→`#3F5A23` via existing a11y root class + `data-tone` pattern; verify `useA11ySettings.ts` needs no JS change

## 3. Header & footer (site-wide chrome)

- [x] 3.1 Re-skin `SiteHeader.vue`: bg v3 red, Bowlby nav 1.06rem white, pill buttons (JOIN DSA / Aa / EN-ES), v3 SVG logo lockup ~78px (bg in CSS); verify About dropdown, language switcher, Aa widget, sticky unchanged
- [x] 3.2 Re-skin `SiteFooter.vue`: `#211E1E` bg, v3 footer logo ~230px, column heads Manifold Bold / links Medium with `#FFC800` hover, green `#5F813A` bottom bar (chapter name + accessibility line)
- [x] 3.3 Replace social placeholder with real inline-SVG icon links wired to chapter context URLs (confirm profile list — open question #2); update `base.twig` footer/header props as needed
- [x] 3.4 Update header/footer island tests + fixtures for v3 markup

## 4. Home template — hero & who-we-are

- [x] 4.1 Rebuild hero in `front-page.twig`: 50/50 split stacking <~1000px; left `#DC1520` panel with headline image in `<h1>` (alt "A better Rio Grande Valley is possible!"), subhead (Manifold DemiBold), JOIN DSA pill, dashed `#FFC800` box (radius 16, Manifold Bold 1.25rem, arrow SVG → Get Involved), three absolute rotated star SVGs (`aria-hidden`); right hero-photo cover min-h 480px
- [x] 4.2 Remove counties strip section from `front-page.twig` (keep `rgvdsa_chapter_counties` in PHP)
- [x] 4.3 Rebuild who-we-are: grid map 1.15fr / text 1fr gap 56px; left county-map SVG; right-aligned column — orange eyebrow (Manifold Heavy), Bowlby heading, three Manifold-Bold paragraphs (prototype copy as ACF defaults), MORE ABOUT OUR CHAPTER arrow link (shared arrow SVG partial)

## 5. Home template — events, blog, CTA

- [x] 5.1 Re-token events band: cream `#F7F5F1` bg, white cards radius 16, red date chips, orange-outline Bowlby View-event pills; v3 empty state (2px dashed `#B9B3A9`, radius 20, "No events on the books yet" + calendar link)
- [x] 5.2 Re-token blog section: keep v2 layout, radius 24, chip colors `#5F813A`/`#FF4100`, Manifold type, striped placeholder for missing featured images; keep real-posts context + empty state
- [x] 5.3 Remove get-involved steps section; build Ponte Trucha CTA: white band, full-width flames SVG, luchador panel overlay (`left/right:3.2%; bottom:4.1%; width:100%`), inset column `padding-left:44%` with brush line (`text-transform: uppercase`, source keeps `¡`/`!`, `clamp(2.4rem,8.2vw,7.2rem)`, right-aligned, white) + orange JOIN DSA pill; stack text below ~700px
- [x] 5.4 Add `data-tone` attributes to every v3 band (`red`/`cream`/`ink`/`orange`/`green`)

## 6. i18n & data plumbing

- [x] 6.1 Register new/changed strings with `pll__()` (empty-state copy, View event, arrow-link labels, footer accessibility line) + add ES translations
- [x] 6.2 Update ACF copy defaults in `inc/options.php` to v3 prototype copy (hero subhead, who-we-are paragraphs); confirm EN and ES pages source per-language fields; decide `/es/` headline art handling (open question #1)
- [x] 6.3 Verify unused context (counties, home_involved) causes no errors on Home; leave providers in place

## 7. Verify

- [x] 7.1 Update/remove Twig + island tests referencing counties strip, get-involved section, v2 classes; run full test suite green
- [x] 7.2 `npm run build`; visual diff vs `designs/RGV DSA Home v3.dc.html` + `front-page.png` at desktop / ~1000px / ~700px / mobile
- [x] 7.3 A11y pass: contrast (red `#DC1520` kept, orange only large/bold), `<h1>` alt, heading order, skip link, Aa states (text size / high contrast / reduce motion) persist and swap v3 tokens
- [x] 7.4 Spot-check interior pages: v2 body unchanged, v3 chrome renders, no token bleed
