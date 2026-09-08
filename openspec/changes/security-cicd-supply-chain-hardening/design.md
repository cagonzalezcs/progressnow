## Context

Two workflows: `ci.yml` (four jobs, top-level `permissions: contents: read`) and `rebuild-site.yml` (one job, `contents: read` + `id-token: write`, secrets `RSYNC_SSH_KEY` and `CHAPTER_REBUILD_SECRET`, `repository_dispatch` from WordPress). Terraform provisions a private bucket, optional CloudFront, and an IAM role trusted for `repo:<owner>/<repo>:*` by default. Three npm apps and one Composer project pin nothing about their runtimes. Renovate/Dependabot are planned elsewhere and will need pins to maintain.

## Goals / Non-Goals

**Goals:**
- A compromised third-party action tag, a malicious repository variable, a stray branch, or a missing environment variable cannot cause a deploy.
- Deploy credentials can do exactly one thing each (write one directory, sync one bucket).
- The pipeline definition is linted like code.

**Non-Goals:**
- SAST/secret scanning/artifact guards (`security-headers-and-cicd-gates`).
- Package vulnerability audits and update PRs (`security-dependency-lifecycle`).
- Moving off GitHub Actions.

## Decisions

- **SHA pins with version comments**, maintained by Renovate's `helpers:pinGitHubActionDigests` preset. Rationale: immutable references; the comment keeps diffs readable. Alternative (tags) rejected — tags are mutable.
- **`permissions: {}` at top, grants per job.** `ci.yml` jobs: `contents: read`; `rebuild-site` build job: `contents: read`, `id-token: write` only when `DEPLOY_TARGET == 's3'` cannot be expressed per step, so the s3 path gets its own job or the grant stays on the one job with the narrowed OIDC subject as the second control.
- **`env:` routing for every expression** consumed by `run:`; `actionlint` catches new violations, `zizmor` audits for template injection, unpinned actions, and excessive permissions. Both run in a tiny `workflow-lint` job on every push.
- **Host key required; keyscan removed.** A missing `RSYNC_HOST_KEY` fails the run with a message showing how to obtain it. **rrsync**: documented `authorized_keys` line restricting the deploy key to write-only sync into `CHAPTER_STATIC_DIR`.
- **OIDC subject narrowed** to `ref:refs/heads/main` and `environment:production`; `github_oidc_subjects` stays overridable. `force_destroy` → variable, default `false`. `aws_s3_bucket_server_side_encryption_configuration` with SSE-S3 (no KMS cost). Rationale: least astonishment for a reference module an adopter will `apply` as-is.
- **Timber on a tag.** `"timber/timber": "^2.3"` (or the newest 2.x tag at implementation time); `composer.lock` updated; tests run. `2.x-dev` was a starter-theme artifact, not a decision.
- **Node pin at the root** (`.nvmrc`), `engine-strict` per app, and CI's `setup-node` reads `.nvmrc` so there is one number to bump. `npm ci --ignore-scripts` for theme and next-js (no dependency needs a postinstall there — verified by installing and building); nuxt-js keeps scripts for `nuxt prepare` but runs it explicitly after an `--ignore-scripts` install.
- **CI triggers:** `pull_request` + `push` to `main` + `push` to `'**'` with `paths-ignore` for docs. Noise is bounded by `concurrency`. Rationale: worktree branches (`claude/**`, `task/**`) are where AI-authored code lands first; they should be tested before a PR exists.
- **Vercel fail-closed:** `nuxt-js/vercel.json` `buildCommand` checks `VERCEL_ENV`; production without `NUXT_PUBLIC_WP_API_BASE` exits 1 with a message; previews may fall back to the mock.

## Risks / Trade-offs

- [SHA pins rot without Renovate] → land Renovate (`security-dependency-lifecycle`) first or in the same PR series; until then a quarterly manual bump is documented.
- [`--ignore-scripts` breaks a package that needs a postinstall] → CI build catches it; opt that app back in explicitly.
- [Narrow OIDC subject breaks `workflow_dispatch` from a non-main ref] → dispatch runs on `main` by default; document that only `main` deploys.
- [Running CI on every branch increases minutes] → `paths-ignore` for docs, `concurrency` cancel-in-progress already set.
- [Timber tag lacks a fix the dev branch had] → run the full PHPUnit suite; pin the specific tag if needed.

## Migration Plan

1. Pins + permissions + env routing + workflow-lint job (no behavior change).
2. Toolchain pins (`.nvmrc`, `.npmrc`, Timber tag, PHP platform); CI reads them.
3. Deploy hardening: host key required, rrsync docs, Terraform defaults, Vercel fail-closed.
4. CI trigger widening; dependency-review job.
5. Owner: rotate the rsync key to a restricted one and re-apply Terraform (trust policy only).

## Open Questions

- CI on every branch push, or PR-only? (Recommend every branch: AI worktrees are where regressions appear first.)
- Adopt `step-security/harden-runner` (egress audit) now or later? (Recommend audit mode now, block mode after one release.)
