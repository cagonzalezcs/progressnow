# mock-api — snapshot of the WordPress read API for Vercel

**Demo backend, not production.** Stand-in for `progressnow-next.vercel.app`
until the real WordPress host is reachable. Serves a recorded copy of
`GET /wp-json/progressnow/v1/*` (plus uploads and theme static files) from a
Vercel function. It is on the public internet, so it keeps the real API's
trust boundary (openspec `next-edge-trust-boundaries`):

- `POST /build-status` verifies the same HMAC as WordPress
  (`X-Chapter-Timestamp` + `X-Chapter-Signature`, 300 s window) against
  `CHAPTER_REBUILD_SECRET`; unsigned or stale → 401, over 16 KB → 413. Set the
  variable on the Vercel project to the value the `progressnow-next` project
  uses, or the demo's build-status callback logs a 401:

  ```bash
  cd deploy/mock-api && npx vercel env add CHAPTER_REBUILD_SECRET production
  ```

- Snapshot URLs are re-homed to `PUBLIC_ORIGIN` when set, else Vercel's
  production URL (`VERCEL_PROJECT_PRODUCTION_URL`, then `VERCEL_URL`), else
  `http://127.0.0.1:$PORT` — never to `X-Forwarded-Host`. Set `PUBLIC_ORIGIN`
  on the project if it is served from a custom domain.
- Name the Vercel project so nobody mistakes it for production
  (`progressnow-mock-api`; the description/README says demo). Renaming
  changes the `*.vercel.app` URL, so update `WP_API_BASE` on
  `progressnow-next` in the same step.

```bash
# 1. refresh the snapshot from local MAMP (needs NODE_EXTRA_CA_CERTS for MAMP's CA)
node deploy/mock-api/snapshot.mjs            # SOURCE=https://progressnow.test:8890 by default

# 2. try it locally
node deploy/mock-api/server.mjs              # http://127.0.0.1:8787/wp-json/progressnow/v1

# 3. deploy (project progressnow-mock-api, team cagonzalezcs-projects)
cd deploy/mock-api && npx vercel deploy --prod --yes

# 4. rebuild the app so its content cache picks the new data up
npx vercel deploy --prod --yes               # from the repo root
```

- `snapshot.json` — every response, keyed by `path?sorted-query`; the source
  origin is stored as `__ORIGIN__` and re-homed to the request host.
- `demo-overrides.mjs` — demo values for Chapter Settings the source leaves
  blank (the social profile URLs, without which both footers drop the icon
  row). `snapshot.mjs` applies it on every refresh; run it directly
  (`node deploy/mock-api/demo-overrides.mjs`) to patch the committed snapshot.
  Only blank fields are filled, so real values always win.
- `api/index.mjs` — the handler. `/posts` is paginated/filtered (category, `s`)
  from the full list; `/events` is windowed by `after`/`before`; unknown slugs
  return WordPress-shaped 404s; `POST /build-status` acknowledges when signed.
- `public/` — uploads referenced by the snapshot + `wp-content/themes/progressnow/static`.

When the real host is available: set `WP_API_BASE` on the `progressnow-next`
project to it and this directory can go.
