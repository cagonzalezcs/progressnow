# mock-api — snapshot of the WordPress read API for Vercel

Stand-in backend for `progressnow-next.vercel.app` until the real WordPress
host is reachable. Serves a recorded copy of `GET /wp-json/progressnow/v1/*`
(plus uploads and theme static files) from a Vercel function.

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
- `api/index.mjs` — the handler. `/posts` is paginated/filtered (category, `s`)
  from the full list; `/events` is windowed by `after`/`before`; unknown slugs
  return WordPress-shaped 404s; `POST /build-status` acknowledges.
- `public/` — uploads referenced by the snapshot + `wp-content/themes/progressnow/static`.

When the real host is available: set `WP_API_BASE` on the `progressnow-next`
project to it and this directory can go.
