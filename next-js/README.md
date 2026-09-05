# Progress Now — headless Next.js frontend (`next-js/`)

Server-rendered Next.js app for the Progress Now WordPress theme. WordPress is
the CMS and the API (`GET /wp-json/progressnow/v1/*`); this app runs on its own
origin and re-renders when WordPress posts its signed rebuild webhook. See
`openspec/changes/next-js-site-implementation/design.md`.

Documentation lands with the implementation (commands, layout, data flow, env,
tests). Until then: copy `.env.example` → `.env.local`, then `npm run dev:mock`.
