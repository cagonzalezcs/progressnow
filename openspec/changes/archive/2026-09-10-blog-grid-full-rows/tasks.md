## 1. Theme + REST

- [x] 1.1 `PROGRESSNOW_ARCHIVE_PER_PAGE = 25` in `inc/blog.php`; the archive context, `progressnow_payload_posts()` default, `/posts` `per_page` default and the shell's embedded list use it
- [x] 1.2 `tests/test-rest.php` pagination math 30 → 25 + 5; `tests/test-shell.php` embed assertion; `tests/fixtures/posts-envelope.json` `perPage: 25`
- [x] 1.3 `deploy/mock-api/api/index.mjs`: default 25, honours `per_page` ≤ 50

## 2. Vue island (theme `src/` → mirrored to `nuxt-js/app/`)

- [x] 2.1 `lib/api.ts` (both copies): `POSTS_PER_PAGE`, `perPage` → `per_page`
- [x] 2.2 `BlogArchive.vue`: fetch with `POSTS_PER_PAGE`; featured + 300px grid in filtered mode (header row kept, skeleton mirrors it); drift test green; `src/lib/__tests__/blog-archive.spec.ts` pins 1 featured + 24 grid in browse and filtered states and `per_page=25` on fetch
- [x] 2.3 `nuxt-js/app/components/routes/RoutePostsIndex.vue`: browse/paged/category fetch with `POSTS_PER_PAGE`

## 3. next-js

- [x] 3.1 `RoutePostsIndex.tsx`: `PER_PAGE` for every state; `Filtered` = status row → featured card → grid (`variant="grid"`, browse recipe)
- [x] 3.2 `test/e2e/archive.spec.ts`: a filtered state with results shows the featured card and `[data-archive='filtered']`

## 4. Verification

- [x] 4.1 Theme: `vue-tsc`, eslint, vitest, PHPUnit (`TestRest|TestShell|TestContracts`), phpcs on the changed `inc/` and `tests/` files
- [x] 4.2 nuxt-js: `nuxt typecheck`, eslint, vitest (drift + contracts)
- [x] 4.3 next-js: `tsc --noEmit`, eslint, vitest, `build:mock` + e2e `archive.spec.ts` / `testids.spec.ts`
- [x] 4.4 Visual check at 1280px (headless Playwright, both `nuxt dev` and `next dev` against the MAMP install's 30 posts): `/blog/` = 1 featured + 24 cards in 8 full rows of 3, `/blog/page/2/` = 1 + 4, `?category=poled` = 1 + 4 with the results row, `?s=dolor` = 1 + 18 with "19 posts matching"
