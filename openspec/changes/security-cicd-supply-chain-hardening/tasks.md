## 1. Workflow definitions

- [x] 1.1 Pin every `uses:` in `ci.yml` and `rebuild-site.yml` to a full commit SHA with `# vX.Y.Z` comment
- [x] 1.2 `permissions: {}` at workflow level; per-job grants (`contents: read`; `id-token: write` on the deploy job only)
- [x] 1.3 Route every `${{ vars.* }}` and `${{ github.event.* }}` used by `run:` through `env:`; no expression inside shell text
- [x] 1.4 Add `.github/workflows/workflow-lint.yml` running `actionlint` and `zizmor` on push/PR; fix findings
- [x] 1.5 Widen CI triggers (`push: branches: ['**']` + `paths-ignore` docs, or PR-only — per decision); keep `concurrency`
- [x] 1.6 Add `actions/dependency-review-action` job on `pull_request`

## 2. Deploy credentials and infrastructure

- [x] 2.1 `rebuild-site.yml`: require `RSYNC_HOST_KEY` (fail with guidance); remove `ssh-keyscan`
- [ ] 2.2 Document the restricted deploy key (`restrict,command="rrsync -wo <dir>"`) in `docs/deployment.md` §4; verify a sync works and a shell does not — docs done (§4 with the three verification commands); the verification itself waits for access to the production host
- [x] 2.3 Terraform: default `github_oidc_subjects` to `ref:refs/heads/main` + `environment:production`; `force_destroy` variable default `false`; SSE-S3 default encryption; `terraform validate`
- [x] 2.4 Attach the deploy job to a `production` GitHub environment (checklist; coordinates with `security-rebuild-transport-trust-boundary` 4.2) — both deploy jobs carry `environment: production`; the one-time checklist (branch policy `main` only, optional reviewers) is `docs/deployment.md` §3 and is an owner step in GitHub settings
- [x] 2.5 `nuxt-js/vercel.json`: fail production builds without `NUXT_PUBLIC_WP_API_BASE`; keep mock for previews

## 3. Toolchain pins

- [x] 3.1 Root `.nvmrc` (`22`); `setup-node` reads `node-version-file`
- [x] 3.2 `.npmrc` with `engine-strict=true` in theme, `nuxt-js`, `next-js`; `engines.node` in the theme `package.json`
- [x] 3.3 `npm ci --ignore-scripts` for theme and `next-js` in CI and Dockerfile; `nuxt-js`: `--ignore-scripts` + explicit `npx nuxt prepare`; verify builds
- [x] 3.4 Theme `composer.json`: `timber/timber` on a tagged constraint; `require.php >=8.2`; `config.platform.php 8.2` (8.1: Timber ≥ 2.4 needs 8.2 and 8.1 is EOL — design § Implementation notes); update lock; `composer test` green on 8.2 and 8.4 (CI matrix; 8.4 verified locally, 271 tests)

## 4. Verification

- [x] 4.1 Plant an unpinned action / a `${{ vars.X }}` in `run:` on a scratch branch → workflow-lint fails — verified locally with the pinned tool versions (planted copy: zizmor exit 14, `unpinned-uses` high + `template-injection`; clean tree: exit 0, actionlint clean); the first push runs it on GitHub
- [ ] 4.2 Run `rebuild-site` with `STATIC_DEPLOY_TARGET=artifact` from `main` → passes; from a non-main ref with `s3` → role assumption denied — owner: after merge and `terraform apply` of the narrowed trust policy (the workflow additionally skips the deploy jobs off `main`, so the non-main run shows the deploy as skipped and the report as failed)
- [x] 4.3 Document the quarterly manual pin bump until Renovate lands — `docs/security-gates.md` § Bumping the pins
