## Why

The default rebuild transport (`github`) stores `CHAPTER_GITHUB_TOKEN` — a fine-grained personal access token with **Contents: read & write** on this repository — in `wp-config.php` on the WordPress host, where every plugin, every PHP file, and every Administrator can read it. WordPress is the most attacked component of the stack. The token is not scoped to "dispatch a workflow": with Contents: write it can push to `main`. `.github/workflows/rebuild-site.yml` deploys on every push to `main` touching `nuxt-js/`, and the Vercel projects auto-deploy `next-js/` from `main`. A WordPress compromise therefore becomes a **code-supply-chain compromise of every frontend**, and — through the workflow's rsync key or OIDC role — of the static hosting as well.

The same file holds `CHAPTER_REBUILD_SECRET`, shared between the outbound webhook and the inbound `/build-status` callback, with no rotation procedure, no per-environment separation, and a 16-character minimum on the Next side but none on the PHP side. No open change looks at credential scope on the WordPress side: `security-runtime-hardening` covers config flags and salts, `security-dependency-lifecycle` covers packages, `security-headers-and-cicd-gates` covers CI gates.

## What Changes

- **Webhook-first policy.** Production installs use `CHAPTER_REBUILD_TRANSPORT=webhook` (the Next receiver or a build receiver) so WordPress holds only an HMAC secret that can trigger a build and nothing else. The `github` transport is documented as acceptable only when its token cannot reach the code (below).
- **Isolated dispatch repository for the GitHub transport.** The token WordPress holds is scoped to a separate, otherwise empty `<owner>/<repo>-dispatch` repository whose only content is the rebuild workflow; that workflow checks out the main repository **read-only** with a deploy key held in the dispatch repo's Actions secrets. A push from the WordPress-held token can only touch the dispatch repo, and its workflow runs from the main repo's `main` at a pinned ref.
- **Compensating controls on the main repository.** Branch protection on `main`: pull request required, status checks required, signed commits required, "do not allow bypassing" enabled so a leaked token of any maintainer cannot push directly; deploy jobs run under a `production` GitHub environment.
- **Secret handling in the theme.** Settings resolve from environment variables (`getenv()`) before `wp-config.php` constants through the existing `progressnow/rebuild/setting` filter, so hosts can inject secrets without writing them to disk; `CHAPTER_REBUILD_SECRET` is required to be ≥ 32 characters on the PHP side (the Next side moves from 16 to 32); the Site build panel, WP-CLI output, admin notices, and `lastError` are asserted never to include a secret or token.
- **Rotation runbook** for the PAT, the webhook secret, the rsync key, and Vercel/AWS credentials, with per-environment values and an order of operations that never leaves a window where the callback is unsigned.

## Capabilities

### New Capabilities
- `rebuild-credential-boundary`: what credentials the CMS may hold, what each can reach, how they are supplied, rotated, and kept out of every output.

### Modified Capabilities
- `static-rebuild-pipeline`: the GitHub transport requirement changes from "the token SHALL live only in `wp-config.php`" to "the token SHALL be supplied by constant or environment and SHALL be scoped to a repository that cannot change deployed code".

## Impact

- **Theme PHP:** `inc/rebuild.php` (`progressnow_rebuild_setting` env fallback, secret-length check, redaction of error bodies), `inc/admin-build.php`/`inc/cli.php` (assert no secret in output), `tests/test-rebuild.php`.
- **Next.js:** `lib/env.ts` minimum secret length 32 (one-line, plus `.env.example`).
- **Repo/GitHub:** new `docs/rebuild-dispatch-repo.md` (template workflow for the dispatch repository), branch-protection checklist in `docs/deployment.md` §3, `production` environment on deploy jobs (coordinate with `security-cicd-supply-chain-hardening`).
- **Docs:** `docs/deployment.md` §2/§3/§10.3 rewritten around webhook-first; `README.md` configuration table.
- **Ops:** rotation runbook `docs/secrets-rotation.md`.
- **Behavior:** no change for installs already on `webhook`; `github` installs migrate their PAT to the dispatch repo (one-time).
- **Coordinates with:** `security-cicd-supply-chain-hardening` (workflow permissions, OIDC subject), `security-runtime-hardening` (wp-config template gains the env-first note), `security-detection-and-response` (audit log of transport changes). Does not modify those changes.
