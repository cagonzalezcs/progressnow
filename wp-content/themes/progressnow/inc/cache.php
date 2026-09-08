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
 *   memoization of $cb(), invalidated by content-version bumps. A $cb that
 *   returns null signals "not cacheable" (e.g. a slug that did not resolve):
 *   the null is returned but no transient is written.
 *
 * Cardinality rule: only persist keys with bounded cardinality. Callers that
 * hash unbounded user input (free-text search) must bypass this helper and
 * lean on the HTTP cache layer instead — without a persistent object cache,
 * every distinct key is a `wp_options` row.
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
 *                      Return null to serve the miss without persisting it
 *                      (negative lookups must not become transient rows).
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
	if ( null !== $value ) {
		set_transient( $transient, $value, $ttl );
	}

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
add_action( 'deleted_post', 'progressnow_cache_bump_on_post_delete', 10, 2 );

/**
 * Post types whose deletion invalidates the public payloads. `deleted_post`
 * also fires for revisions, auto-drafts, nav-menu items, and attachments —
 * none of which change a public response, so they must not churn the
 * version (each bump also triggers the static rebuild).
 *
 * @return string[]
 */
function progressnow_cache_public_post_types() {
	return array( 'post', 'event', 'page' );
}

/**
 * @param int          $post_id Deleted post ID.
 * @param WP_Post|null $post    The deleted post (WP ≥ 5.5 passes it).
 */
function progressnow_cache_bump_on_post_delete( $post_id, $post = null ) {
	$post_type = $post instanceof WP_Post ? $post->post_type : get_post_type( $post_id );

	if ( in_array( (string) $post_type, progressnow_cache_public_post_types(), true ) ) {
		progressnow_cache_bump_version();
	}
}

// Term create/edit/delete — only the two canonical-category taxonomies matter.
// (`created_term` and `delete_term` both pass the taxonomy as the 3rd arg.)
add_action( 'edited_term', 'progressnow_cache_bump_on_term_edit', 10, 3 );
add_action( 'created_term', 'progressnow_cache_bump_on_term_edit', 10, 3 );
add_action( 'delete_term', 'progressnow_cache_bump_on_term_edit', 10, 3 );

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
