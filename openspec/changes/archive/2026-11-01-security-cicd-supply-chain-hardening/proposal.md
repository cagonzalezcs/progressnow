## Why

The build-and-deploy pipeline is itself an attack surface, and it is configured with defaults rather than decisions:

- All 14 `uses:` references in `.github/workflows/*.yml` float on tags (`actions/checkout@v4`, `shivammathur/setup-php@v2`, `ramsey/composer-install@v3`, `aws-actions/configure-aws-credentials@v4`…). A compromised tag deploys straight to the static site.
- Repository variables are interpolated directly into shell (`${{ vars.RSYNC_TARGET }}`, `${{ vars.WP_BUILD_STATUS_URL }}`, `${{ vars.S3_BUCKET }}`, `${{ vars.CLOUDFRONT_DISTRIBUTION_ID }}`) — the standard expression-injection pattern; `client_payload` values are already routed through `env:`, the variables are not.
- The rsync deploy falls back to `ssh-keyscan` (trust-on-first-use) when `RSYNC_HOST_KEY` is unset and uses an unrestricted private key; the Terraform OIDC trust defaults to `repo:<owner>/<repo>:*` (any branch, tag, or PR ref may assume the deploy role) and the site bucket is created with `force_destroy = true`.
- `timber/timber` is required as `2.x-dev` — a moving branch; `composer update` pulls whatever commit is on it.
- Node is `>=22` by `engines` only: no `.nvmrc`, no `engine-strict`, three apps that may drift; `npm ci` runs lifecycle scripts for every dependency.
- CI `push` triggers cover `main`, `cg/**`, `feat/**`, `feature/**`; the branches actually in use (`claude/**`, `task/**`, `fix/**`, `a11y/**`) get no CI until a PR opens.
- `nuxt-js/vercel.json` silently builds the fixture mock when `NUXT_PUBLIC_WP_API_BASE` is unset, so a misconfigured production deploy ships demo content instead of failing.

`security-headers-and-cicd-gates` adds SAST, secret scanning, an artifact guard, and branch protection; `security-dependency-lifecycle` adds audits and Renovate. Neither hardens the workflow definitions, the deploy credentials, or the infrastructure defaults. This change does, and stays out of their scope.

## What Changes

- **Pin every action to a full commit SHA** with a version comment (`actions/checkout@<sha> # v4.2.2`); Renovate (from `security-dependency-lifecycle`) keeps the pins current.
- **Least-privilege tokens:** `permissions: {}` at the workflow level and explicit per-job grants; `id-token: write` only on the deploy job.
- **No expression injection:** every `${{ vars.* }}` / `${{ github.event.* }}` used by a `run:` step moves to `env:`; a workflow lint (`actionlint` + `zizmor`) runs in CI.
- **Deploy credentials:** `RSYNC_HOST_KEY` required (no keyscan fallback); the deploy key documented as `restrict,command="rrsync -wo <CHAPTER_STATIC_DIR>"`; OIDC subject default narrowed to `repo:<owner>/<repo>:ref:refs/heads/main` plus `environment:production`; `force_destroy` becomes a variable defaulting to `false`; bucket default encryption enabled.
- **Toolchain pins:** `.nvmrc` = `22` at the root, `engines` + `engine-strict=true` in every `.npmrc`, `npm ci --ignore-scripts` where no install script is needed (theme, next-js; nuxt-js runs `nuxt prepare` explicitly), `timber/timber` on a tagged constraint (`^2.3`), PHP `require.php` + `config.platform.php` in the theme `composer.json`.
- **CI coverage:** CI runs on every branch push (`branches: ['**']`) or, if noise is a concern, on `pull_request` + `main` only — but never on a partial branch list.
- **Fail-closed builds:** `nuxt-js/vercel.json` requires the API base in production (`VERCEL_ENV=production`) and fails otherwise; mock builds remain for previews.
- **Dependency review** on pull requests (`actions/dependency-review-action`) — licence and vulnerability diff, complementary to the audits in `security-dependency-lifecycle`.

## Capabilities

### New Capabilities
- `pipeline-supply-chain`: how workflows, deploy credentials, infrastructure defaults, and toolchain versions are pinned, scoped, and linted so the pipeline cannot be turned against the site.

### Modified Capabilities
- none (the `static-rebuild-pipeline` "Rebuild workflow" and "Reference infrastructure" requirements are tightened by additive requirements here, not rewritten).

## Impact

- **CI:** `.github/workflows/ci.yml`, `.github/workflows/rebuild-site.yml` (pins, permissions, env routing, triggers), new `.github/workflows/workflow-lint.yml` (actionlint + zizmor), dependency-review job.
- **Infra:** `infra/terraform/{main,variables}.tf` (OIDC subject default, `force_destroy` variable, SSE), `infra/terraform/README.md`.
- **Toolchain:** root `.nvmrc`; `.npmrc` in theme, `nuxt-js`, `next-js`; theme `composer.json`/`composer.lock` (Timber tag, PHP platform).
- **Vercel:** `nuxt-js/vercel.json` build command; `next-js` unaffected.
- **Docs:** `docs/deployment.md` §3–§5 (host key, rrsync, OIDC subjects), `README.md` requirements (Node version).
- **Behavior:** no runtime change to the site; a mis-set rsync host key or missing production API base now fails the run instead of proceeding.
- **Coordinates with:** `security-headers-and-cicd-gates` (branch protection, gates), `security-dependency-lifecycle` (Renovate maintains the pins), `security-rebuild-transport-trust-boundary` (dispatch repo uses the same hardened workflow). Does not modify those changes.
