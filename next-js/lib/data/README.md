# `lib/data` — cached reads

Every export is a `'use cache'` function (Next 16 Cache Components) that wraps
one `lib/api.ts` call, tagged with `content` plus its own key (`lib/data/tags.ts`).
`POST /api/rebuild` revalidates `content`, `routes`, `site` with `{ expire: 0 }`,
so the next request after a WordPress content save is fresh (design D1, D9).

**Fallback toggle.** If Cache Components has to be dropped, keep these call
sites and change two things: remove the directive + `cacheTag`/`cacheLife`
here, and pass `{ next: { tags } }` to `fetch` in `lib/api.ts` (the tag names
stay). Pages then render per request from the data cache; `revalidateTag` keeps
working unchanged.
