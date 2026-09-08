## 1. Script-context encoder

- [ ] 1.1 Add `inc/escaping.php` with `progressnow_json_for_script( $data ): string` (`JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE`, U+2028/2029 replaced); require it first in `functions.php`
- [ ] 1.2 Switch `inc/seo.php` JSON-LD output to the encoder; assert `</script>` in a title cannot terminate the block (`tests/test-seo.php`)
- [ ] 1.3 Switch `inc/shell.php` (`__SHELL_DATA__`, `__NUXT__.config`, importmap) to the encoder; keep `tests/test-shell.php` "hostile content cannot escape the payload" green
- [ ] 1.4 Add the U+2028/`>`/`&` parity vector to `next-js/lib/json-ld.ts` `serializeJsonLd` and `next-js/test/unit/json-ld.spec.ts`

## 2. Hostile-content regression suite

- [ ] 2.1 Add `tests/test-output-escaping.php`: seed hostile values into post title, dek, committee, event venue/city, Chapter Settings name/tagline/contact, menu label, attachment alt, category label
- [ ] 2.2 Render front, posts index, single post, single event, calendar, about, get-involved, generic page, 404, search, author, ICS; assert no `<script`, `onerror=`, or unescaped `"` from the fixtures survives outside the JSON-LD/`__SHELL_DATA__` encoders
- [ ] 2.3 Add single-escape assertions (`Tom & Jerry's "Quotes"` renders once-escaped) for every field family

## 3. Autoescape

- [ ] 3.1 Enable `autoescape => 'html'` in `StarterSite::update_twig_environment_options`
- [ ] 3.2 Mark every existing `|raw` with `{# raw: kses #}` (24 sites in `views/`) and `{# raw: encoder #}` for `shell_data_json` / `html_data_attrs`
- [ ] 3.3 Sweep context builders (`inc/options.php`, `inc/identity.php`, `inc/pages.php`, `inc/interior.php`, `inc/payloads.php`, `src/StarterSite.php`) for `esc_html`/`esc_attr` applied to Twig-bound values; remove or mark
- [ ] 3.4 Run `composer test` until 2.x is green; manually load every template in EN and ES

## 4. Gate

- [ ] 4.1 Add `bin/twig-audit.mjs`: fails on `|raw` without marker, `<script>` interpolation not via the encoder, or autoescape not enabled in `StarterSite.php`
- [ ] 4.2 Add a PHPUnit test that runs the same checks (so `composer test` alone catches it)
- [ ] 4.3 Add the audit step to the theme `js` job in `.github/workflows/ci.yml`
- [ ] 4.4 Document the rule in the theme README ("Styling conventions" → new "Output escaping" section) and in `openspec/config.yaml` project rules
