## Why

`next-js/proxy.ts` renders 404 and 500 documents by fetching itself and marks those internal requests with plain headers: `x-not-found-render`, `x-error-render`, `x-pathname`, and `x-nonce`. Nothing distinguishes the proxy's own loop from a public client sending the same headers. A request carrying `x-not-found-render: 1` skips the manifest existence check and the `/es/` redirect; `x-pathname` chooses the language and chrome; `x-error-render` returns the error document with status 200; and `x-nonce` is copied verbatim into the response's `Content-Security-Policy` and onto every inline script. Today the damage is self-inflicted (HTML renders per request with `no-store` on the internal paths), but it is a nonce-fixation and cache-poisoning footgun the moment a CDN or `cacheComponents` caches HTML by URL, and it bypasses the status-code decision the spec relies on.

Smaller gaps in the same layer: the rebuild receiver reads the entire body before enforcing the 16 KB cap when `Content-Length` is missing or wrong; `next/image` `remotePatterns` allow `http:` for every image host in production; the seven `dangerouslySetInnerHTML` sites have no lint guard (the Vue apps at least require an inline `eslint-disable` justification); `/api/events` is an unauthenticated proxy to WordPress whose abuse posture is undocumented; and the `deploy/mock-api` Vercel function — reachable from the public internet — accepts unsigned `POST /build-status` and re-homes every URL in its responses from `x-forwarded-host`.

`next-deployment` and `next-revalidation-receiver` specify headers, CSP, env validation, and signing; none of the open `security-*` changes touch the Next edge. This change closes the gaps additively.

## What Changes

- **Authenticate the render loop.** The proxy mints a per-process random token at boot; internal fetches send it as `x-internal-token`; inbound requests without a matching token have every `x-nonce`, `x-pathname`, `x-not-found-render`, `x-error-render` header stripped before any decision. Vercel/edge deployments (no shared process) fall back to `INTERNAL_ORIGIN` restricted to loopback plus header stripping.
- **Bound the receiver body while streaming**: abort at 16 KB regardless of `Content-Length`; require `content-type: application/json`.
- **HTTPS-only image hosts** outside `MOCK_API`; `http` only when the host is explicitly listed with a scheme.
- **Sink allowlist lint:** `react/no-danger` = error with a file allowlist and a `// html-sink: <sanitizer>` comment convention; a unit test counts sinks against the allowlist.
- **`/api/events` abuse posture:** documented (cache profile, upstream timeout, 503 on failure); optional edge rate limit documented for Vercel and nginx.
- **Mock backend hygiene:** `POST /build-status` verifies the same HMAC (reusing the signing scheme) or is removed; host re-homing trusts only `VERCEL_URL`/configured origin; the project is labeled non-production in its README and Vercel project name.
- **E2E assertions** in `test/e2e/security-headers.spec.ts`: spoofed internal headers are ignored (404 still 404, nonce not attacker-chosen, error render not reachable).

## Capabilities

### New Capabilities
- `next-edge-trust-boundaries`: which request headers the app trusts, how internal renders are authenticated, and how HTML sinks are governed.

### Modified Capabilities
- `next-revalidation-receiver`: body size is enforced while streaming (added requirement).
- `next-deployment`: image hosts are HTTPS-only in production (added requirement; existing "Image optimization policy" unchanged).

## Impact

- **Next.js:** `proxy.ts`, `lib/request-path.ts` (header names + token check), `lib/rebuild-receiver.ts` (streaming cap), `next.config.ts` (remote patterns), `eslint.config.mjs` (no-danger allowlist), 7 sink files (comment convention), `test/e2e/security-headers.spec.ts`, `test/unit/rebuild-receiver.spec.ts`, new `test/unit/request-trust.spec.ts`.
- **Mock backend:** `deploy/mock-api/api/index.mjs`, `README.md`.
- **Docs:** `docs/deployment.md` §10.5 (edge trust, rate limiting), `next-js/README.md`.
- **Behavior:** no change for legitimate traffic; spoofed headers are ignored; oversized webhook bodies are cut off earlier.
- **Coordinates with:** `security-rest-cache-dos-hardening` (upstream side of `/api/events`), `security-rebuild-transport-trust-boundary` (secret length). Does not modify those changes.
