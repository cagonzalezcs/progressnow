# photo-treatment Specification

## Purpose
Every photo slot renders the Progress Now v4 duotone (grayscale + brand-blue multiply) in CSS through one shared wrapper (`DuotoneImage.vue` / `partials/duotone.twig`), so uploaded photos need no pre-processing and the PHP shell and Nuxt app paint identical pixels. Created by archiving change progress-now-v4-foundation-chrome.
## Requirements

### Requirement: Duotone photo slots
Every photo slot on the canvas — home hero, who-we-are, blog featured/grid/row/read-next images, post featured image and figures, interior figures — SHALL apply the treatment in CSS through a shared wrapper (`DuotoneImage.vue` in the shared site components, `partials/duotone.twig` in the shell): the `<img>` gets `filter: grayscale(1) contrast(1.05)`; an `aria-hidden` overlay paints `var(--color-brand)` with `mix-blend-mode: multiply` at a per-slot opacity — `.38` hero, `.30` who-we-are, featured and card images, `.25` article figures and post featured image, `0` (grayscale only) for grid/row thumbnails where the canvas shows no overlay. The wrapper SHALL preserve the slot's radius and `object-fit`, and SHALL pass through `srcset`/`sizes`/`width`/`height`/`alt` unchanged.

#### Scenario: Uploaded photo renders on-brand
- **WHEN** a chapter uploads a full-color hero photo
- **THEN** the hero shows it grayscale with the blue multiply at .38, with no pre-processing

#### Scenario: Alt text survives
- **WHEN** an image with `alt` is wrapped
- **THEN** the rendered `<img>` keeps that `alt` and the overlay is `aria-hidden`

### Requirement: High-contrast photo treatment
Under `html.a11y-contrast` the overlay SHALL be hidden so photos render pure grayscale, and any pill or text placed over a photo SHALL keep ≥ 4.5:1 against its own background (pills are solid).

#### Scenario: High contrast on
- **WHEN** a visitor enables high contrast
- **THEN** the blue overlay disappears on every slot and category pills remain solid blue-on-white / white-on-blue

### Requirement: Shell and app render the same treatment
The Twig partial and the Vue wrapper SHALL emit identical class recipes so the PHP first paint and the hydrated app are pixel-equal for every slot.

#### Scenario: No swap flash
- **WHEN** the home page loads from PHP and Nuxt takes over
- **THEN** the hero and who-we-are photos do not change appearance at hydration
