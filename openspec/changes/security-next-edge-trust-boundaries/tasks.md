## 1. Internal render authentication

- [x] 1.1 `lib/request-path.ts`: per-process `INTERNAL_TOKEN`; export `isTrustedInternal(request)` (constant-time compare) and `stripInternalHeaders(headers)`
- [x] 1.2 `proxy.ts`: strip `x-nonce`, `x-pathname`, `x-not-found-render`, `x-error-render` unless trusted; `renderInternally` sends the token
- [x] 1.3 `test/unit/request-trust.spec.ts`: spoofed headers stripped; trusted loop preserved
- [x] 1.4 `test/e2e/security-headers.spec.ts`: `x-nonce: attacker` never appears in the response CSP; `x-not-found-render` on an unknown path still yields 404; `x-error-render` on a real path yields the page, not the error document

## 2. Receiver body bound

- [x] 2.1 `lib/rebuild-receiver.ts`: stream the body with a 16 KB ceiling (cancel + 413 on overflow); require `content-type: application/json`
- [x] 2.2 `test/unit/rebuild-receiver.spec.ts`: chunked oversized body without `content-length` → 413 before signature check; wrong content-type → 415

## 3. Image hosts

- [x] 3.1 `next.config.ts` + `lib/env.ts`: bare `IMAGE_HOSTS` entries → `https` only; scheme-qualified entries honored; `MOCK_API` keeps loopback `http`
- [x] 3.2 Update `test/unit/next-config.spec.ts`, `test/unit/env.spec.ts`, `.env.example`, `docs/deployment.md` §10.2

## 4. HTML sink governance

- [x] 4.1 `eslint.config.mjs`: `react/no-danger: error`; `off` only for the allowlisted files
- [x] 4.2 Add `// html-sink: kses|encoder` on each of the 7 sinks
- [x] 4.3 `test/unit/html-sinks.spec.ts`: enumerate `dangerouslySetInnerHTML` in `app/` + `components/site` + `components/layout` + `components/seo`; fail on any file outside the allowlist or any sink without a comment

## 5. Public endpoints and the mock backend

- [x] 5.1 Document `/api/events` abuse posture (cache profile, upstream timeout, 503) and edge rate-limit recipes (Vercel firewall rule, nginx `limit_req`) in `docs/deployment.md` §10.5
- [x] 5.2 `deploy/mock-api/api/index.mjs`: verify HMAC on `POST /build-status` (401 otherwise); re-home origins from `VERCEL_URL`/configured origin only
- [ ] 5.3 `deploy/mock-api/README.md` + Vercel project name: "demo backend, not production"; set the secret env var
