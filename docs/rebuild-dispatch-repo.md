# Rebuild dispatch repository

How to run the `github` rebuild transport without giving WordPress a token
that can change the code (openspec `security-rebuild-transport-trust-boundary`;
capability `rebuild-credential-boundary`). Installs with a receiver — the
Next.js app (`docs/deployment.md` §10) or a webhook receiver (§6) — do not
need any of this: use `CHAPTER_REBUILD_TRANSPORT=webhook`, and WordPress holds
only an HMAC secret.

## Why a second repository

`inc/rebuild.php` triggers the build with `POST /repos/{owner}/{repo}/dispatches`.
GitHub grants that endpoint only to a token with **Contents: read and write**
(fine-grained) or `repo` (classic) on the target repository — there is no
"dispatch only" permission. A token with Contents: write can push to `main`;
`rebuild-site.yml` deploys on pushes to `main`, and Vercel deploys `next-js/`
from `main`. So a token scoped to this repository turns any WordPress
compromise (plugin RCE, LFI, a leaked backup, a malicious Administrator — the
token sits in `wp-config.php` or the PHP environment) into a code-supply-chain
compromise of every frontend.

The fix is to point the token at a repository that holds **nothing
deployable**: an otherwise empty *dispatch repository* whose only file is a
copy of the rebuild workflow. That workflow checks this repository out
**read-only** and then does exactly what the in-repo workflow does — same
variables, same secrets, same OIDC role, same `concurrency` group. A leaked
`CHAPTER_GITHUB_TOKEN` can trigger a rebuild and push to the dispatch
repository, which changes nothing that is deployed.

Where the workflow lives (`RUNNER_REPO` in the header of
`.github/workflows/rebuild-site.yml`):

| Placement | When | What WordPress holds |
| --- | --- | --- |
| **in-repo** (`.github/workflows/rebuild-site.yml`) | transport `webhook`; or `github` from a host you would trust with write access to this repository (not production) | the HMAC secret only, or a token that *can* push — never on production |
| **dispatch repository** `<owner>/<repo>-dispatch` | transport `github` on production | a token scoped to the dispatch repository alone |

Both can coexist: the in-repo workflow keeps building on pushes to `main`
touching `nuxt-js/` (code changes) and by hand; content-driven rebuilds arrive
through the dispatch repository.

## Set-up (one-time)

1. **Create the repository** `<owner>/<repo>-dispatch` (private is fine),
   default branch `main`, empty. Add the workflow below as
   `.github/workflows/rebuild-site.yml` and nothing else. Protect its `main`
   the same way as this repository's (PR + signed commits + no bypass).
2. **Read-only access to the code.** Generate a dedicated key pair
   (`ssh-keygen -t ed25519 -f source-readonly -C rebuild-dispatch -N ''`).
   Add the public half to **this** repository as a deploy key
   (Settings → Deploy keys) **without** "Allow write access". Store the private
   half in the dispatch repository as the secret `SOURCE_SSH_KEY`. A
   fine-grained PAT with Contents: **read** on this repository works too
   (`token: ${{ secrets.SOURCE_TOKEN }}` instead of `ssh-key:`), but it is
   tied to a user account and expires; prefer the deploy key.
3. **Variables and secrets** in the dispatch repository: everything from
   `docs/deployment.md` §3 under the same names, plus
   `SOURCE_REPOSITORY = <owner>/<repo>`. Create the `production` environment
   there with *Deployment branches* → `main` (§3), and move the deploy
   credentials (`RSYNC_SSH_KEY`, `AWS_ROLE_ARN`, …) to it. Remove them from
   this repository once the dispatch repository deploys — the in-repo workflow
   then stops at the build artifact.
4. **OIDC trust (S3 target only).** The AWS role trusts subjects by
   repository. In `infra/terraform`, set `github_repository` to the dispatch
   repository (or list both repositories' subjects in `github_oidc_subjects`)
   and `terraform apply`; the trusted subjects become
   `repo:<owner>/<repo>-dispatch:ref:refs/heads/main` and
   `repo:<owner>/<repo>-dispatch:environment:production`.
5. **WordPress.** Create a fine-grained PAT whose *only* repository is the
   dispatch repository, permissions **Contents: read and write** and
   **Metadata: read**, expiry ≤ 1 year. Supply it as the `CHAPTER_GITHUB_TOKEN`
   environment variable (preferred — `docs/deployment.md` §2 *Precedence*) or
   constant, with `CHAPTER_GITHUB_REPO=<owner>/<repo>-dispatch` and
   `CHAPTER_REBUILD_TRANSPORT=github`. Then **revoke any PAT that was scoped
   to this repository** (`docs/secrets-rotation.md` §1).
6. **Verify end to end.** Site build → "Rebuild now" (or
   `wp chapter rebuild --wait`): an Actions run appears in the dispatch
   repository, the build job checks this repository out at `main`, the deploy
   job runs inside `production`, and the panel moves `requested → building →
   live` through the signed `/build-status` callback. Confirm the negative
   too: with the WordPress token, `git push` to this repository is refused
   (`curl -H "Authorization: Bearer $TOKEN" https://api.github.com/repos/<owner>/<repo>`
   returns 404 for a token that cannot see the repository).

## Keeping the copy in sync

The template below is generated from this repository's
`.github/workflows/rebuild-site.yml` and differs from it in three places
only: the header comment, the `on:` block (no `push`), and the two checkout
steps (`repository` / `ref` / `ssh-key`). When the in-repo workflow changes —
a new pin after `docs/security-gates.md` § Bumping the pins, a new job —
re-apply the same diff to the dispatch repository; `workflow-lint.yml` there
(copy it too) keeps `${{ }}` out of `run:` text.

## Template: `.github/workflows/rebuild-site.yml` in the dispatch repository

```yaml
# Rebuild site — DISPATCH REPOSITORY copy (source: docs/rebuild-dispatch-repo.md).
#
# This repository holds only this file. WordPress's CHAPTER_GITHUB_TOKEN is
# scoped to THIS repository (GitHub needs Contents: write for repository_dispatch;
# there is nothing narrower). The code repository is checked out READ-ONLY with
# SOURCE_SSH_KEY, so the CMS-held token can never reach deployable code
# (openspec rebuild-credential-boundary § CMS-held credentials cannot change
# deployed code). Keep this file identical to the source repository's
# .github/workflows/rebuild-site.yml apart from the `on:` block (no push) and
# the two checkout steps; bump action pins together (docs/security-gates.md
# § Bumping the pins).
#
# Repository variables (Settings → Variables) — same names as the source repo:
#   SOURCE_REPOSITORY         owner/repo — the code repository              (required)
#   WP_API_BASE               https://example.org/wp-json/progressnow/v1  (required)
#   STATIC_DEPLOY_TARGET      s3 | rsync | artifact                        (default artifact)
#   AWS_REGION / AWS_ROLE_ARN / S3_BUCKET / CLOUDFRONT_DISTRIBUTION_ID    (s3)
#   RSYNC_TARGET / RSYNC_HOST_KEY                                          (rsync)
#   WP_BUILD_STATUS_URL       optional https://example.org/wp-json/progressnow/v1/build-status
# Secrets:
#   SOURCE_SSH_KEY            private half of a READ-ONLY deploy key on SOURCE_REPOSITORY (required)
#   RSYNC_SSH_KEY             private key for the rsync target             (rsync)
#   CHAPTER_REBUILD_SECRET    HMAC secret shared with WordPress (build-status; CHAPTER_REBUILD_SECRET_IN there when split)
# The AWS role (infra/terraform in the source repository) must trust
# repo:<owner>/<this repo>:ref:refs/heads/main and :environment:production.
name: Rebuild site

on:
  repository_dispatch:
    types: [rebuild-site]
  workflow_dispatch:
    inputs:
      contentVersion:
        description: Content version to stamp into shell-manifest.json (blank = from /routes)
        required: false
        default: ''

concurrency:
  group: rebuild-site
  cancel-in-progress: false

permissions: {}

jobs:
  build:
    name: Generate (${{ vars.STATIC_DEPLOY_TARGET || 'artifact' }})
    runs-on: ubuntu-latest
    timeout-minutes: 30
    permissions:
      contents: read
    outputs:
      buildId: ${{ steps.manifest.outputs.buildId }}
      contentVersion: ${{ steps.manifest.outputs.contentVersion }}
    env:
      NUXT_PUBLIC_WP_API_BASE: ${{ vars.WP_API_BASE }}
      CHAPTER_CONTENT_VERSION: ${{ github.event.client_payload.contentVersion || github.event.inputs.contentVersion || '' }}
      REQUEST_ID: ${{ github.event.client_payload.requestId || '' }}
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          repository: ${{ vars.SOURCE_REPOSITORY }} # owner/repo — the code repository
          ref: main
          ssh-key: ${{ secrets.SOURCE_SSH_KEY }} # READ-ONLY deploy key on that repository
          persist-credentials: false

      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version-file: .nvmrc
          cache: npm
          cache-dependency-path: nuxt-js/package-lock.json

      - name: Require WP_API_BASE
        run: |
          if [ -z "$NUXT_PUBLIC_WP_API_BASE" ]; then
            echo "::error::Repository variable WP_API_BASE is not set" && exit 1
          fi
          echo "Reading from $NUXT_PUBLIC_WP_API_BASE (content v${CHAPTER_CONTENT_VERSION:-from /routes}, request ${REQUEST_ID:-n/a})"

      - name: Report build started
        if: vars.WP_BUILD_STATUS_URL != ''
        env:
          CHAPTER_REBUILD_SECRET: ${{ secrets.CHAPTER_REBUILD_SECRET }}
          WP_BUILD_STATUS_URL: ${{ vars.WP_BUILD_STATUS_URL }}
          RUN_ID: ${{ github.run_id }}
        run: |
          node .github/scripts/build-status.mjs "$WP_BUILD_STATUS_URL" started "run-$RUN_ID" "$REQUEST_ID" "$CHAPTER_CONTENT_VERSION" || echo "::warning::build-status (started) failed"

      - name: Install (no lifecycle scripts; nuxt prepare runs explicitly)
        working-directory: nuxt-js
        run: |
          npm ci --ignore-scripts
          npx nuxt prepare

      - name: Generate
        working-directory: nuxt-js
        run: |
          npm run generate
          npm run verify:output

      - name: Read manifest
        id: manifest
        working-directory: nuxt-js
        run: |
          echo "buildId=$(node -p 'require("./.output/public/shell-manifest.json").buildId')" >> "$GITHUB_OUTPUT"
          echo "contentVersion=$(node -p 'require("./.output/public/shell-manifest.json").contentVersion')" >> "$GITHUB_OUTPUT"

      # Handed to the deploy job; with the artifact target it is the result and
      # is kept a week for inspection, otherwise a day.
      - name: Upload the build
        uses: actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a # v7.0.1
        with:
          name: site-${{ steps.manifest.outputs.buildId }}
          path: nuxt-js/.output/public
          if-no-files-found: error
          retention-days: ${{ (vars.STATIC_DEPLOY_TARGET || 'artifact') == 'artifact' && 7 || 1 }}

  # ---- s3 (+ optional CloudFront) ----
  deploy-s3:
    name: Deploy (s3)
    needs: [build]
    if: vars.STATIC_DEPLOY_TARGET == 's3' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    timeout-minutes: 15
    environment: production
    permissions:
      id-token: write # the only job that can mint an OIDC token
    steps:
      - uses: actions/download-artifact@3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c # v8.0.1
        with:
          name: site-${{ needs.build.outputs.buildId }}
          path: site

      - name: Configure AWS credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@cbe3b392738ccf3f987d68400dafcf4b0624a56c # v6.2.4
        with:
          role-to-assume: ${{ vars.AWS_ROLE_ARN }}
          aws-region: ${{ vars.AWS_REGION }}

      - name: Sync to S3 (assets immutable, pages/payloads short-lived, manifest last)
        working-directory: site
        env:
          S3_BUCKET: ${{ vars.S3_BUCKET }}
        run: |
          set -euo pipefail
          BUCKET="s3://${S3_BUCKET}"
          # 1. hashed assets: immutable
          aws s3 sync _nuxt "$BUCKET/_nuxt" --no-progress \
            --cache-control "public, max-age=31536000, immutable"
          # 2. everything else except the manifest: revalidate every minute
          aws s3 sync . "$BUCKET" --no-progress --delete \
            --exclude "_nuxt/*" --exclude "shell-manifest.json" \
            --cache-control "public, max-age=60"
          # 3. the manifest last, so it only ever points at uploaded assets
          aws s3 cp shell-manifest.json "$BUCKET/shell-manifest.json" \
            --cache-control "public, max-age=60" --content-type "application/json"

      - name: Invalidate CloudFront
        if: vars.CLOUDFRONT_DISTRIBUTION_ID != ''
        env:
          CLOUDFRONT_DISTRIBUTION_ID: ${{ vars.CLOUDFRONT_DISTRIBUTION_ID }}
        run: |
          aws cloudfront create-invalidation \
            --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
            --paths "/shell-manifest.json" "/_payload.json" "/*/_payload.json" "/_nuxt/builds/*"

  # ---- rsync (same-host mode: into CHAPTER_STATIC_DIR through an rrsync-restricted key) ----
  deploy-rsync:
    name: Deploy (rsync)
    needs: [build]
    if: vars.STATIC_DEPLOY_TARGET == 'rsync' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    timeout-minutes: 15
    environment: production
    permissions: {}
    steps:
      - uses: actions/download-artifact@3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c # v8.0.1
        with:
          name: site-${{ needs.build.outputs.buildId }}
          path: site

      - name: Prepare SSH (pinned host key, no keyscan)
        env:
          SSH_KEY: ${{ secrets.RSYNC_SSH_KEY }}
          HOST_KEY: ${{ vars.RSYNC_HOST_KEY }}
        run: |
          set -euo pipefail
          if [ -z "$HOST_KEY" ]; then
            echo "::error::Repository variable RSYNC_HOST_KEY is not set, and the deploy will not trust a host on first use. On the host run 'ssh-keyscan -t ed25519 localhost' and compare its fingerprint with 'ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub'; store the known_hosts line (hostname first) as RSYNC_HOST_KEY. See docs/deployment.md §4."
            exit 1
          fi
          if [ -z "$SSH_KEY" ]; then
            echo "::error::Secret RSYNC_SSH_KEY is not set (docs/deployment.md §4: a key restricted with rrsync -wo)."
            exit 1
          fi
          mkdir -p ~/.ssh && chmod 700 ~/.ssh
          printf '%s\n' "$SSH_KEY" > ~/.ssh/id_deploy && chmod 600 ~/.ssh/id_deploy
          printf '%s\n' "$HOST_KEY" > ~/.ssh/known_hosts && chmod 600 ~/.ssh/known_hosts

      - name: Rsync (manifest last)
        working-directory: site
        env:
          RSYNC_TARGET: ${{ vars.RSYNC_TARGET }}
        run: |
          set -euo pipefail
          if [ -z "$RSYNC_TARGET" ]; then
            echo "::error::Repository variable RSYNC_TARGET is not set (deploy@host:/ with an rrsync-restricted key)."
            exit 1
          fi
          TARGET="${RSYNC_TARGET%/}"
          RSH="ssh -i ~/.ssh/id_deploy -o StrictHostKeyChecking=yes"
          rsync -az --delete --exclude shell-manifest.json -e "$RSH" ./ "$TARGET/"
          rsync -az -e "$RSH" shell-manifest.json "$TARGET/shell-manifest.json"

  report:
    name: Report build status
    needs: [build, deploy-s3, deploy-rsync]
    if: always() && vars.WP_BUILD_STATUS_URL != ''
    runs-on: ubuntu-latest
    timeout-minutes: 5
    permissions:
      contents: read
    env:
      WP_BUILD_STATUS_URL: ${{ vars.WP_BUILD_STATUS_URL }}
      CHAPTER_REBUILD_SECRET: ${{ secrets.CHAPTER_REBUILD_SECRET }}
      DEPLOY_TARGET: ${{ vars.STATIC_DEPLOY_TARGET || 'artifact' }}
      RUN_ID: ${{ github.run_id }}
      REQUEST_ID: ${{ github.event.client_payload.requestId || '' }}
      CHAPTER_CONTENT_VERSION: ${{ github.event.client_payload.contentVersion || github.event.inputs.contentVersion || '' }}
      BUILD_ID: ${{ needs.build.outputs.buildId }}
      BUILT_CONTENT_VERSION: ${{ needs.build.outputs.contentVersion }}
      BUILD_RESULT: ${{ needs.build.result }}
      S3_RESULT: ${{ needs.deploy-s3.result }}
      RSYNC_RESULT: ${{ needs.deploy-rsync.result }}
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          repository: ${{ vars.SOURCE_REPOSITORY }} # owner/repo — the code repository
          ref: main
          ssh-key: ${{ secrets.SOURCE_SSH_KEY }} # READ-ONLY deploy key on that repository
          persist-credentials: false
      # build-status.mjs is dependency-free ESM: Node, no npm ci.
      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version-file: .nvmrc
      - name: Signed POST /build-status
        run: |
          case "$DEPLOY_TARGET" in
            s3) deploy="$S3_RESULT" ;;
            rsync) deploy="$RSYNC_RESULT" ;;
            *) deploy=success ;; # artifact: the build is the result
          esac
          if [ "$BUILD_RESULT" = success ] && [ "$deploy" = success ]; then
            node .github/scripts/build-status.mjs "$WP_BUILD_STATUS_URL" succeeded "$BUILD_ID" "$REQUEST_ID" "$BUILT_CONTENT_VERSION" \
              || echo "::warning::build-status (succeeded) failed"
          else
            node .github/scripts/build-status.mjs "$WP_BUILD_STATUS_URL" failed "run-$RUN_ID" "$REQUEST_ID" "$CHAPTER_CONTENT_VERSION" \
              "Workflow run $RUN_ID failed (build: $BUILD_RESULT, deploy[$DEPLOY_TARGET]: $deploy)" || true
          fi
```
