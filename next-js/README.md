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

`test:a11y` runs axe-core over every route × language × a11y mode. Our code is
held at zero violations; the vendored shadcn registry examples in the styleguide
ratchet down through `test/e2e/a11y/kitchen-sink-baseline.json`.

Documentation for layout, data flow and env lands with task 8.4.
