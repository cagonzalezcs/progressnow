## REMOVED Requirements

### Requirement: Server-truth archive interactions
**Reason**: Vue islands are replaced by the Nuxt application; the behavior is unchanged but now specified for the app.
**Migration**: See `nuxt-static-site` → "Data seeding and payload resolution" and "Functional parity with the current front end" (blog archive search/filter/pagination from `/progressnow/v1/posts`, debounced and abortable, URL-state synced).

### Requirement: Windowed calendar fetch
**Reason**: Vue islands are replaced by the Nuxt application; the behavior is unchanged but now specified for the app.
**Migration**: See `nuxt-static-site` → "Functional parity with the current front end" (calendar fetches its window from `/progressnow/v1/events` with skeleton and error states).

### Requirement: Crawlable fallbacks
**Reason**: Generalized from posts-only fallbacks to every route.
**Migration**: See `php-shell-handoff` → "Every public route is served first as a PHP shell" (complete crawlable content for all routes, no `noscript` special-casing).
