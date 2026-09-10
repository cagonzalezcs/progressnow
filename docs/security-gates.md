# Security gates

What CI enforces on every pull request, how to run the same checks locally, and
what to do when one fails. Owned by openspec change
`security-headers-and-cicd-gates`; the response headers and CSP the theme
sends are covered in the second half.

The gates exist to make the security remediation self-enforcing: a fix that
lands here cannot regress silently. They fail on defect classes, not style.

## The required jobs

| Job | What it runs | Fails when |
|---|---|---|
| `php-sast` | `composer lint` → PHPCS with `wp-content/themes/progressnow/phpcs.xml.dist` | Custom theme PHP echoes unescaped output, reads unsanitized input, processes form data without a nonce check, builds SQL without `$wpdb->prepare()`, or calls `eval`/`system`/`unserialize`-family functions |
| `secrets` | gitleaks over every commit in the push/PR (`.gitleaks.toml`) | A credential-shaped string (API key, token, private key, password assignment) is committed |
| `artifact-guard` | `.github/scripts/artifact-guard.sh` over `git ls-files` | A backup, installer, archive, database dump, `wp-config.php` or `.env` file is tracked |
| `workflow-lint` (`.github/workflows/workflow-lint.yml`) | actionlint + zizmor over the workflow files (§ Pipeline supply chain) | An action is not pinned to a commit, an expression appears inside `run:` text, a job asks for more token permissions than it uses, a checkout persists credentials, or a workflow has a syntax or shell error |

Merges to `main` require all four green (repository ruleset "Protect main",
required status checks — `workflow-lint` is the newest; add it to the ruleset
when it lands). The three ci.yml gates come from `.github/workflows/ci.yml`.
The rest of CI is not required: the theme and nuxt-js jobs, `dependency-review`
(pull requests only: fails on a high-severity vulnerability in a dependency the
PR adds or bumps; it needs the repository's *Dependency graph* enabled under
Settings → Code security and analysis, and fails with "not supported on this
repository" until it is), and the next-js fan-out — `next-js-check`, `next-js-build`, then
`next-js-e2e` / `next-js-a11y` / `next-js-failure` against that one build, and
`next-js-container` beside them. On branches and pull requests the next-js jobs
are skipped (shown as skipped, never as passed) when the change touches nothing
next-js depends on (`.github/scripts/next-paths.mjs`); on `main` they always
run; the three gates run unconditionally.

### Run them locally

```bash
cd wp-content/themes/progressnow && composer lint          # PHPCS security sniffs (composer install first)
.github/scripts/artifact-guard.sh                          # tracked-file artifact guard
gitleaks dir . --config .gitleaks.toml --redact            # needs `brew install gitleaks`
actionlint                                                 # brew install actionlint
zizmor --persona regular .                                 # brew install zizmor (or pip install zizmor==1.30.1)
```

Enable the pre-commit mirror once per clone:

```bash
git config core.hooksPath .githooks
```

It runs the artifact guard over the staged paths and `gitleaks protect --staged`
when gitleaks is installed (it warns and continues when it is not; CI still
scans).

### When a gate fails

**`php-sast`.** The report names the file, line and sniff. Fix the code:
escape at the `echo`/`printf` (`esc_html`, `esc_attr`, `esc_url`,
`wp_kses_post`), sanitize the superglobal read (`sanitize_text_field`,
`absint`, `wp_unslash`), verify the nonce, prepare the query. A
`// phpcs:ignore <Sniff.Name> -- <reason>` on the line is acceptable only when
the sniff cannot see an existing safeguard — for example output produced by the
script-context encoder `progressnow_json_for_script()` (already auto-escaped in
the ruleset), or a `text/calendar` body escaped by the ICS serializer. The
reason is mandatory; a bare ignore is a review blocker. The ruleset is
deliberately the security subset of WordPress Coding Standards, not the full
style ruleset — do not widen it to `WordPress-Extra` without a separate change.

**`secrets`.** If the finding is real: rotate the credential first (it is
already in history), then remove it and purge history before merging. If it is
a fixture or placeholder, add a *specific* regex (the exact value or a named
`…-test-secret` pattern) to `[allowlist].regexes` in `.gitleaks.toml` with a
comment saying what it is. Never allowlist a whole directory of code, and never
allowlist a value you cannot prove is synthetic.

**`artifact-guard`.** Remove the file. If it was ever a real backup or dump,
purge it from history (`git filter-repo`) and rotate anything it contained. A
genuine false positive (a documented template like `wp-config-sample.php`) goes
in `.github/artifact-guard-allow` as a regex with a reason. The same script
takes a directory argument to vet a deploy bundle before upload.

## Pipeline supply chain

Owned by openspec change `security-cicd-supply-chain-hardening`. The workflow
definitions are code with a threat model: a compromised action tag, a
malicious repository variable, a stray branch or a missing variable must not
be able to deploy. `workflow-lint.yml` enforces the rules on every push and
pull request with two release binaries verified against pinned SHA-256s —
actionlint (syntax, expression types, shellcheck over every `run:` script) and
zizmor (the audits below; `.github/zizmor.yml` makes hash-pinning mandatory for
first-party actions too).

| Rule | Where | zizmor audit |
|---|---|---|
| Every `uses:` is a full commit SHA with the version as a comment: `actions/checkout@3d3c42e5… # v7.0.1` | all workflows | `unpinned-uses`, `impostor-commit`, `known-vulnerable-actions` |
| `permissions: {}` at the workflow level; each job grants what it uses (`contents: read` to check out); `id-token: write` only on `deploy-s3` | all workflows | `excessive-permissions` |
| `${{ }}` never appears inside `run:` text — `vars.*`, `secrets.*`, `github.event.*` and step outputs go through `env:` | all workflows | `template-injection` |
| `actions/checkout` sets `persist-credentials: false` (no job pushes) | all workflows | `artipacked` |
| `npm ci --ignore-scripts` for the theme and next-js (CI and the Dockerfile); nuxt-js runs `nuxt prepare` explicitly after it (CI, `vercel.json`) | ci.yml, rebuild-site.yml, next-js/Dockerfile, nuxt-js/vercel.json | — |
| Deploys run only from `main`, inside the `production` environment, from a build made with a read-only token; `RSYNC_HOST_KEY` is required and the key is rrsync-restricted (`docs/deployment.md` §3–4); the reference AWS role trusts only `main` and that environment | rebuild-site.yml, infra/terraform | — |
| Toolchain pinned: `.nvmrc` = 22 with `engine-strict` in every app, Timber on a tagged release with `platform.php` declared, production Nuxt builds fail without `NUXT_PUBLIC_WP_API_BASE` | repo root, `.npmrc`, `composer.json`, `nuxt-js/scripts/vercel-build.mjs` | — |

**When it fails.** `template-injection`: move the expression into the step's
`env:` and reference the variable from the script. `unpinned-uses`: pin to the
tag's commit (procedure below) and keep the `# vX.Y.Z` comment.
`excessive-permissions`: the job asked for more than it uses — grant per job,
never at the top. `artipacked`: add `persist-credentials: false`. actionlint
names the line; a shellcheck finding is usually a real bug in the script —
fix it rather than silence it.

### Bumping the pins

Until Renovate lands (openspec `security-dependency-lifecycle`; its
`helpers:pinGitHubActionDigests` preset keeps SHA pins current automatically),
bump the pins by hand **once a quarter** and whenever an advisory names an
action in use. For each action take the newest tag of the major in use, resolve
its commit — for an annotated tag the peeled `^{}` line — and update the SHA and
the comment together:

```bash
git ls-remote --tags https://github.com/actions/checkout 'v7.*' | sort -V -k2 | tail -2
```

Moving to a new major is a separate, deliberate step: read every major's
release notes between the two pins first (the Node 24 runtime needs runner
≥ 2.327.1; `upload-artifact` and `download-artifact` move together; input
defaults change — download-artifact v8 fails on a digest mismatch, setup-node
v5+ auto-caches when a root `package.json` names a `packageManager`), bump one
family per commit so a CI failure names its cause, and lint between commits.

Then the tools in `workflow-lint.yml`: `ACTIONLINT_VERSION` /
`ACTIONLINT_SHA256` (the `linux_amd64` line of actionlint's `checksums.txt`
release asset) and `ZIZMOR_VERSION` / `ZIZMOR_SHA256` (`sha256sum` of the
`zizmor-x86_64-unknown-linux-gnu.tar.gz` release asset), plus `.nvmrc` when
Node's active LTS moves. Run `actionlint` and `zizmor .` locally, open a pull
request titled `chore: quarterly action pin bump`, and let `workflow-lint`
confirm.

## Response headers and the CSP (theme side)

`inc/security.php` emits, on every front-end response (`send_headers`):

| Header | Value |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `SAMEORIGIN` (the Customizer and editor previews frame the front end from wp-admin) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=()` |
| `Strict-Transport-Security` | `max-age=86400` over TLS only — one day to start; raise with the `progressnow/security/hsts_max_age` filter once the whole host is HTTPS, add `preload` last |

HTML responses (not feeds, the ICS calendar, robots or REST) also get a
nonce-based Content-Security-Policy:

```
default-src 'self'; script-src 'self' 'nonce-…'; style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: https://secure.gravatar.com https://*.gravatar.com;
font-src 'self' data:; connect-src 'self'; media-src 'self';
frame-src https://www.youtube-nocookie.com https://player.vimeo.com;
frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self';
report-uri <site>/wp-json/progressnow/v1/csp-report
```

- **No `unsafe-inline` for scripts.** The nonce is minted once per request and
  stamped on every executable `<script>` WordPress prints (`wp_script_attributes`,
  `wp_inline_script_attributes`) and on the Nuxt shell tags. JSON data blocks
  (`application/json`, `application/ld+json`) are not executable and carry no
  nonce. An injected inline script that survived kses and the encoder does not
  run once the policy enforces.
- **Enumerated third parties.** The video block's players (`frame-src`) and
  Gravatar (`img-src`) are the only external origins the site loads today;
  fonts are self-hosted; the REST fast-path is same-origin. The Vite dev
  server (when `dist/vite-dev-server.json` exists) and a separate
  `CHAPTER_STATIC_ORIGIN` are added automatically. Anything else (analytics, a
  map embed) goes through the `progressnow/security/csp` filter — the test
  suite pins that `script-src` never gains `unsafe-inline`.
- **Styles stay `unsafe-inline`.** Vue style bindings, the inline first-paint
  `<style>` and Vite's dev injection cannot carry a nonce; a style nonce buys
  little once scripts are locked. Same call as the Next.js frontend.

### Rollout: report-only → enforce

The policy ships as `Content-Security-Policy-Report-Only` by default. Browsers
post violations to the sink, which aggregates them by (directive, blocked URL,
page path) into a bounded option — at most 50 distinct signatures, 200
characters per field, 8 KB per report, query strings dropped — so it cannot be
used to grow `wp_options`.

1. Deploy. Browse the site (home, a post with a video, the calendar, a page
   with a gallery, the styleguide) and watch:
   ```bash
   wp chapter csp-reports            # table: directive, blocked, document, source, count
   wp chapter csp-reports --format=json
   ```
   Also watch the browser console; report-only violations print there too.
2. For each legitimate violation, add the origin via the
   `progressnow/security/csp` filter (a small mu-plugin or `functions.php`
   snippet on the host). For anything else — an injected script, a third party
   you did not expect — investigate before allowing.
3. After a release cycle with no unexplained reports, flip to enforcing:
   ```php
   define( 'CHAPTER_CSP_MODE', 'enforce' );   // wp-config.php; 'report-only' (default) | 'enforce' | 'off'
   ```
   Then `wp chapter csp-reports --clear` and keep watching; the sink stays on
   in enforcing mode.
4. Verify in a browser that the islands hydrate (header menu opens, blog
   search filters, the video block plays) and the console shows no CSP errors.

Do not add a second CSP at the reverse proxy or CDN, and do not serve HTML
from a shared cache that separates headers from bodies: the nonce in the
header must be the nonce in the page. A cache that stores the full response
(headers + body together, as origin caches and CDNs do) is fine.

The `report-uri` can be pointed at an external collector
(`progressnow/security/csp_report_uri` filter) or dropped (`''`).
