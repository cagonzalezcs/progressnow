## Context

The blog/event serializers build plain-array "contracts" that are either returned by the `progressnow/v1` REST API or `wp_json_encode`d into the page for Vue islands. Islands bind several of these values directly to `:href`/`:src`. `wp_kses_post` is applied to *prose* fields, but URL fields sourced from block-comment JSON (`$block['attrs']`) and ACF/post meta never pass through kses. Concrete sinks confirmed in code:

- `inc/blog.php` video block: `transcriptUrl` = raw `$data['transcript_url']`; `url` = raw `$data['url']`.
- `inc/blog.php` image block: `src` regex-captured from raw `innerHTML` when no attachment ID.
- `inc/blog.php` pagination: `get_pagenum_link( $n, false )` — second arg `false` disables escaping; URL derives from `REQUEST_URI`.
- `inc/events.php`: `rsvpUrl` from `progressnow_events_get_field(..., 'rsvp_url')` (ACF url validation is bypassable via direct meta write / ACF-inactive fallback).

Islands escape *text interpolation*, but `:href="url"` with a `javascript:` scheme executes on click — Vue does not scheme-filter bound attributes.

## Goals / Non-Goals

**Goals:**
- No `javascript:`/`data:`/`vbscript:`/other dangerous-scheme URL can reach an island attribute binding.
- One shared, tested helper used by every URL sink, so the fix does not regress as serializers grow.

**Non-Goals:**
- Reworking the block model or the island contract shape.
- Client-side sanitization (defense belongs server-side at serialization; a CSP backstop is a separate change).

## Decisions

- **`progressnow_safe_url( $raw ): string` helper.** Runs `esc_url_raw( $raw, [ 'http', 'https', 'mailto', 'tel' ] )` and returns `''` on rejection. Rationale: `esc_url_raw` with an explicit protocol allow-list both normalizes and blocks dangerous schemes; returning `''` lets callers omit the key. Alternative (inline `esc_url_raw` at each site) rejected — easy to forget at the next sink.
- **Drop, don't neuter.** A rejected URL yields an omitted field (no `transcriptUrl` / `rsvpUrl` key) rather than an empty-but-present link. Keeps island conditionals (`v-if="url"`) working.
- **Fix pagination via escaped generation.** Replace `get_pagenum_link( $n, false )` with `esc_url_raw( get_pagenum_link( $n ) )` (or `true` + raw-escape) so `REQUEST_URI`-derived query strings can't inject.
- **Test at the serializer boundary.** Unit tests feed hostile block/meta fixtures and assert the output contract has no dangerous-scheme URL.

## Risks / Trade-offs

- [Legit non-listed schemes (e.g. `ftp`) get dropped] → The site only links http(s)/mail/tel; extend the allow-list deliberately if a real need appears.
- [`esc_url_raw` rewrites some valid URLs (spaces, unicode)] → Acceptable; these are link targets, and normalization is desirable.
- [Other sinks exist beyond the five found] → The audit of `:href`/`:src` bindings in `src/` is part of the tasks to catch any missed field.

## Migration Plan

1. Add helper + tests.
2. Route each identified sink through the helper; fix pagination escaping.
3. Sweep `src/**/*.vue` for every `:href`/`:src` binding and confirm its source field is sanitized.
4. Deploy; no data migration (existing malicious values, if any, are neutralized on next render).

## Open Questions

- Should already-stored malicious meta/block values be scanned for and reported (one-time content audit), or is render-time neutralization sufficient? (Recommend a one-time scan.)
