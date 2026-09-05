<?php
/**
 * PHP shell → Nuxt handoff (openspec: php-shell-handoff; design D1, D2, D4, D5).
 *
 * WordPress serves every public URL first. In `nuxt` mode the document is a
 * shell: the full SEO head, a `<div id="__nuxt">` with crawlable chrome +
 * content, the `__SHELL_DATA__` route payload, and the app tags read from the
 * static build's `shell-manifest.json`. The Nuxt client mounts into `#__nuxt`
 * and takes over; the islands bundle is never enqueued in that mode.
 *
 * wp-config.php constants (all optional):
 *
 *   CHAPTER_FRONTEND       'islands' (default) | 'nuxt'
 *   CHAPTER_STATIC_DIR     absolute path of the generated site
 *                          (same-host mode): enables the /_nuxt, _payload.json
 *                          and shell-manifest.json passthrough and reads the
 *                          manifest straight from disk
 *   CHAPTER_STATIC_ORIGIN  origin to fetch shell-manifest.json from when no
 *                          static dir is configured (default: the site URL)
 *
 * @package progressnow
 */

const PROGRESSNOW_SHELL_MANIFEST_TRANSIENT = 'progressnow_shell_manifest';
const PROGRESSNOW_SHELL_LOG_TRANSIENT      = 'progressnow_shell_manifest_log';
const PROGRESSNOW_SHELL_MANIFEST_TTL       = 60;

/* -------------------------------------------------------------------------
 * Settings.
 * ---------------------------------------------------------------------- */

/**
 * Read a shell constant ('' when undefined).
 *
 * @param string $name    Constant name.
 * @param string $default Default.
 * @return string
 */
function progressnow_shell_setting( $name, $default = '' ) {
	$value = defined( $name ) ? (string) constant( $name ) : $default;

	/**
	 * Override a shell setting (tests; hosts that inject config differently).
	 *
	 * @param string $value Constant value or default.
	 * @param string $name  Constant name.
	 */
	return (string) apply_filters( 'progressnow/shell/setting', $value, $name );
}

/**
 * Configured frontend: islands | nuxt.
 */
function progressnow_shell_mode() {
	return 'nuxt' === strtolower( progressnow_shell_setting( 'CHAPTER_FRONTEND', 'islands' ) ) ? 'nuxt' : 'islands';
}

/**
 * Logged-in chrome (admin bar) keeps full PHP page loads: the Edit link and
 * the bar itself cannot survive a client takeover.
 */
function progressnow_shell_admin_bypass() {
	return is_admin_bar_showing();
}

/**
 * Whether THIS response is a Nuxt shell.
 */
function progressnow_shell_is_nuxt() {
	if ( 'nuxt' !== progressnow_shell_mode() ) {
		return false;
	}
	if ( is_admin() || ( function_exists( 'is_feed' ) && did_action( 'wp' ) && is_feed() ) ) {
		return false;
	}

	return ! progressnow_shell_admin_bypass();
}

/**
 * Absolute static directory ('' when not configured or missing).
 */
function progressnow_shell_static_dir() {
	$dir = progressnow_shell_setting( 'CHAPTER_STATIC_DIR' );
	if ( '' === $dir ) {
		return '';
	}
	$real = realpath( $dir );

	return $real && is_dir( $real ) ? $real : '';
}

/**
 * Origin the manifest is fetched from when there is no static dir.
 */
function progressnow_shell_static_origin() {
	$origin = progressnow_shell_setting( 'CHAPTER_STATIC_ORIGIN' );

	return untrailingslashit( '' !== $origin ? $origin : home_url() );
}

/* -------------------------------------------------------------------------
 * shell-manifest.json.
 * ---------------------------------------------------------------------- */

/**
 * Validate a decoded manifest; null when it is not a usable build manifest.
 *
 * @param mixed $data Decoded JSON.
 * @return array|null
 */
function progressnow_shell_validate_manifest( $data ) {
	if ( ! is_array( $data ) ) {
		return null;
	}
	foreach ( array( 'buildId', 'entry' ) as $key ) {
		if ( empty( $data[ $key ] ) || ! is_string( $data[ $key ] ) ) {
			return null;
		}
	}
	foreach ( array( 'css', 'modulepreload', 'prefetch' ) as $key ) {
		if ( isset( $data[ $key ] ) && ! is_array( $data[ $key ] ) ) {
			return null;
		}
		$data[ $key ] = array_values( array_filter( (array) ( $data[ $key ] ?? array() ), 'is_string' ) );
	}
	if ( ! isset( $data['runtimeConfig']['public'], $data['runtimeConfig']['app'] ) || ! is_array( $data['runtimeConfig']['public'] ) || ! is_array( $data['runtimeConfig']['app'] ) ) {
		return null;
	}
	$data['importmap']      = is_array( $data['importmap'] ?? null ) ? $data['importmap'] : array();
	$data['contentVersion'] = (int) ( $data['contentVersion'] ?? 0 );
	$data['builtAt']        = (string) ( $data['builtAt'] ?? '' );

	return $data;
}

/**
 * Fetch and validate the manifest from disk (static dir) or over HTTP.
 *
 * @return array|WP_Error
 */
function progressnow_shell_fetch_manifest() {
	$dir = progressnow_shell_static_dir();
	if ( '' !== $dir ) {
		$file = $dir . DIRECTORY_SEPARATOR . 'shell-manifest.json';
		if ( ! is_readable( $file ) ) {
			return new WP_Error( 'progressnow_shell_manifest_missing', sprintf( 'shell-manifest.json not found in %s', $dir ) );
		}
		$raw = file_get_contents( $file ); // phpcs:ignore WordPressVIPMinimum.Performance.FetchingRemoteData.FileGetContentsUnknown
	} else {
		$url      = progressnow_shell_static_origin() . '/shell-manifest.json';
		$response = wp_remote_get( $url, array( 'timeout' => 3, 'headers' => array( 'Accept' => 'application/json' ) ) );
		if ( is_wp_error( $response ) ) {
			return $response;
		}
		$code = (int) wp_remote_retrieve_response_code( $response );
		if ( 200 !== $code ) {
			return new WP_Error( 'progressnow_shell_manifest_http', sprintf( '%s returned HTTP %d', $url, $code ) );
		}
		$raw = wp_remote_retrieve_body( $response );
	}

	$manifest = progressnow_shell_validate_manifest( json_decode( (string) $raw, true ) );
	if ( ! $manifest ) {
		return new WP_Error( 'progressnow_shell_manifest_invalid', 'shell-manifest.json is not a valid build manifest' );
	}

	return $manifest;
}

/**
 * The live build manifest, cached 60 s (positive and negative), or null in
 * degraded mode (no build yet, origin down, invalid file). Logs at most once
 * per minute.
 *
 * @param bool $force Bypass the transient.
 * @return array|null
 */
function progressnow_shell_manifest( $force = false ) {
	if ( ! $force ) {
		$cached = get_transient( PROGRESSNOW_SHELL_MANIFEST_TRANSIENT );
		if ( is_array( $cached ) && array_key_exists( 'manifest', $cached ) ) {
			return $cached['manifest'];
		}
	}

	$result = progressnow_shell_fetch_manifest();
	if ( is_wp_error( $result ) ) {
		set_transient( PROGRESSNOW_SHELL_MANIFEST_TRANSIENT, array( 'manifest' => null ), PROGRESSNOW_SHELL_MANIFEST_TTL );
		if ( false === get_transient( PROGRESSNOW_SHELL_LOG_TRANSIENT ) ) {
			set_transient( PROGRESSNOW_SHELL_LOG_TRANSIENT, 1, PROGRESSNOW_SHELL_MANIFEST_TTL );
			error_log( '[progressnow] shell degraded: ' . $result->get_error_message() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		}
		do_action( 'progressnow/shell/manifest_missing', $result );

		return null;
	}

	set_transient( PROGRESSNOW_SHELL_MANIFEST_TRANSIENT, array( 'manifest' => $result ), PROGRESSNOW_SHELL_MANIFEST_TTL );
	progressnow_shell_observe_build( $result );

	return $result;
}

/**
 * A build the site has not seen yet: record it live (inc/rebuild.php) and
 * purge the page cache so every response embeds the new tags.
 *
 * @param array $manifest Validated manifest.
 * @return bool True when the build was new.
 */
function progressnow_shell_observe_build( array $manifest ) {
	if ( ! function_exists( 'progressnow_rebuild_state' ) ) {
		return false;
	}
	$state = progressnow_rebuild_state();
	if ( $state['liveBuildId'] === (string) $manifest['buildId'] ) {
		return false;
	}

	progressnow_rebuild_mark_live( (string) $manifest['buildId'], (int) $manifest['contentVersion'] );
	progressnow_shell_purge_page_cache();
	do_action( 'progressnow/shell/new_build', $manifest );

	return true;
}

/**
 * Purge the page cache when a plugin provides one (WP Super Cache).
 */
function progressnow_shell_purge_page_cache() {
	if ( function_exists( 'wp_cache_clear_cache' ) ) {
		wp_cache_clear_cache();
	}
	do_action( 'progressnow/shell/purge' );
}

/* -------------------------------------------------------------------------
 * App tags (wp_head).
 * ---------------------------------------------------------------------- */

/**
 * The tags the shell emits for a build, in Nuxt's own document order.
 *
 * @param array $manifest Validated manifest.
 * @return string HTML.
 */
function progressnow_shell_render_tags( array $manifest ) {
	$json_flags = JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE;
	$lines      = array();

	if ( ! empty( $manifest['importmap'] ) ) {
		$lines[] = '<script type="importmap">' . wp_json_encode( array( 'imports' => (object) $manifest['importmap'] ), $json_flags ) . '</script>';
	}
	foreach ( $manifest['css'] as $href ) {
		$lines[] = sprintf( '<link rel="stylesheet" href="%s" crossorigin>', esc_url( $href ) );
	}
	foreach ( $manifest['modulepreload'] as $href ) {
		$lines[] = sprintf( '<link rel="modulepreload" as="script" crossorigin href="%s">', esc_url( $href ) );
	}
	$lines[] = '<script>window.__NUXT__={};window.__NUXT__.config=' . wp_json_encode( $manifest['runtimeConfig'], $json_flags ) . '</script>';
	$lines[] = sprintf( '<script type="module" src="%s" crossorigin></script>', esc_url( $manifest['entry'] ) );
	foreach ( $manifest['prefetch'] as $href ) {
		$lines[] = sprintf( '<link rel="prefetch" as="script" crossorigin href="%s">', esc_url( $href ) );
	}

	return implode( "\n", $lines ) . "\n";
}

/**
 * wp_head: emit the app tags (nuxt shells only; nothing in degraded mode).
 */
function progressnow_shell_head() {
	if ( ! progressnow_shell_is_nuxt() ) {
		return;
	}
	$manifest = progressnow_shell_manifest();
	if ( ! $manifest ) {
		return;
	}
	echo progressnow_shell_render_tags( $manifest ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built from escaped parts
}
add_action( 'wp_head', 'progressnow_shell_head', 3 );

/* -------------------------------------------------------------------------
 * __SHELL_DATA__.
 * ---------------------------------------------------------------------- */

/**
 * Route kind of the main query (mirrors inc/seo.php's subject types and the
 * app's resolver kinds).
 *
 * @return string front|posts_index|page|about|get_involved|calendar|styleguide|post|event|search|not_found
 */
function progressnow_shell_route_kind() {
	if ( is_404() ) {
		return 'not_found';
	}
	if ( is_search() ) {
		return 'search';
	}
	if ( is_front_page() ) {
		return 'front';
	}
	if ( is_home() || is_category() || is_tag() || is_date() || is_author() ) {
		return 'posts_index';
	}
	if ( is_singular( 'post' ) ) {
		return 'post';
	}
	if ( is_singular( 'event' ) ) {
		return 'event';
	}
	if ( is_singular( 'page' ) ) {
		return progressnow_page_kind( (int) get_queried_object_id() );
	}

	return 'not_found';
}

/**
 * Path of the current request (no query string), normalized to a trailing slash.
 */
function progressnow_shell_request_path() {
	$path = wp_parse_url( (string) ( $_SERVER['REQUEST_URI'] ?? '/' ), PHP_URL_PATH ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
	$path = is_string( $path ) && '' !== $path ? $path : '/';

	return '/' === $path ? $path : trailingslashit( $path );
}

/**
 * The embedded route payload: { lang, routeKind, path, contentVersion,
 * buildId, data } where every `data` value equals the matching REST response
 * (same builders, inc/payloads.php).
 *
 * @param array|null $manifest Live manifest (for buildId); fetched when null.
 * @return array
 */
function progressnow_shell_data( $manifest = null ) {
	$lang = function_exists( 'pll_current_language' ) ? (string) pll_current_language() : '';
	$lang = progressnow_lang_normalize( $lang );
	$kind = progressnow_shell_route_kind();
	$data = array(
		progressnow_payload_key( 'site', $lang ) => progressnow_payload_site( $lang ),
	);

	switch ( $kind ) {
		case 'front':
			$data[ progressnow_payload_key( 'front', $lang ) ] = progressnow_payload_front( $lang );
			break;

		case 'posts_index':
			$posts_page = (int) get_option( 'page_for_posts' );
			$posts_page = $posts_page ? (int) progressnow_lang_translation( $posts_page, $lang ) : 0;
			if ( $posts_page ) {
				$uri  = trim( (string) get_page_uri( $posts_page ), '/' );
				$page = progressnow_payload_page( $uri, $lang );
				if ( $page ) {
					$data[ progressnow_payload_key( 'page', $lang, $uri ) ] = $page;
				}
			}
			// The island fetches search results itself; browse/paged/category
			// states embed their first list.
			if ( '' === trim( (string) get_query_var( 's' ) ) ) {
				$paged    = max( 1, (int) get_query_var( 'paged' ) );
				$category = isset( $_GET['category'] ) ? sanitize_key( (string) wp_unslash( $_GET['category'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
				if ( '' === $category && is_category() ) {
					$category = (string) get_query_var( 'category_name' );
				}
				$data[ progressnow_payload_posts_key( $lang, $paged, $category ) ] = progressnow_payload_posts( $lang, $paged, 24, $category, '' );
			}
			break;

		case 'page':
		case 'about':
		case 'get_involved':
		case 'calendar':
		case 'styleguide':
			$uri  = trim( (string) get_page_uri( (int) get_queried_object_id() ), '/' );
			$page = progressnow_payload_page( $uri, $lang );
			if ( $page ) {
				$data[ progressnow_payload_key( 'page', $lang, $uri ) ] = $page;
			}
			break;

		case 'post':
			$slug = (string) get_post_field( 'post_name', get_queried_object_id() );
			$post = progressnow_payload_post( $slug, $lang );
			if ( $post ) {
				$data[ progressnow_payload_key( 'post', $lang, $slug ) ] = $post;
			}
			break;

		case 'event':
			$slug  = (string) get_post_field( 'post_name', get_queried_object_id() );
			$event = progressnow_payload_event( $slug, $lang );
			if ( $event ) {
				$data[ progressnow_payload_key( 'event', $lang, $slug ) ] = $event;
			}
			break;
	}

	if ( null === $manifest ) {
		$manifest = progressnow_shell_manifest();
	}

	return array(
		'lang'           => $lang,
		'routeKind'      => $kind,
		'path'           => progressnow_shell_request_path(),
		'contentVersion' => function_exists( 'progressnow_content_version' ) ? progressnow_content_version() : 0,
		'buildId'        => is_array( $manifest ) ? (string) $manifest['buildId'] : '',
		'data'           => $data,
	);
}

/**
 * HTML-safe JSON for a `<script type="application/json">` element: `<`, `>`
 * and `&` are escaped so `</script>` can never break out.
 *
 * @param array $data Shell data.
 * @return string
 */
function progressnow_shell_data_json( array $data ) {
	return (string) wp_json_encode( $data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE );
}

/**
 * Timber context: the mode flags every view branches on, the embedded
 * payload, and the `data-frontend="php"` marker for admin-bar bypasses.
 *
 * @param array $context Timber context.
 * @return array
 */
function progressnow_shell_context( $context ) {
	$mode = progressnow_shell_mode();
	$nuxt = progressnow_shell_is_nuxt();

	$context['shell_mode']      = $mode;
	$context['shell_nuxt']      = $nuxt;
	$context['html_data_attrs'] = ( 'nuxt' === $mode && ! $nuxt && ! is_admin() ) ? ' data-frontend="php"' : '';
	$context['shell_data_json'] = $nuxt ? progressnow_shell_data_json( progressnow_shell_data() ) : '';

	return $context;
}
add_filter( 'timber/context', 'progressnow_shell_context', 20 );

/* -------------------------------------------------------------------------
 * Static passthrough (same-host mode).
 * ---------------------------------------------------------------------- */

/**
 * MIME types the passthrough serves.
 *
 * @return array<string,string>
 */
function progressnow_shell_mime_types() {
	return array(
		'js'    => 'text/javascript; charset=utf-8',
		'mjs'   => 'text/javascript; charset=utf-8',
		'css'   => 'text/css; charset=utf-8',
		'json'  => 'application/json; charset=utf-8',
		'map'   => 'application/json; charset=utf-8',
		'html'  => 'text/html; charset=utf-8',
		'txt'   => 'text/plain; charset=utf-8',
		'svg'   => 'image/svg+xml',
		'png'   => 'image/png',
		'jpg'   => 'image/jpeg',
		'jpeg'  => 'image/jpeg',
		'gif'   => 'image/gif',
		'webp'  => 'image/webp',
		'avif'  => 'image/avif',
		'ico'   => 'image/x-icon',
		'woff'  => 'font/woff',
		'woff2' => 'font/woff2',
		'ttf'   => 'font/ttf',
		'wasm'  => 'application/wasm',
	);
}

/**
 * Resolve a request against the static dir. Pure: no headers, no exit.
 *
 * @param string $request_uri REQUEST_URI (path + optional query).
 * @param string $dir         Real static directory.
 * @return array|null null when the request is not a static path; otherwise
 *                    { status: 200, file, mime, cache } or { status: 404 }.
 */
function progressnow_shell_passthrough_resolve( $request_uri, $dir ) {
	$path = wp_parse_url( (string) $request_uri, PHP_URL_PATH );
	if ( ! is_string( $path ) ) {
		return null;
	}
	$path = rawurldecode( $path );

	if ( ! preg_match( '#^/(?:_nuxt/.+|shell-manifest\.json|(?:.*/)?_payload\.json)$#', $path ) ) {
		return null;
	}
	if ( false !== strpos( $path, "\0" ) || preg_match( '#(^|/)\.\.?(/|$)#', $path ) ) {
		return array( 'status' => 404 );
	}

	$dir  = rtrim( $dir, DIRECTORY_SEPARATOR );
	$file = realpath( $dir . str_replace( '/', DIRECTORY_SEPARATOR, $path ) );
	if ( ! $file || 0 !== strpos( $file, $dir . DIRECTORY_SEPARATOR ) || ! is_file( $file ) ) {
		return array( 'status' => 404 );
	}

	$ext   = strtolower( (string) pathinfo( $file, PATHINFO_EXTENSION ) );
	$mimes = progressnow_shell_mime_types();

	return array(
		'status' => 200,
		'file'   => $file,
		'mime'   => $mimes[ $ext ] ?? 'application/octet-stream',
		'cache'  => 0 === strpos( $path, '/_nuxt/' ) ? 'public, max-age=31536000, immutable' : 'public, max-age=60',
	);
}

/**
 * Send a resolved passthrough response.
 *
 * @param array $resolved From progressnow_shell_passthrough_resolve().
 */
function progressnow_shell_passthrough_send( array $resolved ) {
	if ( 200 !== (int) $resolved['status'] ) {
		status_header( 404 );
		nocache_headers();
		header( 'Content-Type: text/plain; charset=utf-8' );
		echo 'Not Found';

		return;
	}

	$etag = '"' . md5_file( $resolved['file'] ) . '"';
	$if   = trim( (string) ( $_SERVER['HTTP_IF_NONE_MATCH'] ?? '' ) ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
	header( 'Cache-Control: ' . $resolved['cache'] );
	header( 'ETag: ' . $etag );
	if ( '' !== $if && $if === $etag ) {
		status_header( 304 );

		return;
	}

	status_header( 200 );
	header( 'Content-Type: ' . $resolved['mime'] );
	header( 'Content-Length: ' . filesize( $resolved['file'] ) );
	header( 'X-Progressnow-Static: passthrough' );
	readfile( $resolved['file'] ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_readfile
}

/**
 * init (priority 0): serve the static build's files before WordPress routes
 * the request. Inert without CHAPTER_STATIC_DIR; the web server's own rules
 * (docs/deployment.md) normally answer these first.
 */
function progressnow_shell_passthrough() {
	$dir = progressnow_shell_static_dir();
	if ( '' === $dir ) {
		return;
	}
	$resolved = progressnow_shell_passthrough_resolve( (string) ( $_SERVER['REQUEST_URI'] ?? '' ), $dir ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
	if ( null === $resolved ) {
		return;
	}

	progressnow_shell_passthrough_send( $resolved );

	/**
	 * Tests turn this off to inspect the response instead of exiting.
	 *
	 * @param bool $exit Whether to end the request.
	 */
	if ( apply_filters( 'progressnow/shell/passthrough_exit', true ) ) {
		exit;
	}
}
add_action( 'init', 'progressnow_shell_passthrough', 0 );
