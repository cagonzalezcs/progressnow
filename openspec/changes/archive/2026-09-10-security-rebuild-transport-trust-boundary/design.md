## Context

`inc/rebuild.php` reads every setting through `progressnow_rebuild_setting()` → `defined( $name ) ? constant( $name ) : $default`, filtered by `progressnow/rebuild/setting`. The GitHub transport posts to `/repos/{repo}/dispatches` with `Authorization: Bearer <token>`; GitHub requires **Contents: write** (fine-grained) or `repo` (classic) for that endpoint — there is no narrower permission. `rebuild-site.yml` triggers on `repository_dispatch`, `workflow_dispatch`, and `push` to `main` (paths `nuxt-js/**`), and holds `id-token: write` for the S3 role plus the rsync private key. Vercel deploys `next-js/` (and the mock backend) from `main` on push.

Threat model: an attacker with read access to `wp-config.php` (plugin RCE, LFI, a leaked backup, a malicious Administrator) obtains the PAT and can (1) push a commit to `main`, (2) have it deployed to the static site by the workflow and to the Next origin by Vercel, (3) replay the `/build-status` callback (harmless) or forge rebuild webhooks (harmless: idempotent). Only (1)–(2) matter, and they are severe.

## Goals / Non-Goals

**Goals:**
- A compromised WordPress cannot change deployed frontend code.
- Every credential WordPress holds has a documented scope, supply path, and rotation procedure.
- No secret value ever appears in the admin UI, CLI output, notices, or logs.

**Non-Goals:**
- Replacing GitHub Actions as the build runner.
- Hardening `wp-config.php` in general (that is `security-runtime-hardening`).
- Rate-limiting or authenticating the public read API.

## Decisions

- **Webhook-first for production.** The receiver (Next `/api/rebuild`, or an operator receiver per `docs/deployment.md` §6) verifies an HMAC and starts a build from a source it controls; WordPress holds a secret that can only *request* a build. Alternative — keep `github` as default — rejected because there is no GitHub permission narrower than Contents: write for `repository_dispatch`.
- **Dispatch-repository pattern for installs that want the GitHub transport.** A second repository holds only `.github/workflows/rebuild-site.yml`; it checks out the main repo with `actions/checkout@<sha>` using a read-only deploy key (`ssh-key`) or a fine-grained PAT with Contents: **read**, pinned to `main`. The WordPress PAT is scoped to the dispatch repo only. Rationale: no code path from the CMS token to deployable code; `concurrency`, variables, and OIDC role move with the workflow unchanged. Alternative — GitHub App installation token — still needs Contents: write on the target repo, so it only helps if that target is the dispatch repo, which is the same pattern.
- **Branch protection as the compensating control regardless of transport.** Required PRs, required checks, required signatures, no bypass for admins. Rationale: the maintainer's own PAT (used by tooling) is a comparable risk; protection covers both.
- **Env-first settings.** `progressnow_rebuild_setting()` (and the shell equivalent) consult `getenv( $name )` before the constant. Rationale: hosts with secret managers (container env, Vercel-style env injection, `.env` outside docroot) never write the value into a PHP file; no behavior change where constants are used.
- **Minimum secret length 32 on both sides**, enforced at boot (`transport` degrades to `none` with an admin notice) — a short shared secret makes the HMAC brute-forceable offline.
- **Redaction test.** `tests/test-rebuild.php` gains a case that sets a distinctive token/secret and asserts it appears in none of: panel rows, `wp chapter build-status --format=json`, admin notices, `lastError` after a simulated GitHub 401 body echo.

## Risks / Trade-offs

- [Two repositories to maintain for the dispatch pattern] → the dispatch repo is a template with one file; document in `docs/rebuild-dispatch-repo.md`; installs on the webhook transport never need it.
- [Branch protection blocks the maintainer's own direct pushes] → intended; the user already pushes via PRs for reviewed work.
- [Env-first lookup surprises an operator who sets both] → precedence documented (env wins); the panel shows the *source* of each setting (`env` / `constant` / unset), never the value.
- [Raising the secret minimum breaks an existing install] → transport degrades to `none` with a clear notice; the site stays correct through the freshness guard.

## Migration Plan

1. Theme: env-first settings + length check + redaction test. Next: secret minimum 32. Ship.
2. Docs: rewrite the transport sections webhook-first; publish the dispatch-repo template and the rotation runbook.
3. Repo: enable branch protection + `production` environment (checklist; performed by the owner in GitHub settings).
4. Installs on `github`: create the dispatch repo, move the PAT, revoke the old one (runbook step).

## Open Questions

- Is a second repository acceptable operationally, or should the GitHub transport be deprecated outright in favor of webhook + a documented receiver? (Recommend: keep it, documented as the dispatch-repo pattern only.)
- Should `CHAPTER_REBUILD_SECRET` be split into separate outbound (webhook) and inbound (`/build-status`) secrets? (Recommend: yes, optional constants with fallback to the shared one.)
