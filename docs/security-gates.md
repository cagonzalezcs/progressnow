# Security gates

What CI enforces on every pull request, how to run the same checks locally, and
what to do when one fails. Owned by openspec change
`security-headers-and-cicd-gates`; the response headers and CSP the theme
sends are covered in the second half.

The gates exist to make the security remediation self-enforcing: a fix that
lands here cannot regress silently. They fail on defect classes, not style.

## The three required jobs

| Job (`.github/workflows/ci.yml`) | What it runs | Fails when |
|---|---|---|
| `php-sast` | `composer lint` → PHPCS with `wp-content/themes/progressnow/phpcs.xml.dist` | Custom theme PHP echoes unescaped output, reads unsanitized input, processes form data without a nonce check, builds SQL without `$wpdb->prepare()`, or calls `eval`/`system`/`unserialize`-family functions |
| `secrets` | gitleaks over every commit in the push/PR (`.gitleaks.toml`) | A credential-shaped string (API key, token, private key, password assignment) is committed |
| `artifact-guard` | `.github/scripts/artifact-guard.sh` over `git ls-files` | A backup, installer, archive, database dump, `wp-config.php` or `.env` file is tracked |

Merges to `main` require all three green (repository ruleset "Protect main",
required status checks). The rest of CI (lint, typecheck, unit, e2e, a11y)
stays as before.

### Run them locally

```bash
cd wp-content/themes/progressnow && composer lint          # PHPCS security sniffs (composer install first)
.github/scripts/artifact-guard.sh                          # tracked-file artifact guard
gitleaks dir . --config .gitleaks.toml --redact            # needs `brew install gitleaks`
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
