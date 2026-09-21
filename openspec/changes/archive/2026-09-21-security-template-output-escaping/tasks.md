## 1. Script-context encoder

- [x] 1.1 Add `inc/escaping.php` with `progressnow_json_for_script( $data ): string` (`JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE`, U+2028/2029 replaced); require it first in `functions.php`
- [x] 1.2 Switch `inc/seo.php` JSON-LD output to the encoder; assert `</script>` in a title cannot terminate the block (`tests/test-seo.php`)
- [x] 1.3 Switch `inc/shell.php` (`__SHELL_DATA__`, `__NUXT__.config`, importmap) to the encoder; keep `tests/test-shell.php` "hostile content cannot escape the payload" green
- [x] 1.4 Add the U+2028/`>`/`&` parity vector to `next-js/lib/json-ld.ts` `serializeJsonLd` and `next-js/test/unit/json-ld.spec.ts`

## 2. Hostile-content regression suite

- [x] 2.1 Add `tests/test-output-escaping.php`: seed hostile values into post title, dek, committee, event venue/city, Chapter Settings name/tagline/contact, menu label, attachment alt, category label
- [x] 2.2 Render front, posts index, single post, single event, calendar, about, get-involved, generic page, 404, search, author, ICS; assert no `<script`, `onerror=`, or unescaped `"` from the fixtures survives outside the JSON-LD/`__SHELL_DATA__` encoders
- [x] 2.3 Add single-escape assertions (`Tom & Jerry's "Quotes"` renders once-escaped) for every field family

## 3. Autoescape

- [x] 3.1 Enable `autoescape => 'html'` in `StarterSite::update_twig_environment_options`
- [x] 3.2 Mark every existing `|raw` with `{# raw: kses #}` (24 sites in `views/`) and `{# raw: encoder #}` for `shell_data_json` / `html_data_attrs`
- [x] 3.3 Sweep context builders (`inc/options.php`, `inc/identity.php`, `inc/pages.php`, `inc/interior.php`, `inc/payloads.php`, `src/StarterSite.php`) for `esc_html`/`esc_attr` applied to Twig-bound values; remove or mark
- [x] 3.4 Run `composer test` until 2.x is green; manually load every template in EN and ES — done 2026-09-21: `composer test` green (299 tests); every routable template loaded EN + ES from a worktree docroot against the MAMP DB (front, page, about, get-involved, calendar, posts index + page 2, single, single-event, category/date archive, author, search incl. a hostile query, 404), `page-styleguide.twig` / `single-password.twig` compiled via wp-cli (no such page in the DB); text-node scan for `&lt;tag` leaks, double-escaped entities and PHP notices → one regression: the author archive printed Timber's read-more anchor as text (`tease.twig` / `tease-post.twig` autoescaped `post.excerpt`). Fixed with `|kses_post|raw` + `{# raw: kses #}`; `tests/test-output-escaping.php` now seeds `posts` into the author case and asserts the link is markup

## 4. Gate

- [x] 4.1 Add `bin/twig-audit.mjs`: fails on `|raw` without marker, `<script>` interpolation not via the encoder, or autoescape not enabled in `StarterSite.php`
- [x] 4.2 Add a PHPUnit test that runs the same checks (so `composer test` alone catches it)
- [x] 4.3 Add the audit step to the theme `js` job in `.github/workflows/ci.yml`
- [x] 4.4 Document the rule in the theme README ("Styling conventions" → new "Output escaping" section) and in `openspec/config.yaml` project rules
