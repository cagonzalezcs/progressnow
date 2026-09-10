<?php
/**
 * Minimal Polylang function stub for WorDBless runs (Polylang Pro is absent).
 *
 * Loaded by tests/bootstrap.php only when `pll_current_language` is undefined.
 * Pure lookups backed by options and post meta — enough for the cache,
 * categories, payload, and REST language paths. It is deliberately NOT a
 * Polylang emulation: no query integration (`lang` tax queries), no rewrites,
 * no `PLL()` object, no switcher (`pll_the_languages()` returns nothing).
 * Anything richer must be tested against a real Polylang install.
 *
 * Unconfigured by default: no languages, so `progressnow_lang_*()` behave
 * exactly as without Polylang (lang '' everywhere) and the contract fixtures
 * stay byte-stable. A test opts in with:
 *
 *   progressnow_test_pll_configure( array( 'en', 'es' ), 'en' );
 *
 * then assigns languages with progressnow_test_pll_set_post_language() /
 * progressnow_test_pll_set_term_language() and links translations with
 * progressnow_test_pll_save_post_translations() /
 * progressnow_test_pll_save_term_translations(). The whole configuration
 * lives in options, which WorDBless clears after every test.
 */

const PROGRESSNOW_TEST_PLL_OPTION = '_progressnow_test_pll';

/* -------------------------------------------------------------------------
 * Test-side configuration (not Polylang API).
 * ---------------------------------------------------------------------- */

/**
 * @param string[]    $languages Language slugs in order (e.g. ['en', 'es']).
 * @param string|null $default   Default language (first slug when null).
 * @param string|null $current   Current request language (the default when null).
 * @param string[]    $names     Optional slug => display name.
 */
function progressnow_test_pll_configure( array $languages, $default = null, $current = null, array $names = array() ) {
	$languages = array_values( array_map( 'strval', $languages ) );
	$default   = null === $default ? (string) ( $languages[0] ?? '' ) : (string) $default;

	update_option(
		PROGRESSNOW_TEST_PLL_OPTION,
		array(
			'languages' => $languages,
			'names'     => $names,
			'default'   => $default,
			'current'   => null === $current ? $default : (string) $current,
			'terms'     => array(),
		),
		false
	);
}

function progressnow_test_pll_config() {
	return wp_parse_args(
		(array) get_option( PROGRESSNOW_TEST_PLL_OPTION, array() ),
		array(
			'languages' => array(),
			'names'     => array(),
			'default'   => '',
			'current'   => '',
			'terms'     => array(),
		)
	);
}

function progressnow_test_pll_update_config( array $patch ) {
	update_option( PROGRESSNOW_TEST_PLL_OPTION, array_merge( progressnow_test_pll_config(), $patch ), false );
}

function progressnow_test_pll_set_current( $lang ) {
	progressnow_test_pll_update_config( array( 'current' => (string) $lang ) );
}

function progressnow_test_pll_set_post_language( $post_id, $lang ) {
	update_post_meta( (int) $post_id, '_progressnow_test_lang', (string) $lang );
}

/**
 * @param array<string,int> $translations lang => post ID.
 */
function progressnow_test_pll_save_post_translations( array $translations ) {
	foreach ( $translations as $lang => $post_id ) {
		progressnow_test_pll_set_post_language( $post_id, $lang );
		update_post_meta( (int) $post_id, '_progressnow_test_translations', $translations );
	}
}

function progressnow_test_pll_set_term_language( $term_id, $lang ) {
	$config = progressnow_test_pll_config();

	$config['terms'][ (int) $term_id ]         = isset( $config['terms'][ (int) $term_id ] ) ? $config['terms'][ (int) $term_id ] : array();
	$config['terms'][ (int) $term_id ]['lang'] = (string) $lang;

	progressnow_test_pll_update_config( array( 'terms' => $config['terms'] ) );
}

/**
 * @param array<string,int> $translations lang => term ID.
 */
function progressnow_test_pll_save_term_translations( array $translations ) {
	foreach ( $translations as $lang => $term_id ) {
		progressnow_test_pll_set_term_language( $term_id, $lang );
	}

	$config = progressnow_test_pll_config();
	foreach ( $translations as $term_id ) {
		$config['terms'][ (int) $term_id ]['translations'] = $translations;
	}
	progressnow_test_pll_update_config( array( 'terms' => $config['terms'] ) );
}

/* -------------------------------------------------------------------------
 * Polylang API surface used by the theme.
 * ---------------------------------------------------------------------- */

function pll_default_language( $field = 'slug' ) {
	$default = progressnow_test_pll_config()['default'];

	return '' === $default ? false : $default;
}

function pll_current_language( $field = 'slug' ) {
	$current = progressnow_test_pll_config()['current'];

	return '' === $current ? false : $current;
}

/**
 * @param array $args Polylang accepts `fields` => 'slug' (default) | 'name' | ….
 * @return string[]
 */
function pll_languages_list( $args = array() ) {
	$config = progressnow_test_pll_config();
	$fields = isset( $args['fields'] ) ? (string) $args['fields'] : 'slug';

	if ( 'name' === $fields ) {
		return array_map(
			static function ( $slug ) use ( $config ) {
				return isset( $config['names'][ $slug ] ) ? (string) $config['names'][ $slug ] : strtoupper( $slug );
			},
			$config['languages']
		);
	}

	return $config['languages'];
}

function pll_get_post_language( $post_id, $field = 'slug' ) {
	$lang = (string) get_post_meta( (int) $post_id, '_progressnow_test_lang', true );

	return '' === $lang ? false : $lang;
}

/**
 * @return array<string,int> lang => post ID, including the post itself.
 */
function pll_get_post_translations( $post_id ) {
	$map = get_post_meta( (int) $post_id, '_progressnow_test_translations', true );
	$map = is_array( $map ) ? array_map( 'intval', $map ) : array();

	$own = pll_get_post_language( $post_id );
	if ( $own ) {
		$map[ $own ] = (int) $post_id;
	}

	return $map;
}

/**
 * @return int|false Translation post ID in $lang (the post itself when it is in $lang).
 */
function pll_get_post( $post_id, $lang = '' ) {
	$lang = '' === $lang ? pll_current_language() : (string) $lang;
	if ( ! $lang ) {
		return false;
	}
	$map = pll_get_post_translations( $post_id );

	return isset( $map[ $lang ] ) ? (int) $map[ $lang ] : false;
}

function pll_get_term_language( $term_id, $field = 'slug' ) {
	$terms = progressnow_test_pll_config()['terms'];

	return isset( $terms[ (int) $term_id ]['lang'] ) && '' !== $terms[ (int) $term_id ]['lang']
		? (string) $terms[ (int) $term_id ]['lang']
		: false;
}

/**
 * @return array<string,int> lang => term ID, including the term itself.
 */
function pll_get_term_translations( $term_id ) {
	$terms = progressnow_test_pll_config()['terms'];
	$map   = isset( $terms[ (int) $term_id ]['translations'] ) ? array_map( 'intval', (array) $terms[ (int) $term_id ]['translations'] ) : array();

	$own = pll_get_term_language( $term_id );
	if ( $own ) {
		$map[ $own ] = (int) $term_id;
	}

	return $map;
}

/**
 * @return int|false Translation term ID in $lang.
 */
function pll_get_term( $term_id, $lang = '' ) {
	$lang = '' === $lang ? pll_current_language() : (string) $lang;
	if ( ! $lang ) {
		return false;
	}
	$map = pll_get_term_translations( $term_id );

	return isset( $map[ $lang ] ) ? (int) $map[ $lang ] : false;
}

/**
 * Language home: `/` for the default language, `/{lang}/` otherwise
 * (Polylang "language in directory, default hidden").
 */
function pll_home_url( $lang = '' ) {
	$lang = '' === $lang ? pll_current_language() : (string) $lang;
	if ( ! $lang || $lang === pll_default_language() ) {
		return home_url( '/' );
	}

	return home_url( '/' . $lang . '/' );
}

/** Identity translation: the stub has no string table. */
function pll__( $string ) {
	return $string;
}

function pll_e( $string ) {
	echo $string; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- test stub mirrors Polylang's raw echo.
}

function pll_register_string( $name, $string, $group = '', $multiline = false ) {}

/** The switcher reads the queried object; not emulated. */
function pll_the_languages( $args = array() ) {
	return array();
}
