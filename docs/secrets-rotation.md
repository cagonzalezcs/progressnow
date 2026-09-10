# Secrets rotation runbook

Every credential the rebuild pipeline uses: where it lives, what it can
reach, how to rotate it so the pipeline stays signed throughout, how to verify,
and how to revoke (openspec `security-rebuild-transport-trust-boundary`,
capability `rebuild-credential-boundary` § Rotation runbook). WordPress
authentication salts have their own procedure in
[runtime-hardening.md](runtime-hardening.md) §3.

Rotate on a schedule (at least yearly; fine-grained PATs expire anyway), after
anyone with access leaves, and immediately on any suspicion that
`wp-config.php`, the PHP environment, a backup, an Actions log or a laptop was
exposed. Record each rotation in the log at the end.

## 0. Inventory

| Credential | Held by | Can reach | Section |
| --- | --- | --- | --- |
| `CHAPTER_GITHUB_TOKEN` (fine-grained PAT) | WordPress (env or `wp-config.php`) | `repository_dispatch` + push on the **dispatch repository only** ([rebuild-dispatch-repo.md](rebuild-dispatch-repo.md)); nothing on the code repository | §1 |
| `CHAPTER_REBUILD_SECRET` (+ optional `_OUT` / `_IN`) | WordPress; the receiver (Next `CHAPTER_REBUILD_SECRET`) and/or the Actions secret `CHAPTER_REBUILD_SECRET` | request a build (outbound HMAC); acknowledge a build status (inbound HMAC). Nothing else | §2 |
| `SOURCE_SSH_KEY` (read-only deploy key) | dispatch repository secret | read the code repository | §3 |
| `RSYNC_SSH_KEY` (rrsync-restricted deploy key) | Actions secret (repository or `production` environment) | write into `CHAPTER_STATIC_DIR` on the WordPress host, nothing else ([deployment.md](deployment.md) §4) | §4 |
| AWS deploy role (OIDC trust; no long-lived key) | `infra/terraform`; `AWS_ROLE_ARN` variable | the site bucket + CloudFront invalidation, from the trusted workflow subjects only | §5 |
| Vercel: GitHub App installation, project environment variables, personal tokens | Vercel | deploy `next-js/` from `main`; the Next runtime environment | §6 |
| `RSYNC_HOST_KEY` (public host key), `WP_API_BASE`, `WP_BUILD_STATUS_URL` | Actions variables | not secrets; re-capture the host key when the host's SSH key changes | — |

Principles that apply to every section:

- **Overlap, then revoke.** Add the new credential wherever it is accepted
  before removing the old one; verify with a real rebuild; revoke last.
- **Environment before file.** When re-supplying a WordPress value, prefer the
  environment variable (`deployment.md` §2 *Precedence*) so the new secret is
  never written into `wp-config.php`. The Site build panel shows `env` as the
  source.
- **Never paste a value into a ticket, a chat, a commit or a log.** The theme
  redacts upstream error bodies and shows only setting sources; keep it that way
  on the human side too.
- **No builds in flight.** Check the Site build panel reads `live` or `idle`
  before touching a shared secret; the 90 s debounce coalesces edits made
  during the change.

## 1. `CHAPTER_GITHUB_TOKEN` (github transport)

Scope check first: the token's *Repository access* must list **only** the
dispatch repository. A token that can see the code repository is the finding
this runbook exists for — treat it as compromised and follow the emergency
order in §7.

1. github.com → Settings → Developer settings → Fine-grained tokens →
   *Generate new token*: resource owner = the organisation/user that owns the
   dispatch repository; *Only select repositories* → `<owner>/<repo>-dispatch`;
   permissions **Contents: read and write**, **Metadata: read**; expiry ≤ 1
   year. Copy it once.
2. Supply it to WordPress as the `CHAPTER_GITHUB_TOKEN` environment variable
   (or replace the constant). No restart is needed for a constant; reload
   PHP-FPM for an environment change.
3. Verify: Site build → "Rebuild now" → status `requested` and a new run in the
   dispatch repository's Actions tab; the panel's *Rebuild settings* row shows
   `CHAPTER_GITHUB_TOKEN: env` (or `constant`).
4. Revoke the previous token (same page → *Delete*). Confirm a rebuild still
   works.

One-time migration off a token scoped to the code repository: do steps 1–3
with the dispatch repository already set up ([rebuild-dispatch-repo.md](rebuild-dispatch-repo.md)
§ Set-up), then revoke the old token and check the code repository's Settings
→ Deploy keys / Collaborators for anything else WordPress could have used.

## 2. `CHAPTER_REBUILD_SECRET` (webhook + `/build-status`)

Generate: `openssl rand -hex 32` (64 characters; the floor is 32 on both
sides — a shorter value disables the transport and is rejected by the receiver).

Who holds it depends on the transport:

| Transport | Outbound (WordPress signs → receiver verifies) | Inbound (`/build-status`: signer → WordPress verifies) |
| --- | --- | --- |
| `webhook` to Next | WordPress `CHAPTER_REBUILD_SECRET` (or `_OUT`) = Next `CHAPTER_REBUILD_SECRET` | Next `CHAPTER_REBUILD_SECRET` = WordPress `CHAPTER_REBUILD_SECRET` (or `_IN`) |
| `webhook` to a §6 receiver | WordPress = the receiver's verifying secret | whoever runs the build (the receiver, or Actions' `CHAPTER_REBUILD_SECRET`) = WordPress `_IN` / shared |
| `github` | — (the PAT dispatches; no HMAC outbound) | Actions secret `CHAPTER_REBUILD_SECRET` = WordPress `_IN` / shared |

Neither WordPress nor the receiver accepts two secrets at once, so the window
is closed by ordering rather than by dual acceptance:

1. Wait for the panel to read `live` or `idle` (no `scheduled`/`requested`/
   `building`).
2. Update the **verifier of the outbound direction** and the **signer of the
   inbound direction** — for Next these are the same value: set the new secret
   in the Next environment (Vercel → Project → Environment variables, then
   *Redeploy*; a container/VPS: update the environment file and restart) and,
   for the `github` transport or an Actions-run build, the Actions secret
   `CHAPTER_REBUILD_SECRET` in the repository that runs the workflow.
3. Immediately set the new value on WordPress (`CHAPTER_REBUILD_SECRET`
   environment variable, or `_OUT` + `_IN` when split). Anything edited between
   2 and 3 is coalesced by the debounce and dispatched after 3; a dispatch that
   did fall into the gap shows `needs_attention` — press "Rebuild now".
4. Verify both directions with one rebuild: "Rebuild now" → `requested` (the
   receiver accepted the signature) → `building` → `live` (the callback
   verified). A `401` from the receiver or a callback that never arrives means
   one side still has the old value; the panel names the setting's source.
5. There is nothing to revoke — the old value is simply gone from every
   holder. Grep the deployment's environment files and CI variables once to be
   sure it is not lingering.

Split secrets (`CHAPTER_REBUILD_SECRET_OUT` / `_IN`) let the two directions be
rotated independently when they terminate at different systems (outbound to a
receiver, inbound from Actions): rotate `_OUT` with the receiver in steps 2–4,
`_IN` with the Actions secret, and the other direction is untouched. A short
`_OUT`/`_IN` is an error, not a fallback to the shared value.

## 3. `SOURCE_SSH_KEY` (dispatch repository → code, read-only)

1. `ssh-keygen -t ed25519 -f source-readonly -C rebuild-dispatch-$(date +%F) -N ''`.
2. Code repository → Settings → Deploy keys → *Add* the new public key
   **without** write access, next to the old one.
3. Dispatch repository → Settings → Secrets → replace `SOURCE_SSH_KEY` with the
   new private half.
4. Verify: "Rebuild now" → the dispatch repository's build job checks the code
   out and completes.
5. Delete the old deploy key from the code repository.

## 4. `RSYNC_SSH_KEY` (deploy → `CHAPTER_STATIC_DIR`)

1. `ssh-keygen -t ed25519 -f rebuild-site -C rebuild-site-$(date +%F) -N ''`.
2. On the WordPress host, append a second restricted line to the deploy user's
   `~/.ssh/authorized_keys` for the new public key — same
   `restrict,command="rrsync -wo /var/www/html/static-site"` prefix
   ([deployment.md](deployment.md) §4). Both keys now work.
3. Replace the Actions secret `RSYNC_SSH_KEY` (repository or `production`
   environment scope — the jobs read both) with the new private half.
4. Verify: "Rebuild now" → `deploy-rsync` succeeds → `live`. Run the three
   checks from §4 (sync works, shell refused, read-back refused) with the new
   key.
5. Remove the old key's line from `authorized_keys`. Shred the old private
   key locally.

`RSYNC_HOST_KEY` is the host's public key, not a secret: re-capture it
(`ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub` on the host to compare)
only when the host's SSH key changes, e.g. after a rebuild of the server.

## 5. AWS deploy role (OIDC trust)

The role has no long-lived credential; "rotation" is a trust-policy change:

- **Move or add a workflow repository** (the dispatch repository, a staging
  environment): set `github_repository` / `github_oidc_subjects` in
  `infra/terraform` and `terraform apply`; the trusted subjects are
  `repo:<owner>/<repo>:ref:refs/heads/main` and
  `repo:<owner>/<repo>:environment:production` for each listed repository
  ([deployment.md](deployment.md) §5). Verify with a rebuild whose
  `deploy-s3` job assumes the role; a `not authorized to perform
  sts:AssumeRoleWithWebIdentity` error names the subject that is missing.
- **Suspected misuse**: remove the subject (or the whole trust policy) with
  `terraform apply`, review CloudTrail for `AssumeRoleWithWebIdentity` events
  on the role, restore from S3 versioning if objects were changed
  ([deployment.md](deployment.md) §8), then re-add the trust.
- **Rename**: a new role ARN from `terraform output github_variables` goes into
  the `AWS_ROLE_ARN` variable of the repository that runs the workflow.

## 6. Vercel

- **Deployments** come through the Vercel GitHub App on the repository, not a
  token in the repository. To rotate that trust, uninstall/reinstall the app
  (Vercel → Project → Git) — no secret to copy.
- **Environment variables** (`CHAPTER_REBUILD_SECRET`, `WP_API_BASE`, …):
  Project → Settings → Environment Variables → edit → **Redeploy** (values are
  read at build and at runtime; a change without a redeploy is not live).
  Follow §2 for the secret's ordering.
- **Personal / team tokens** used by the CLI or an MCP connector: Vercel →
  Account → Tokens → create a new one, update the tool that used it, delete the
  old one. They never belong in this repository or in CI secrets.
- The demo backend project (`deploy/mock-api`) has its own secret; treat it as
  a separate holder in §2.

## 7. Emergency order (suspected compromise)

1. WordPress: `CHAPTER_REBUILD_TRANSPORT=none` (environment variable — takes
   effect on the next request) so nothing is dispatched while you work; the
   freshness guard keeps the public site correct.
2. Revoke `CHAPTER_GITHUB_TOKEN` at github.com (§1 step 4) — first, because it
   is the only credential that can *write* anywhere.
3. Rotate the HMAC secret (§2), the deploy keys (§3, §4) and, if the Actions
   secrets may have been read, the OIDC trust (§5).
4. Review: the dispatch repository's and the code repository's recent commits
   and Actions runs, the `production` environment's deployment history,
   CloudTrail for the role, the WordPress host's access log around the
   suspected time. Rotate the WordPress salts
   ([runtime-hardening.md](runtime-hardening.md) §3.2) and revoke sessions.
5. Restore the transport, "Rebuild now", verify `live`. Record the incident
   below and in the incident runbook when `security-detection-and-response`
   adds it.

## Rotation log

| Date | Credential(s) | By | Notes |
| --- | --- | --- | --- |
| _pending_ | all of §0 | owner | First full rotation following this runbook is `security-rebuild-transport-trust-boundary` task 5.3; it needs access to the production host, the dispatch repository and the GitHub token page. |
