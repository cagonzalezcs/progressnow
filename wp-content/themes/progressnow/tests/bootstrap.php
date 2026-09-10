<?php

use WorDBless\Load;

if (! file_exists( dirname(__DIR__) . '/wordpress/wp-content')) {
	mkdir(dirname(__DIR__) . '/wordpress/wp-content');
}

if (! file_exists(dirname(__DIR__) . '/wordpress/wp-content/themes')) {
	mkdir(dirname(__DIR__) . '/wordpress/wp-content/themes');
}

copy(
    dirname( __DIR__ ) . '/vendor/automattic/wordbless/src/dbless-wpdb.php',
    dirname( __DIR__ ) . '/wordpress/wp-content/db.php'
);

$theme_base_name = basename( dirname( __DIR__ ) );
$src = realpath( dirname( dirname( __DIR__ ) ) . '/' . $theme_base_name );
$dest = dirname( __DIR__ ) . '/wordpress/wp-content/themes/' . $theme_base_name;

if ( is_dir($src) && ! file_exists($dest) ) {
	symlink($src, $dest);
}

require_once dirname( __DIR__ ) . '/vendor/autoload.php';

Load::load();

// Polylang Pro is absent: load the minimal pll_* stub (unconfigured by
// default, so behavior matches "no Polylang" until a test opts in).
if ( ! function_exists( 'pll_current_language' ) ) {
	require_once __DIR__ . '/polylang-stub.php';
}

// The content-version bump is idempotent per request (inc/cache.php) and
// PHPUnit is one long request. Every suite's set_up() starts with
// switch_theme(), so hook the per-test reset there. Added before the first
// test, this hook is part of the WorDBless hook snapshot and survives the
// per-test restore.
add_action(
	'switch_theme',
	static function () {
		if ( function_exists( 'progressnow_cache_reset_bump_guard' ) ) {
			progressnow_cache_reset_bump_guard();
		}
	}
);

if ( ! function_exists( 'get_field' ) ) {
	/**
	 * Minimal ACF get_field() polyfill for WorDBless runs (ACF Pro is absent).
	 * Backed by post meta / options / term meta — enough for the theme's read
	 * paths, which all guard on function_exists( 'get_field' ).
	 *
	 * @param string           $selector Field name.
	 * @param int|string|false $id       Post ID, 'option(s)', or '{taxonomy}_{term_id}'.
	 * @return mixed Value, or null when unset (matches ACF's empty return).
	 */
	function get_field( $selector, $id = false ) {
		if ( 'option' === $id || 'options' === $id ) {
			$value = get_option( 'options_' . $selector, null );
			return false === $value ? null : $value;
		}

		// ACF term selector, e.g. 'category_7' / 'event_category_7' → term meta.
		if ( is_string( $id ) && preg_match( '/^([a-z0-9_-]+)_(\d+)$/i', $id, $m ) && taxonomy_exists( $m[1] ) ) {
			$value = get_term_meta( (int) $m[2], $selector, true );
			return '' === $value ? null : $value;
		}

		$post_id = is_object( $id ) ? ( $id->ID ?? 0 ) : (int) $id;
		if ( ! $post_id ) {
			$post_id = get_the_ID();
		}
		if ( ! $post_id ) {
			return null;
		}

		$value = get_post_meta( $post_id, $selector, true );
		return '' === $value ? null : $value;
	}
}
