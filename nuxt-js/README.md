# Progress Now — Nuxt 4 static rendition (`nuxt-js/`)

The visitor-facing app. WordPress (theme `wp-content/themes/progressnow`) serves
every public URL first as a PHP shell — full SEO head, crawlable content, and an
embedded `__SHELL_DATA__` payload — then this app mounts into `#__nuxt`, renders
the landing route from that payload without a request, and handles every later
navigation from the prerendered `_payload.json` files. See
`openspec/changes/nuxt4-static-platform/design.md` (D1–D5) for the model.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | `nuxt dev` against the local WordPress (`NUXT_DEV_WP_ORIGIN`, proxied `/wp-json` + `/wp-content`) |
| `npm run generate` | Prerender every `/routes` manifest route (both languages) into `.output/public` + `shell-manifest.json` |
| `npm run generate:mock` | Same, against the fixture-backed nitro mock (`NUXT_MOCK_API=1`) — no WordPress needed |
| `npm run verify:output` | Check the generated output (routes, payloads, manifest, assets) |
| `npm run lint` / `typecheck` / `test` | ESLint (`@nuxt/eslint` + a11y), `nuxt typecheck`, vitest |

Copy `.env.example` to `.env`. `NUXT_PUBLIC_WP_API_BASE` must be the absolute
`…/wp-json/progressnow/v1` of the WordPress that generate reads from; the
rebuild workflow sets it from a repository variable.

## Layout

```
app/
  lib/chapter/      Nuxt-free data layer: payload keys, route resolver,
                    shell reader, freshness guard, cache order, head, links
  lib/              schemas.ts (shared with the theme), api.ts, url-state.ts
  composables/      useChapter.ts — useChapterData/Site/Routes, useRouteSeo …
  plugins/          shell.client.ts (boot from __SHELL_DATA__),
                    navigation.client.ts (link interception, prefetch)
  middleware/       freshness.global.ts
  layouts/default   site chrome from `site:{lang}`
  pages/[...slug]   one catch-all; kind → components/routes/Route*.vue
  components/site   shared islands (copied from the theme; keep in sync)
  components/ui     shadcn-vue registry (vendored)
modules/            routes-manifest (bundles + prerenders /routes),
                    shell-manifest (writes shell-manifest.json)
shared/mock-api.ts  fixture-backed mock; server/routes/mock/v1 serves it
test/unit           contracts, resolver, shell/freshness/cache, manifest
```

## Data order (every route)

1. `__SHELL_DATA__` (seeded into `nuxtApp.payload.data` at boot) — landing route.
2. The destination's `_payload.json` (`nuxtApp.static.data`) — prerendered routes.
3. `GET /wp-json/progressnow/v1/*` — search/filter/paged states, calendar
   windows, and every navigation while the freshness guard says the static
   build is older than the shell's `contentVersion`.

`useChapterData(key, fetcher)` implements the order; keys follow
`site:{lang} | routes | front:{lang} | page:{lang}:{path} | post:{lang}:{slug} |
event:{lang}:{slug} | posts:{lang}`.

## Shared components

`app/components/site/**`, `app/components/ui/**`, `app/composables/useA11ySettings.ts`,
`app/lib/schemas.ts` and `app/assets/css/tailwind.css` are copies of the theme's
`src/` (the Vite islands) until the islands are removed (openspec tasks 7.x). Edit
the theme copy and re-copy; `test/unit/shared-source-drift.test.ts` fails on any
drift between the theme's
`src/{components/site,composables/useA11ySettings.ts,lib/schemas.ts,css/tailwind.css}`
and the copies here (font/asset URLs and the app-only `@source` block are
normalized), and `test/unit/categories-drift.test.ts` guards `categories.json`.

The route components under `app/components/routes/` are app-only, but each one
is the twin of a Twig template (`RouteAbout` ↔ `page-about.twig`, `RoutePage` ↔
`page.twig`, `RouteNotFound` / `error.vue` ↔ `404.twig`, …) and must keep the
same class literals. The design system is documented in the theme README
("Design system (v4)"): role-named color tokens (`brand`, `accent`, `alt`, `ink`…
— no v3 aliases), Public Sans + Bowlby One (+ Special Season Brush) served from
the theme's `static/fonts/` by absolute URL, `data-tone="blue|white|alt|ink"`
bands for the high-contrast mode, and the 20/14/999 radius scale.
