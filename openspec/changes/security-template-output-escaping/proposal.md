## Why

The PHP theme — the frontend every install ships — renders Twig with autoescape **off**. Timber leaves it disabled by default and `src/StarterSite.php` keeps the enabling line commented out (`// $options['autoescape'] = true;`). `views/` contains 431 `{{ … }}` interpolations; only 24 are deliberately `|raw` (kses'd editor prose) and attribute contexts are hand-escaped with `|e("html_attr")`. Safety therefore depends on every PHP context builder pre-escaping every string, nothing enforces that, and PHPCS (planned in `security-headers-and-cicd-gates`) cannot see Twig at all.

One concrete sink is confirmed: `inc/seo.php` serializes JSON-LD with `wp_json_encode( …, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE )` — no `JSON_HEX_TAG` — and `headline` is `html_entity_decode( get_the_title() )`. A post title, dek, committee name, event venue, or chapter name containing `</script><script>…` breaks out of the `<script type="application/ld+json">` block on every PHP-rendered page that carries it. Any account with `unfiltered_html` (Administrator, Editor — the roles `security-authoring-least-privilege` targets) stores such a value unchanged; ACF text fields are not kses'd for those roles either. `inc/shell.php` already encodes `__SHELL_DATA__` and `__NUXT__.config` correctly (`JSON_HEX_TAG | JSON_HEX_AMP`); the safe pattern exists but is not the only pattern.

No open change covers this: `security-sanitize-url-sinks` is URL attributes, `security-authoring-least-privilege` reduces the *source*, and the CSP in `security-headers-and-cicd-gates` is a backstop that the PHP theme does not have yet.

## What Changes

- **Twig autoescape on** (`html` strategy) through `timber/twig/environment/options`; every `|raw` becomes an explicit, reviewed site carrying a `{# raw: kses #}` marker, and a test fails on any `|raw` without one.
- **One script-context encoder** `progressnow_json_for_script( $data )` (`JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE`, never `JSON_UNESCAPED_SLASHES`) used by JSON-LD, `__SHELL_DATA__`, `__NUXT__.config`, the importmap, and any future inline JSON. Next.js `serializeJsonLd` gains `>`/`&`/U+2028/U+2029 parity with a shared test vector.
- **Double-escape sweep**: contexts that pre-escape with `esc_html()`/`esc_attr()` for Twig output stop doing so (or are marked) so autoescape does not produce `&amp;amp;`.
- **Hostile-content regression suite** (`tests/test-output-escaping.php`): seed title / dek / venue / committee / Chapter Settings name / menu label / alt text with `</script><script>`, `"><img onerror>`, `'-alert(1)-'` and assert the rendered HTML of front, blog index, single post, single event, calendar, about, get-involved, 404, search, author, ICS, and the JSON-LD block never contains an executable fragment.
- **Twig lint gate** in CI: `bin/twig-audit.mjs` (no deps) fails when a `|raw` lacks the marker, when a `<script>` in a template interpolates anything but the encoder's output, or when `autoescape` is not enabled.

## Capabilities

### New Capabilities
- `template-output-escaping`: every Twig interpolation is escaped by default; trusted HTML and inline JSON are explicit, encoded, tested, and gated.

### Modified Capabilities
- `structured-data`: JSON-LD is encoded so it can never terminate its own `<script>` element (added requirement; existing requirements unchanged).

## Impact

- **Theme PHP:** `src/StarterSite.php` (autoescape option), new `inc/escaping.php` (encoder), `inc/seo.php` (JSON-LD), `inc/shell.php` (use the shared encoder), `inc/payloads.php`/`inc/pages.php`/`inc/options.php`/`inc/identity.php` where values are pre-escaped for Twig.
- **Twig:** all 24 `|raw` sites marked; any interpolation found double-escaped fixed.
- **Tests:** new `tests/test-output-escaping.php`; `tests/test-seo.php` and `tests/test-shell.php` gain hostile-title cases; `next-js/test/unit/json-ld.spec.ts` gains the parity vector.
- **CI:** one extra step in the theme `js` job (`node bin/twig-audit.mjs`).
- **Behavior:** identical HTML for well-formed content; hostile content renders as text instead of markup. No API or contract change.
- **Coordinates with:** `security-headers-and-cicd-gates` (PHPCS `EscapeOutput` sniff covers PHP echo sites; this change covers Twig and script contexts), `security-authoring-least-privilege` (source reduction), `security-sanitize-url-sinks` (URL attributes). Does not modify those changes.
