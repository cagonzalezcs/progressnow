## 1. Theme: settings supply and secret hygiene

- [x] 1.1 `progressnow_rebuild_setting()` / `progressnow_shell_setting()`: consult `getenv( $name )` before the constant; document precedence
- [x] 1.2 Enforce `CHAPTER_REBUILD_SECRET` length ≥ 32 in `progressnow_rebuild_transport()`; degrade to `none` with an admin notice naming the constant
- [x] 1.3 Redact GitHub/webhook response bodies stored in `lastError` (keep status + first 200 chars, strip anything matching the configured token/secret)
- [x] 1.4 Site build panel: show the *source* of each setting (`env` / `constant` / unset), never the value
- [x] 1.5 `tests/test-rebuild.php`: distinctive secret/token never appears in panel rows, CLI JSON, notices, or `lastError`
- [x] 1.6 Optional split secrets `CHAPTER_REBUILD_SECRET_OUT` / `_IN` with fallback to the shared value; tests for both paths

## 2. Next.js

- [x] 2.1 `lib/env.ts`: `CHAPTER_REBUILD_SECRET` minimum 32 characters; update `.env.example`, `test/unit/env.spec.ts`, CI's test secret

## 3. Dispatch-repository pattern

- [x] 3.1 Write `docs/rebuild-dispatch-repo.md`: template `rebuild-site.yml` that checks out `<owner>/<repo>@main` read-only (deploy key or Contents: read PAT held in that repo's secrets), reuses the existing variables/secrets, and pins every action by SHA
- [x] 3.2 Add a `RUNNER_REPO` note to `.github/workflows/rebuild-site.yml` header explaining the two placements (in-repo for trusted installs, dispatch repo for the CMS-held token)
- [ ] 3.3 Verify end to end on a scratch dispatch repo: WordPress → dispatch → build → deploy → `/build-status` — owner: needs a new GitHub repository, a PAT scoped to it and a WordPress host; steps and the negative check are `docs/rebuild-dispatch-repo.md` § Set-up (6)

## 4. Repository controls (owner performs in GitHub settings; checklist in docs)

- [ ] 4.1 Branch protection on `main`: PR required, required status checks (CI jobs), signed commits, no admin bypass — owner, GitHub settings: as of 2026-09-10 the ruleset "Protect main" already enforces PR (1 approval, squash only), signatures and the three required checks; still open: remove the Repository admin bypass actor (mode `always`) — checklist item 5 in `docs/deployment.md` §3
- [ ] 4.2 `production` environment with required reviewer (optional) attached to the deploy job(s) — code side done (`environment: production` on both deploy jobs, PR #29); owner: the environment's *Deployment branches → main* rule and the optional reviewer in GitHub settings (`docs/deployment.md` §3)
- [x] 4.3 Record the checklist in `docs/deployment.md` §3 and `docs/open-source-release.md` (the latter owned by `open-source-release-readiness`; add a pointer only) — §3 done with the 2026-09-10 state; `docs/open-source-release.md` does not exist yet (open-source-release-readiness task 2.5 creates it), the §3 text notes the pointer to add then

## 5. Docs and runbook

- [x] 5.1 Rewrite `docs/deployment.md` §2, §3, §10.3 and `README.md` configuration table: webhook-first, `github` only via the dispatch repo
- [x] 5.2 Write `docs/secrets-rotation.md`: PAT, webhook secret(s), rsync key, AWS role trust, Vercel tokens — order of operations, verification, revocation
- [ ] 5.3 Rotate every current secret once following the runbook; record the date — owner: needs the production host, the GitHub token page and the Actions/Vercel secrets; log table at the end of `docs/secrets-rotation.md`
