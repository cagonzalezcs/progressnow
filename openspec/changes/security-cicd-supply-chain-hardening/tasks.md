## 1. Workflow definitions

- [ ] 1.1 Pin every `uses:` in `ci.yml` and `rebuild-site.yml` to a full commit SHA with `# vX.Y.Z` comment
- [ ] 1.2 `permissions: {}` at workflow level; per-job grants (`contents: read`; `id-token: write` on the deploy job only)
- [ ] 1.3 Route every `${{ vars.* }}` and `${{ github.event.* }}` used by `run:` through `env:`; no expression inside shell text
- [ ] 1.4 Add `.github/workflows/workflow-lint.yml` running `actionlint` and `zizmor` on push/PR; fix findings
- [ ] 1.5 Widen CI triggers (`push: branches: ['**']` + `paths-ignore` docs, or PR-only — per decision); keep `concurrency`
- [ ] 1.6 Add `actions/dependency-review-action` job on `pull_request`

## 2. Deploy credentials and infrastructure

- [ ] 2.1 `rebuild-site.yml`: require `RSYNC_HOST_KEY` (fail with guidance); remove `ssh-keyscan`
- [ ] 2.2 Document the restricted deploy key (`restrict,command="rrsync -wo <dir>"`) in `docs/deployment.md` §4; verify a sync works and a shell does not
- [ ] 2.3 Terraform: default `github_oidc_subjects` to `ref:refs/heads/main` + `environment:production`; `force_destroy` variable default `false`; SSE-S3 default encryption; `terraform validate`
- [ ] 2.4 Attach the deploy job to a `production` GitHub environment (checklist; coordinates with `security-rebuild-transport-trust-boundary` 4.2)
- [ ] 2.5 `nuxt-js/vercel.json`: fail production builds without `NUXT_PUBLIC_WP_API_BASE`; keep mock for previews

## 3. Toolchain pins

- [ ] 3.1 Root `.nvmrc` (`22`); `setup-node` reads `node-version-file`
- [ ] 3.2 `.npmrc` with `engine-strict=true` in theme, `nuxt-js`, `next-js`; `engines.node` in the theme `package.json`
- [ ] 3.3 `npm ci --ignore-scripts` for theme and `next-js` in CI and Dockerfile; `nuxt-js`: `--ignore-scripts` + explicit `npx nuxt prepare`; verify builds
- [ ] 3.4 Theme `composer.json`: `timber/timber` on a tagged constraint; `require.php >=8.1`; `config.platform.php 8.1`; update lock; `composer test` green on 8.1 and 8.4 (CI matrix)

## 4. Verification

- [ ] 4.1 Plant an unpinned action / a `${{ vars.X }}` in `run:` on a scratch branch → workflow-lint fails
- [ ] 4.2 Run `rebuild-site` with `STATIC_DEPLOY_TARGET=artifact` from `main` → passes; from a non-main ref with `s3` → role assumption denied
- [ ] 4.3 Document the quarterly manual pin bump until Renovate lands
