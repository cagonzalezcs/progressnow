# Progress Now — headless Next.js frontend (`next-js/`)

Server-rendered Next.js app for the Progress Now WordPress theme. WordPress is
the CMS and the API (`GET /wp-json/progressnow/v1/*`); this app runs on its own
origin and re-renders when WordPress posts its signed rebuild webhook. Design:
`openspec/changes/next-js-site-implementation/design.md`.

## See it running

| Command                                          | What you get                                                                                                 |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `npm run dev`                                    | http://localhost:3000 against the WordPress in `.env.local` (copy `.env.example`)                            |
| `npm run dev:mock`                               | http://localhost:3001 against the fixture-backed mock API — no WordPress needed                              |
| `npm run build:mock && npm run start:standalone` | the production build (standalone server) on http://127.0.0.1:3000, mock API                                  |
| `npm run build`                                  | production build against `.env.local`'s WordPress (routes render per request; the build itself needs no API) |

Routes: `/`, `/blog/`, `/blog/<slug>/`, `/calendar/`, `/events/<slug>/`, `/about/`,
`/get-involved/`, `/es/…` — the design system + shadcn/ui kitchen sink is at
**`/styleguide/`** (its own bundle; never indexed).

TLS against a local MAMP PRO site: trust MAMP's CA from the shell
(`set -Ux NODE_EXTRA_CA_CERTS /Applications/MAMP/Library/OpenSSL/certs/MAMP_PRO_Root_CA.crt`);
Node reads it at process start, so `.env.local` is too late. Never
`NODE_TLS_REJECT_UNAUTHORIZED=0`.

## Checks

```bash
npm run lint && npm run typecheck && npm run test:unit
npm run build:mock
npm run test:e2e && npm run test:a11y         # Playwright against the standalone build + mock (PW_SKIP_BUILD=1 to reuse a build);
npm run test:failure                          # serial (1 worker): mock-mutating scenarios — upstream failure → 500 + recovery, CHAPTER_CANONICAL_ORIGIN verbatim
npm run parity                                # Nuxt (nuxt-js/.output/public) vs Next screenshots → test-results/parity/index.html
                                              # test:e2e includes the front-page first-load JS budget (budget.json)
```

`test:a11y` runs axe-core over every route × language × a11y mode. Our code and
the styleguide's vendored shadcn registry examples are both held at zero
violations (`test/e2e/a11y/kitchen-sink-baseline.json`). The examples ship
without accessible names on icon-only buttons and Radix controls; after an
upstream re-sync run `node scripts/a11y-patch-examples.mjs` (idempotent — it
records what it did in each file's header) and re-check the hand patches noted
at the top of the few examples and primitives that needed more.

## Layout

```
next-js/
├── app/
│   ├── layout.tsx            ONE root layout: <html lang> + chrome per request (x-pathname from proxy.ts)
│   ├── [[...slug]]/page.tsx  catch-all: resolves the path against /routes → components/routes/Route*.tsx
│   ├── styleguide/           /styleguide/ — its own segment so the kitchen-sink bundle stays route-isolated
│   ├── api/rebuild           signed webhook receiver (revalidates the content tags, 202 { buildId, status })
│   ├── api/health            { ok, buildId } — liveness, never contacts WordPress
│   ├── api/events            calendar windows for months outside the server-rendered one
│   ├── sitemap.xml, robots.txt  generated from /routes on NEXT_PUBLIC_SITE_ORIGIN
│   ├── not-found.tsx, error.tsx, global-error.tsx
│   └── globals.css           the theme's tailwind.css, byte-identical (drift test)
├── proxy.ts                  request proxy: CSP nonce + security headers, real 404/500, /es/ → /es/inicio/
├── instrumentation.ts        env contract validated at startup; request-error logging
├── components/
│   ├── routes/               one server component per route kind (front, page, about, get_involved,
│   │                         posts_index, post, calendar, event, styleguide, not_found)
│   ├── site/                 the site's components (header, footer, cards, blocks, calendar, a11y widget…)
│   ├── layout/, nav/, seo/   RootDocument/SiteShell, focus + route transition, JSON-LD
│   ├── ui/                   shadcn/ui (new-york) — every registry component, for the styleguide
│   └── styleguide/           the parity surface + vendored registry examples
├── lib/
│   ├── schemas.ts            zod contracts — a drift-guarded copy of the theme's src/lib/schemas.ts
│   ├── api.ts                server-only fetch per endpoint, every envelope validated
│   ├── data/                 'use cache' wrappers + tag names (see lib/data/README.md)
│   ├── routes.ts             manifest-driven resolver (verbatim port from nuxt-js)
│   ├── links.ts, metadata.ts, json-ld.ts, sitemap.ts
│   ├── signing.ts, replay-cache.ts, rebuild-receiver.ts, build-status.ts
│   ├── security-headers.ts   CSP builder + static headers (proxy.ts, next.config.ts)
│   ├── a11y-settings.ts, a11y-bootstrap.ts, motion.ts
│   └── env.ts, log.ts
├── scripts/                  build-with-mock, start-standalone, smoke, parity-screenshots, dev-mock
├── test/
│   ├── unit/                 Vitest (node): lib modules, contracts + drift, config policy
│   ├── component/            Vitest (jsdom): RTL + user-event + jest-axe per component
│   ├── mock/                 fixture-backed WordPress stand-in (server.mjs) with e2e control hooks
│   ├── e2e/                  Playwright: routes, chrome, archive, calendar, post, event, seo,
│   │                         receiver, security headers, images, fonts, budget; a11y/ (axe-core);
│   │                         failure/ (serial, mock-mutating)
│   └── fixtures/             signing vectors generated by PHP
├── Dockerfile, .dockerignore standalone image (node:22-alpine, non-root, HEALTHCHECK /api/health)
└── budget.json               front-page first-load JS budget (asserted by test/e2e/budget.spec.ts)
```

## Data flow

```
browser ──GET /es/blog/──▶ proxy.ts ── nonce, headers, 404/500 decision, x-pathname ──▶ app/layout.tsx
                                                                                        │
             ┌── lib/data (use cache, tags content+routes|site|post:{lang}:{slug}) ◀─────┘
             │        │ miss
             │        ▼
             │   lib/api.ts ──GET WP_API_BASE/…──▶ WordPress  (never from the browser)
             │        │ zod-validated envelope
             ▼        ▼
   components/routes/Route*.tsx  → HTML with the response nonce on every inline script

WordPress content save ──debounce──▶ POST /api/rebuild (HMAC over ts.body, ±300 s, replay-safe)
        ▲                                   │ revalidateTag(content, routes, site)
        └──── signed POST /build-status ◀───┘ 202 { buildId, status: "started" }
```

- Envelopes carry absolute WordPress URLs; `lib/links.ts` re-homes them onto this
  origin at render (WordPress-only paths and files stay absolute).
- Search (`?s=`), category/paged archives and calendar windows are server-rendered;
  later archive interactions are URL state (`router.replace`), later calendar
  months go through `/api/events`.
- The a11y settings (`chapter-a11y` in localStorage, legacy key migrated) are
  applied by a nonce'd inline script before first paint, then owned by
  `A11yProvider`.

## Environment

Copy `.env.example` → `.env.local`. Validated at startup (`lib/env.ts`); a
missing or malformed variable fails the start naming it.

| Variable                            | Required    | Purpose                                              |
| ----------------------------------- | ----------- | ---------------------------------------------------- |
| `WP_API_BASE`                       | yes         | `…/wp-json/progressnow/v1` (server-only)             |
| `WP_ORIGIN`                         | derived     | media, the same-origin static proxy, link re-homing  |
| `NEXT_PUBLIC_SITE_ORIGIN`           | yes         | sitemap, robots, absolute OG URLs                    |
| `CHAPTER_REBUILD_SECRET`            | yes         | shared with wp-config.php (≥ 16 chars)               |
| `WP_BUILD_STATUS_URL`               | recommended | the receiver reports the build live                  |
| `IMAGE_HOSTS`                       | optional    | `next/image` allowlist (default: the WordPress host) |
| `CSP_REPORT_ONLY`, `CSP_REPORT_URI` | optional    | CSP rollout knobs                                    |
| `MOCK_API`                          | dev/CI      | fixture mock; relaxes the secret                     |

`NEXT_PUBLIC_*`, `WP_API_BASE`/`WP_ORIGIN` and `IMAGE_HOSTS` are also read at
build time (public vars are inlined, `next.config.ts` is serialized into the
standalone server): build and run with the same values. Deployment paths
(Vercel, Docker, VPS) and the WordPress constants: `docs/deployment.md` §10.

## Tests

| Layer                          | Tool                            | Covers                                                                                                                                                                                                                                                            |
| ------------------------------ | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `test/unit`                    | Vitest (node)                   | resolver, links, env, api errors, cache tags, signing vectors + receiver, replay cache, metadata, JSON-LD, sitemap, a11y settings/bootstrap, motion, security headers, config policy, contract fixtures + drift (`schemas.ts`, `tailwind.css`, `categories.json`) |
| `test/component`               | Vitest (jsdom) + RTL + jest-axe | every site component and route from the theme's fixtures, in each tone band; every installed shadcn component                                                                                                                                                     |
| `test/e2e` (`e2e`)             | Playwright                      | every route in EN/ES, chrome + keyboard paths, archive URL state, calendar, post/event anatomy, SEO head, receiver round-trip, security headers + CSP, images, fonts, first-load budget                                                                           |
| `test/e2e/a11y` (`a11y`)       | Playwright + axe-core           | route × language × a11y mode × interactive state; WCAG 2.x A/AA + best-practice as errors; kitchen-sink ratchet                                                                                                                                                   |
| `test/e2e/failure` (`failure`) | Playwright, 1 worker            | upstream failure → real 500 and recovery; `CHAPTER_CANONICAL_ORIGIN` verbatim                                                                                                                                                                                     |
| `scripts/smoke.mjs`            | node                            | post-deploy: `/api/health`, `/`, `/es/`                                                                                                                                                                                                                           |

Tests are written before the implementation they cover (openspec
`next-test-harness` § TDD ordering); the fixtures are owned by the theme's
PHPUnit suite and asserted from both sides.
