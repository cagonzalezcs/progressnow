## Context

`proxy.ts` runs on every HTML request. It computes `isRenderLoop = request.headers.has("x-not-found-render")`, keeps attacker-supplied `x-nonce` when `isRenderLoop`, and forwards `x-pathname`/`x-error-render` to the layout. `renderInternally()` fetches `INTERNAL_ORIGIN || http://127.0.0.1:$PORT || NEXT_PUBLIC_SITE_ORIGIN` — on Vercel that is the public origin, so the loop is a real public round trip. The receiver (`lib/rebuild-receiver.ts`) checks `content-length`, then `await request.text()`, then re-checks the byte length. `next.config.ts` builds `remotePatterns` for both `https` and `http` per host. Seven components use `dangerouslySetInnerHTML` (a11y bootstrap, JSON-LD, prose, CTA body, a11y note, interior prose, front-page heading/p3), all fed by kses'd HTML or the encoder.

## Goals / Non-Goals

**Goals:**
- Only the proxy's own render loop can influence nonce, pathname, and error/not-found rendering.
- The receiver never buffers more than its cap.
- Every HTML sink is enumerated and justified in code, enforced by lint.
- Public helper endpoints and the mock backend have a written abuse posture.

**Non-Goals:**
- Per-IP rate limiting inside the app (edge/WAF concern; documented, not shipped).
- Changing the CSP policy itself (already specified; `style-src 'unsafe-inline'` trade-off stands).
- Client-side HTML sanitization (server trust boundary is WordPress kses; CSP is the backstop).

## Decisions

- **Internal token.** Minted at module init in `lib/request-path.ts`; `renderInternally` sends `x-internal-token`; the proxy strips the four internal headers unless the token matches (`timingSafeEqual`). Source of the token (amended during implementation): `sha256("progressnow-internal-render:" + CHAPTER_REBUILD_SECRET)` when that secret is set (required outside mock mode), else `crypto.randomBytes(32)` per process. Rationale for the amendment: on Vercel the loop is a public round trip that may land on another instance, and a per-process token would strip the loop's own headers there — the inner render would then mint a *different* nonce than the outer CSP advertises (every inline script blocked on 404/500 pages), lose the visitor's language (`x-pathname`), and the error render would fall through to the 404 document. Deriving from the deployment-wide secret keeps every instance in agreement with no new config; an attacker who holds the rebuild secret can already trigger revalidation, so the reuse adds no new capability. The standalone/Docker path (loopback loop) works identically either way.
- **Strip, don't reject.** Unknown clients sending internal headers get a normal response with the headers dropped; rejecting would leak that the headers matter.
- **Streaming cap in the receiver.** Read `request.body` with a `ReadableStream` reader, accumulate up to `MAX_BODY_BYTES`, cancel and answer 413 on overflow; keep the `content-length` fast path. `content-type` must be `application/json` (WordPress sends it).
- **HTTPS-only image hosts.** `IMAGE_HOSTS` entries may carry a scheme (`http://cms.local`) to opt in; bare hosts map to `https` only; `MOCK_API=1` keeps `http://127.0.0.1`.
- **Sink governance by lint + count.** `react/no-danger: error` globally, `off` for the allowlisted files; each sink line has `// html-sink: kses` or `// html-sink: encoder`; `test/unit/html-sinks.spec.ts` greps the tree and fails if the count or the set changes without updating the allowlist. Mirrors the Vue apps' `vue/no-v-html` justification comments.
- **Mock backend:** sign `POST /build-status` with the shared scheme (`CHAPTER_REBUILD_SECRET` env on the mock project) — it already mirrors the real contract, so mirror the auth too; trust `VERCEL_URL` for origin re-homing; name and README say "demo backend, not production".

## Risks / Trade-offs

- [Header stripping breaks the Vercel render loop] → verified by the e2e `not-found.spec.ts`/`upstream-failure.spec.ts` against the standalone build and by a manual Vercel preview; fallback path documented.
- [Streaming reader differs between Node and Edge runtimes] → receiver is Node-only (`node:crypto` already); unit test both fast path and streaming path.
- [`react/no-danger` noise in the vendored styleguide examples] → styleguide files stay under their existing rule exemption block; sinks there are already excluded from production routes.
- [Signing the mock's `/build-status` complicates demo redeploys] → the secret is one Vercel env var; documented in `deploy/mock-api/README.md`.

## Migration Plan

1. Internal token + header stripping + e2e assertions.
2. Receiver streaming cap + content-type check + unit tests.
3. Image host scheme policy + `env.spec`/`next-config.spec` updates.
4. Sink lint + comments + count test.
5. Mock backend auth + docs; `docs/deployment.md` §10.5 addendum.

## Open Questions

- Keep `/api/events` fully public with cache only, or require a same-origin `sec-fetch-site` check? (Recommend: keep public; document edge rate limiting; it serves cached, public data.)
- Remove the mock backend's `/build-status` instead of signing it? (Recommend: sign — the demo then exercises the real callback path.)
