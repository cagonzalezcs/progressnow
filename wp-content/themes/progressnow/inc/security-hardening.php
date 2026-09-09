<?php
/**
 * Runtime attack-surface hardening (openspec: security-runtime-hardening).
 *
 * Closes the default WordPress surface this site never uses, from code that
 * ships in the repo (wp-content/mu-plugins/ is gitignored by policy, so the
 * theme owns these hooks the same way it owns every other inc/ domain):
 *
 * - XML-RPC: `xmlrpc_enabled` off AND every method unregistered, because the
 *   enabled flag only gates authenticated calls — `pingback.ping` would still
 *   answer. `X-Pingback` header + pingback support go with it. Block
 *   /xmlrpc.php at the server/WAF too (docs/runtime-hardening.md).
 * - User enumeration: `wp/v2/users*` REST routes are removed for anonymous
 *   requests (logged-in editors keep them — the block editor needs them);
 *   `?author=N` answers 404 before `redirect_canonical` can leak the slug;
 *   the users sitemap provider is dropped (author archives are noindex in
 *   inc/seo.php, so listing them was contradictory anyway). The theme's own
 *   author archive (`/author/{slug}/`, author.php) is untouched.
 * - Discovery/version noise: generator meta (head + feeds), RSD, WLW
 *   manifest, shortlink (head + header), REST link discovery (head +
 *   header), and the `?ver=<core version>` suffix on core assets.
 * - Config drift signal: an admin notice when WP_DEBUG is on under the
 *   `production` environment type. The hard fail lives in
 *   config/wp-config-hardening.php (opt-in per env); the theme only warns so
 *   an unconfigured local site keeps working.
 *
 * Pair with config/wp-config-hardening.php for the wp-config baseline.
 */

progressnow_hardening_register();

/**
 * Attach every hook (idempotent). Called at load; tests call it again after
 * WorDBless restores the pre-theme hook snapshot.
 */
function progressnow_hardening_register() {
	// 1. XML-RPC.
	add_filter( 'xmlrpc_enabled', '__return_false' );
	add_filter( 'xmlrpc_methods', 'progressnow_hardening_xmlrpc_methods', PHP_INT_MAX );
	add_filter( 'wp_headers', 'progressnow_hardening_strip_pingback_header' );
	add_filter( 'pings_open', '__return_false', PHP_INT_MAX );
	add_filter( 'pre_option_default_ping_status', 'progressnow_hardening_ping_status_closed' );
	add_filter( 'pre_option_default_pingback_flag', '__return_zero' );

	// 2. User enumeration.
	add_filter( 'rest_endpoints', 'progressnow_hardening_rest_endpoints' );
	add_action( 'template_redirect', 'progressnow_hardening_author_query', 0 );
	add_filter( 'wp_sitemaps_add_provider', 'progressnow_hardening_sitemap_provider', 10, 2 );

	// 3. Discovery + version noise (default-filters.php registrations).
	remove_action( 'wp_head', 'wp_generator' );
	remove_action( 'wp_head', 'rsd_link' );
	remove_action( 'wp_head', 'wlwmanifest_link' );
	remove_action( 'wp_head', 'wp_shortlink_wp_head' );
	remove_action( 'wp_head', 'rest_output_link_wp_head' );
	remove_action( 'template_redirect', 'wp_shortlink_header', 11 );
	remove_action( 'template_redirect', 'rest_output_link_header', 11 );
	add_filter( 'the_generator', '__return_empty_string' );
	foreach ( array( 'html', 'xhtml', 'atom', 'rss2', 'rdf', 'comment', 'export' ) as $type ) {
		add_filter( 'get_the_generator_' . $type, '__return_empty_string' );
	}
	add_filter( 'script_loader_src', 'progressnow_hardening_strip_core_version' );
	add_filter( 'style_loader_src', 'progressnow_hardening_strip_core_version' );

	// 4. Config drift signal.
	add_action( 'admin_notices', 'progressnow_hardening_debug_notice' );
}

// ---------------------------------------------------------------------------
// 1. XML-RPC
// ---------------------------------------------------------------------------


/**
 * xmlrpc_methods: unregister everything so no method (pingback.ping
 * included, which needs no login) is callable. IXR's `system.*`
 * introspection stays, and reports an empty method list.
 *
 * @param array $methods Registered XML-RPC methods.
 * @return array
 */
function progressnow_hardening_xmlrpc_methods( $methods ) {
	return array();
}

/**
 * wp_headers: drop the X-Pingback advertisement.
 *
 * @param array $headers Response headers.
 * @return array
 */
function progressnow_hardening_strip_pingback_header( $headers ) {
	unset( $headers['X-Pingback'] );
	return $headers;
}

/**
 * pre_option_default_ping_status: new posts default to pings closed.
 *
 * @return string
 */
function progressnow_hardening_ping_status_closed() {
	return 'closed';
}

// ---------------------------------------------------------------------------
// 2. User enumeration
// ---------------------------------------------------------------------------


/**
 * rest_endpoints: remove `wp/v2/users` and its sub-routes for anonymous
 * requests. Runs at dispatch, after cookie/application-password auth has
 * resolved, so `is_user_logged_in()` is meaningful here.
 *
 * @param array $endpoints Registered routes.
 * @return array
 */
function progressnow_hardening_rest_endpoints( $endpoints ) {
	if ( is_user_logged_in() ) {
		return $endpoints;
	}
	foreach ( array_keys( $endpoints ) as $route ) {
		if ( 0 === strpos( $route, '/wp/v2/users' ) ) {
			unset( $endpoints[ $route ] );
		}
	}
	return $endpoints;
}

/**
 * template_redirect (priority 0, ahead of redirect_canonical at 10):
 * a numeric `?author=` request 404s instead of redirecting to the author's
 * slug. Pretty author archives set `author_name`, not `author`, so
 * author.php is unaffected.
 */
function progressnow_hardening_author_query() {
	if ( is_admin() || ! progressnow_hardening_is_author_id_probe() ) {
		return;
	}

	global $wp_query;
	$wp_query->set_404();
	status_header( 404 );
	nocache_headers();
}

/**
 * Whether the current request carries a numeric `?author=` (or `author[]`)
 * query — the ID → slug enumeration vector.
 *
 * @return bool
 */
function progressnow_hardening_is_author_id_probe() {
	if ( ! isset( $_GET['author'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		return false;
	}
	$values = (array) $_GET['author']; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	foreach ( $values as $value ) {
		if ( is_scalar( $value ) && preg_match( '/^\s*\d+\s*$/', (string) $value ) ) {
			return true;
		}
	}
	return false;
}

/**
 * wp_sitemaps_add_provider: no users sitemap (author archives are noindex).
 *
 * @param WP_Sitemaps_Provider $provider Provider instance.
 * @param string               $name     Provider name.
 * @return WP_Sitemaps_Provider|false
 */
function progressnow_hardening_sitemap_provider( $provider, $name ) {
	return 'users' === $name ? false : $provider;
}

// ---------------------------------------------------------------------------
// 3. Discovery + version noise
// ---------------------------------------------------------------------------


/**
 * script/style_loader_src: drop `?ver=` only when it equals the core version
 * (theme assets keep their own cache-busting values).
 *
 * @param string $src Asset URL.
 * @return string
 */
function progressnow_hardening_strip_core_version( $src ) {
	if ( ! is_string( $src ) || false === strpos( $src, 'ver=' ) ) {
		return $src;
	}
	$query = wp_parse_url( $src, PHP_URL_QUERY );
	if ( ! $query ) {
		return $src;
	}
	parse_str( $query, $args );
	if ( isset( $args['ver'] ) && get_bloginfo( 'version' ) === (string) $args['ver'] ) {
		return remove_query_arg( 'ver', $src );
	}
	return $src;
}

// ---------------------------------------------------------------------------
// 4. Config drift signal
// ---------------------------------------------------------------------------


/**
 * Whether the site is misconfigured: debug output on under `production`.
 *
 * @param string|null $env Environment type (defaults to the live one).
 * @return bool
 */
function progressnow_hardening_debug_drift( $env = null ) {
	if ( 'production' !== ( null === $env ? wp_get_environment_type() : $env ) ) {
		return false;
	}
	return ( defined( 'WP_DEBUG' ) && WP_DEBUG )
		|| ( defined( 'WP_DEBUG_DISPLAY' ) && WP_DEBUG_DISPLAY );
}

/**
 * admin_notices: warn administrators about debug-under-production drift.
 * Soft on purpose — the hard fail is the opt-in wp-config include.
 */
function progressnow_hardening_debug_notice() {
	if ( ! progressnow_hardening_debug_drift() || ! current_user_can( 'manage_options' ) ) {
		return;
	}
	printf(
		'<div class="notice notice-error"><p>%s</p></div>',
		esc_html__( 'WP_DEBUG is on while WP_ENVIRONMENT_TYPE is production (the default when unset). Set WP_ENVIRONMENT_TYPE for this environment and require config/wp-config-hardening.php from wp-config.php.', 'progressnow' )
	);
}
