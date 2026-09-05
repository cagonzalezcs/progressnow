<?php
/**
 * Transient cache helper with content-version invalidation.
 *
 * Keys embed `progressnow_content_ver` (an option bumped on every content
 * write), so a version bump is the real invalidation and the TTL is only
 * a backstop. Chapter-scale: one global version beats granular purging.
 *
 * Public contract (other domains call these):
 * - progressnow_cache_remember( $key, $cb, $ttl = 900 ): mixed — transient-backed
 *   memoization of $cb(), invalidated by content-version bumps.
 */

/**
 * Current content version (bumped on post/event/term/options saves).
 *
 * @return int
 */
function progressnow_content_version() {
	return max( 1, (int) get_option( 'progressnow_content_ver', 1 ) );
}

/**
 * Transient-backed memoization keyed `progressnow_{$key}_{ver}`.
 *
 * @param string   $key Cache key fragment (unique per payload).
 * @param callable $cb  Produces the value on miss. Must not return false —
 *                      get_transient() can't distinguish it from a miss.
 * @param int      $ttl Backstop TTL in seconds (default 900).
 * @return mixed
 */
function progressnow_cache_remember( $key, $cb, $ttl = 900 ) {
	$transient = 'progressnow_' . $key . '_' . progressnow_content_version();

	$cached = get_transient( $transient );
	if ( false !== $cached ) {
		return $cached;
	}

	$value = $cb();
	set_transient( $transient, $value, $ttl );

	return $value;
}

/* -------------------------------------------------------------------------
 * Version bumps — every content write invalidates all progressnow transients.
 * ---------------------------------------------------------------------- */

function progressnow_cache_bump_version() {
	update_option( 'progressnow_content_ver', progressnow_content_version() + 1 );

	/**
	 * Fires after every content write that invalidates the transients — the
	 * single choke point the static-site rebuild (inc/rebuild.php) hooks.
	 *
	 * @param int $version The new content version.
	 */
	do_action( 'progressnow/content_version_bumped', progressnow_content_version() );
}

add_action( 'save_post_post', 'progressnow_cache_bump_version' );
add_action( 'save_post_event', 'progressnow_cache_bump_version' );
add_action( 'deleted_post', 'progressnow_cache_bump_version' );

// Term edits — only the two canonical-category taxonomies matter.
add_action( 'edited_term', 'progressnow_cache_bump_on_term_edit', 10, 3 );

function progressnow_cache_bump_on_term_edit( $term_id, $tt_id, $taxonomy ) {
	if ( in_array( $taxonomy, array( 'category', 'event_category' ), true ) ) {
		progressnow_cache_bump_version();
	}
}

// Chapter Settings (ACF options page) saves.
add_action( 'acf/save_post', 'progressnow_cache_bump_on_options_save' );

function progressnow_cache_bump_on_options_save( $post_id ) {
	if ( 'options' === $post_id || 'option' === $post_id ) {
		progressnow_cache_bump_version();
	}
}
