<?php
/**
 * Transient cache helper with content-version invalidation.
 *
 * Keys embed `progressnow_content_ver` (an option bumped on every editor
 * write that changes a public payload), so a version bump is the real
 * invalidation and the TTL is only a backstop. Chapter-scale: one global
 * version beats granular purging.
 *
 * Write paths that bump (each request bumps at most once):
 * - `save_post` / `deleted_post` for the public post types (`post`, `event`,
 *   `page`); revisions, autosaves, auto-drafts, and every other type
 *   (`nav_menu_item`, `attachment`, ACF internals…) are ignored.
 * - `created_term` / `edited_term` / `delete_term` for `category` and
 *   `event_category`.
 * - `wp_update_nav_menu` / `delete_nav_menu` (menu contents) and the theme
 *   mods option (menu locations).
 * - `acf/save_post` for the Chapter Settings options page.
 * - `edit_attachment` (alt text, caption, title) and Polylang string
 *   translation saves (`pll_save_strings_translations`).
 *
 * Public contract (other domains call these):
 * - progressnow_cache_remember( $key, $cb, $ttl = 900 ): mixed — transient-backed
 *   memoization of $cb(), invalidated by content-version bumps. A $cb that
 *   returns null signals "not cacheable" (e.g. a slug that did not resolve):
 *   the null is returned but no transient is written.
 * - progressnow_cache_bump_version(): void — bump the version and fire
 *   `progressnow/content_version_bumped` once per request (the static-site
 *   rebuild hooks that action).
 * - progressnow_cache_public_post_types(): string[] — the filterable
 *   allow-list of post types whose saves/deletions bump.
 *
 * Cardinality rule: only persist keys with bounded cardinality. Callers that
 * hash unbounded user input (free-text search) must bypass this helper and
 * lean on the HTTP cache layer instead — without a persistent object cache,
 * every distinct key is a `wp_options` row.
 */

/**
 * Current content version (bumped on every public content write).
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
 * Version bumps — every public content write invalidates all progressnow
 * transients, at most once per request.
 * ---------------------------------------------------------------------- */

/**
 * Per-request bump guard. A single editor save fires several hooks
 * (`save_post` + `acf/save_post`, a menu save + its theme-mods write…); the
 * first call marks the request as bumped and later calls are no-ops, so the
 * version increments once and the rebuild is dispatched once.
 *
 * @param string $mode 'check' marks the request bumped and returns whether it
 *                     already was; 'reset' clears the mark (tests only).
 * @return bool Whether a bump already happened in this request.
 */
function progressnow_cache_bump_guard( $mode = 'check' ) {
	static $bumped = false;

	if ( 'reset' === $mode ) {
		$bumped = false;
		return false;
	}

	$already = $bumped;
	$bumped  = true;

	return $already;
}

/**
 * Forget that this request already bumped. Tests only — PHPUnit runs every
 * test in one process, so the guard must be cleared between scenarios.
 */
function progressnow_cache_reset_bump_guard() {
	progressnow_cache_bump_guard( 'reset' );
}

function progressnow_cache_bump_version() {
	if ( progressnow_cache_bump_guard() ) {
		return;
	}

	update_option( 'progressnow_content_ver', progressnow_content_version() + 1 );

	/**
	 * Fires once per request after a content write that invalidates the
	 * transients — the single choke point the static-site rebuild
	 * (inc/rebuild.php) hooks.
	 *
	 * @param int $version The new content version.
	 */
	do_action( 'progressnow/content_version_bumped', progressnow_content_version() );
}

/**
 * Post types whose saves and deletions change a public payload. `save_post`
 * and `deleted_post` also fire for revisions, auto-drafts, nav-menu items,
 * attachments, and ACF internals — none of which change a public response, so
 * they must not churn the version (each bump also triggers the static rebuild).
 *
 * @return string[]
 */
function progressnow_cache_public_post_types() {
	/**
	 * Filters the post types whose writes bump the content version.
	 *
	 * @param string[] $types Post type slugs (default `post`, `event`, `page`).
	 */
	return (array) apply_filters( 'progressnow/cache/public_post_types', array( 'post', 'event', 'page' ) );
}

// One generic save handler with an allow-list, not a `save_post_{type}` line
// per type (that is exactly how pages were missed). Priority 20 runs after
// ACF's own save_post write (priority 10) so the field values are in place.
add_action( 'save_post', 'progressnow_cache_bump_on_post_save', 20, 2 );
add_action( 'deleted_post', 'progressnow_cache_bump_on_post_delete', 10, 2 );

/**
 * @param int          $post_id Saved post ID.
 * @param WP_Post|null $post    The saved post.
 */
function progressnow_cache_bump_on_post_save( $post_id, $post = null ) {
	$post = $post instanceof WP_Post ? $post : get_post( $post_id );
	if ( ! $post instanceof WP_Post ) {
		return;
	}

	// Noise: revisions, autosaves, and the auto-draft created when the editor opens.
	if ( 'auto-draft' === $post->post_status || wp_is_post_revision( $post ) || wp_is_post_autosave( $post ) ) {
		return;
	}

	if ( in_array( (string) $post->post_type, progressnow_cache_public_post_types(), true ) ) {
		progressnow_cache_bump_version();
	}
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
// Polylang's term-translation linking fires `edited_term`, so it is covered.
add_action( 'edited_term', 'progressnow_cache_bump_on_term_edit', 10, 3 );
add_action( 'created_term', 'progressnow_cache_bump_on_term_edit', 10, 3 );
add_action( 'delete_term', 'progressnow_cache_bump_on_term_edit', 10, 3 );

function progressnow_cache_bump_on_term_edit( $term_id, $tt_id, $taxonomy ) {
	if ( in_array( $taxonomy, array( 'category', 'event_category' ), true ) ) {
		progressnow_cache_bump_version();
	}
}

// Nav menus: `wp_update_nav_menu` fires once per menu save after the items
// are written; menu *locations* live in the theme mods option, which the
// Customizer only writes on publish (changeset autosaves don't touch it).
// The theme stores nothing else in its mods today, so every write is a
// navigation change.
add_action( 'wp_update_nav_menu', 'progressnow_cache_bump_on_menu_change' );
add_action( 'delete_nav_menu', 'progressnow_cache_bump_on_menu_change' );
add_action( 'add_option_' . progressnow_cache_theme_mods_option(), 'progressnow_cache_bump_on_menu_change' );
add_action( 'update_option_' . progressnow_cache_theme_mods_option(), 'progressnow_cache_bump_on_menu_change' );

/**
 * The option holding this theme's mods (menu locations): `theme_mods_{stylesheet}`.
 *
 * @return string
 */
function progressnow_cache_theme_mods_option() {
	return 'theme_mods_' . get_stylesheet();
}

function progressnow_cache_bump_on_menu_change() {
	progressnow_cache_bump_version();
}

// Chapter Settings (ACF options page) saves.
add_action( 'acf/save_post', 'progressnow_cache_bump_on_options_save' );

function progressnow_cache_bump_on_options_save( $post_id ) {
	if ( 'options' === $post_id || 'option' === $post_id ) {
		progressnow_cache_bump_version();
	}
}

// Attachment metadata (alt text, caption, title from the media modal) is
// embedded in post/page payloads; Polylang string translations feed the
// chrome strings of every language payload. Registering an action that never
// fires is harmless when Polylang is absent.
add_action( 'edit_attachment', 'progressnow_cache_bump_version' );
add_action( 'pll_save_strings_translations', 'progressnow_cache_bump_version' );
