## Why

Several URL-valued fields reach the Vue islands (bound to `:href` / `:src`) without any URL-scheme sanitization. These values originate from Gutenberg **block-comment JSON attributes** and **post meta**, neither of which is covered by `wp_kses` (kses only sanitizes rendered HTML, not attribute JSON or raw meta). A Contributor-level user can craft a block/meta value like `javascript:alert(document.cookie)`; when an editor or admin previews or opens the content and clicks the link, script executes in their session — a **stored XSS → privilege-escalation** path from the lowest authoring role to full site control. The rest of the theme is well-sanitized, which makes these specific sinks the highest-impact application vulnerability found.

## What Changes

- Sanitize every URL that flows into an island `:href`/`:src` binding through `esc_url_raw()` **and** an allow-list of safe schemes (`http`, `https`, `mailto`, `tel`), dropping the value otherwise.
- Fix the concrete sinks:
  - `inc/blog.php` — video block `transcriptUrl` (stored XSS, High), video block `url`, `core/image` regex-fallback `src`, pagination `newerUrl`/`olderUrl` (`get_pagenum_link(..., false)` is unescaped).
  - `inc/events.php` — event `rsvpUrl` (both the context serializer and the block-embed serializer).
- Add a single shared `progressnow_safe_url()` helper so every current and future URL sink is sanitized consistently.
- Add regression tests asserting `javascript:`/`data:`/`vbscript:` URLs are rejected at serialization.

## Capabilities

### New Capabilities
- `url-sink-sanitization`: All URL values exposed to the front-end (REST payloads and embedded island contexts) are scheme-validated and escaped before output.

### Modified Capabilities
<!-- Behavior is a bug fix within existing serializers; no published spec requirement text changes. -->

## Impact

- **Code:** `inc/blog.php`, `inc/events.php`, plus a new helper (e.g. `inc/blog.php` or a shared util) and its unit tests.
- **Surface:** REST responses (`progressnow/v1`) and embedded Twig/island contexts consuming these fields.
- **No schema/DB change; no breaking API change** — malformed URLs are simply dropped instead of emitted.
