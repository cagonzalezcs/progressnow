# Brand artwork (placeholders)

Everything in this folder is a **chapter-neutral placeholder**. A chapter replaces
the media without touching code under **Chapter Settings → Identity & brand**
(`inc/identity.php` resolves each field and falls back to the file listed here).
Photos are generic, neutral color frames and render **full color** — the v4
canvas's grayscale + brand-blue multiply treatment was retired (2026-09-05); the
shared `DuotoneImage.vue` / `partials/duotone.twig` wrapper only clips a photo to
its slot's radius, so an uploaded photo renders exactly as uploaded. Marks and panels are simple
in-repo SVGs. Keep the filenames generic — nothing here should name a place,
a person, or a specific chapter.

| File | Used for | Override field |
|---|---|---|
| *(none — wordmark lockup)* | Header and footer default logo: a `#FFC800` diamond + the chapter name in Bowlby One, rendered by `SiteHeader.vue` / `SiteFooter.vue` while `identity.logo_*.is_default` | Header logo / Footer logo (an uploaded image replaces the lockup at the same height, `max-width:240px`) |
| `logo-square.svg` / `logo-square.png` (512×512) | Structured-data `Organization.logo` (PNG rendered from the SVG) | Square logo |
| `share-default.jpg` (1200×630) | `og:image` / Twitter card fallback | Default share image |
| `hero-photo.jpg` (951×716) | Right half of the home hero | Hero photo |
| `who-photo.jpg` (920×700) | “Who we are” photo (radius 24) | Who-we-are photo |
| `cta-panel.svg` (1281×563) | The v4 blue panel on the home CTA band — fills `#1848D8` / `#3E4480` / `#FFC800` / `#FFFFFF`; decorative (empty alt) unless the chapter sets one | CTA panel artwork |
| `about-photo.jpg` (1200×800) | Optional About page photo (the seed can attach it) | About page → Photo |
| `flames-tile-light.png` (2816×384, seamless `repeat-x`) | Flame band above the CTA panel — consumed only as a CSS **mask** by `.closing-cta::after` (`src/css/tailwind.css`) so its color is a token; never rendered above 1× (height ≤ 240px) | — |
| `star.svg`, `star-notch.svg`, `sparkle.svg` | Decorative stars (hero, who-we-are photo, 404 band) — inlined by `partials/star.twig` / `StarGlyph.vue` with `fill="currentColor"`, so the placement's `text-*` utility sets the color (`text-brand-light` on blue bands, `text-brand` on the photo) | — |
| `icon-twitter.svg` / `icon-instagram.svg` / `icon-facebook.svg` | Reference copies; the footer inlines them (fill → `currentColor`) | — |

The hero headline is **text** by default (`A better world is possible!`, styled by
`.hero-headline`); a chapter may upload headline artwork instead (with alt text).

Fonts: `static/fonts/{bowlby-one,public-sans,special-season}/*.woff2`
(Bowlby One 400 — display; Public Sans variable `PublicSans[wght].woff2`
400–800 — body, OFL license alongside; Special Season Brush 400 — the CTA line).
