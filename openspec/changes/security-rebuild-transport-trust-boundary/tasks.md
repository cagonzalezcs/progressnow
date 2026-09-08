## 1. Theme: settings supply and secret hygiene

- [ ] 1.1 `progressnow_rebuild_setting()` / `progressnow_shell_setting()`: consult `getenv( $name )` before the constant; document precedence
- [ ] 1.2 Enforce `CHAPTER_REBUILD_SECRET` length ≥ 32 in `progressnow_rebuild_transport()`; degrade to `none` with an admin notice naming the constant
- [ ] 1.3 Redact GitHub/webhook response bodies stored in `lastError` (keep status + first 200 chars, strip anything matching the configured token/secret)
- [ ] 1.4 Site build panel: show the *source* of each setting (`env` / `constant` / unset), never the value
- [ ] 1.5 `tests/test-rebuild.php`: distinctive secret/token never appears in panel rows, CLI JSON, notices, or `lastError`
- [ ] 1.6 Optional split secrets `CHAPTER_REBUILD_SECRET_OUT` / `_IN` with fallback to the shared value; tests for both paths

## 2. Next.js

- [ ] 2.1 `lib/env.ts`: `CHAPTER_REBUILD_SECRET` minimum 32 characters; update `.env.example`, `test/unit/env.spec.ts`, CI's test secret

## 3. Dispatch-repository pattern

- [ ] 3.1 Write `docs/rebuild-dispatch-repo.md`: template `rebuild-site.yml` that checks out `<owner>/<repo>@main` read-only (deploy key or Contents: read PAT held in that repo's secrets), reuses the existing variables/secrets, and pins every action by SHA
- [ ] 3.2 Add a `RUNNER_REPO` note to `.github/workflows/rebuild-site.yml` header explaining the two placements (in-repo for trusted installs, dispatch repo for the CMS-held token)
- [ ] 3.3 Verify end to end on a scratch dispatch repo: WordPress → dispatch → build → deploy → `/build-status`

## 4. Repository controls (owner performs in GitHub settings; checklist in docs)

- [ ] 4.1 Branch protection on `main`: PR required, required status checks (CI jobs), signed commits, no admin bypass
- [ ] 4.2 `production` environment with required reviewer (optional) attached to the deploy job(s)
- [ ] 4.3 Record the checklist in `docs/deployment.md` §3 and `docs/open-source-release.md` (the latter owned by `open-source-release-readiness`; add a pointer only)

## 5. Docs and runbook

- [ ] 5.1 Rewrite `docs/deployment.md` §2, §3, §10.3 and `README.md` configuration table: webhook-first, `github` only via the dispatch repo
- [ ] 5.2 Write `docs/secrets-rotation.md`: PAT, webhook secret(s), rsync key, AWS role trust, Vercel tokens — order of operations, verification, revocation
- [ ] 5.3 Rotate every current secret once following the runbook; record the date
