<?php
/**
 * Output escaping helpers shared by every context builder and template.
 *
 * Owns: the ONE script-context encoder. Every value serialized into an
 * inline <script> element (JSON-LD in inc/seo.php, `__SHELL_DATA__`,
 * `__NUXT__.config` and the importmap in inc/shell.php, and any future
 * block) goes through progressnow_json_for_script() so an editor-controlled
 * string can never terminate the element or inject markup. HTML/attribute
 * contexts are Twig autoescape (src/StarterSite.php) with the `esc_html`
 * strategy below; see the theme README "Output escaping".
 *
 * Loaded first from functions.php so the other inc/ files can rely on it.
 */

/**
 * Script-safe JSON: `<`, `>`, `&`, `'` and `"` become JSON unicode escapes,
 * `/` is always escaped (`<\/script>` cannot close a script element) and
 * U+2028/U+2029 are escaped for parity with next-js/lib/json-ld.ts.
 * `JSON_UNESCAPED_UNICODE` keeps the rest readable (JSON-LD is visible in
 * page source and validators). Never pass `JSON_UNESCAPED_SLASHES`.
 *
 * @param mixed $data  Serializable data.
 * @param int   $extra Extra json_encode flags (e.g. JSON_PRETTY_PRINT).
 * @return string JSON, or "" when the data cannot be encoded.
 */
/**
 * Twig `esc_html` escape strategy — the autoescape default.
 *
 * WordPress storage is entity-normalized: every save runs through kses
 * (inc/roles.php), which turns `&` into `&amp;` and stray `<` into `&lt;`, and
 * wptexturize emits `&#038;`. Core's esc_html()/esc_attr() therefore never
 * double-encode an existing entity; Twig's built-in `html` strategy does,
 * so `Arts &amp; Culture` would render as the literal text "&amp;". This
 * strategy is _wp_specialchars() with double_encode = false: `<`, `>`, `"`,
 * `'` and bare `&` are still escaped (markup can never survive), valid
 * entities pass through once. Registered on Twig's EscaperRuntime by
 * StarterSite::add_to_twig(); bin/twig-audit.mjs enforces the strategy.
 *
 * @param string $string  Value to escape.
 * @param string $charset Twig passes the environment charset (unused: UTF-8).
 * @return string
 */
function progressnow_esc_html( $string, $charset = 'UTF-8' ) {
	return _wp_specialchars( (string) $string, ENT_QUOTES, 'UTF-8', false );
}

function progressnow_json_for_script( $data, $extra = 0 ) {
	$flags  = JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE | (int) $extra;
	$flags &= ~JSON_UNESCAPED_SLASHES;

	$json = wp_json_encode( $data, $flags );
	if ( ! is_string( $json ) ) {
		return '';
	}

	return str_replace( array( "\u{2028}", "\u{2029}" ), array( '\\u2028', '\\u2029' ), $json );
}
