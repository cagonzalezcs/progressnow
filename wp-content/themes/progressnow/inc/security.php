<?php
/**
 * HTTP security headers + Content-Security-Policy (openspec
 * security-headers-and-cicd-gates).
 *
 * Every front-end response (`send_headers`) carries the static set —
 * `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
 * `Permissions-Policy` and, over TLS, `Strict-Transport-Security`. HTML
 * responses add a nonce-based CSP: `script-src 'self' 'nonce-…'` with no
 * `unsafe-inline`, so an inline `<script>` that slipped past kses/the encoder
 * cannot run. The nonce is minted once per request and stamped on every
 * script core prints (`wp_script_attributes`, `wp_inline_script_attributes`)
 * and on the Nuxt shell tags (inc/shell.php). JSON data blocks
 * (`application/json`, `application/ld+json`) are not executable and carry
 * no nonce.
 *
 * Rollout (design § Report-only first): the policy ships as
 * `Content-Security-Policy-Report-Only` by default with `report-uri` pointing
 * at `POST /wp-json/progressnow/v1/csp-report`, which aggregates violations
 * into a bounded option (`wp chapter csp-reports`). Flip to enforcing with
 *
 *   define( 'CHAPTER_CSP_MODE', 'enforce' );   // 'report-only' (default) | 'enforce' | 'off'
 *
 * Origins outside the site (video players, gravatar, the Vite dev server, a
 * separate static origin) are enumerated here; hosts extend the policy with
 * the `progressnow/security/csp` filter rather than editing the list.
 *
 * Owned by this file: the header set, the nonce, the policy, the report sink.
 * Not here: wp-admin screens (send_headers never fires there) and the
 * reverse-proxy layer (docs/deployment.md § Security headers — never add a
 * second CSP at the proxy).
 *
 * @package progressnow
 */

/** Option holding the aggregated CSP violation reports (autoload off). */
const PROGRESSNOW_CSP_REPORTS_OPTION = 'progressnow_csp_reports';

/** Distinct violation signatures kept; beyond this new ones are counted as dropped. */
const PROGRESSNOW_CSP_REPORTS_MAX = 50;

/** Largest report body accepted by the sink (browsers send well under 2 KB). */
const PROGRESSNOW_CSP_REPORT_MAX_BYTES = 8192;

/** Longest string kept from a report field. */
const PROGRESSNOW_CSP_REPORT_MAX_FIELD = 200;

/**
 * HSTS commitment — one day to start (design: modest max-age first, ramp
 * up, preload only when confident). Raise via `progressnow/security/hsts_max_age`.
 */
const PROGRESSNOW_HSTS_MAX_AGE = 86400;

/** Third-party players the video block lazy-embeds (BlockVideo.vue). */
const PROGRESSNOW_CSP_FRAME_SOURCES = array( 'https://www.youtube-nocookie.com', 'https://player.vimeo.com' );

/** Avatar CDN behind get_avatar_url() (post author cards). */
const PROGRESSNOW_CSP_IMAGE_SOURCES = array( 'https://secure.gravatar.com', 'https://*.gravatar.com' );

/* -------------------------------------------------------------------------
 * Settings.
 * ---------------------------------------------------------------------- */

/**
 * Read a security constant ('' when undefined), overridable for tests/hosts.
 *
 * @param string $name    Constant name.
 * @param string $default Default.
 * @return string
 */
function progressnow_security_setting( $name, $default = '' ) {
	$value = defined( $name ) ? (string) constant( $name ) : $default;

	/**
	 * Override a security setting (tests; hosts that inject config differently).
	 *
	 * @param string $value Constant value or default.
	 * @param string $name  Constant name.
	 */
	return (string) apply_filters( 'progressnow/security/setting', $value, $name );
}

/**
 * CSP delivery mode: 'report-only' (default), 'enforce' or 'off'.
 *
 * @return string
 */
function progressnow_csp_mode() {
	$mode = strtolower( trim( progressnow_security_setting( 'CHAPTER_CSP_MODE', 'report-only' ) ) );

	return in_array( $mode, array( 'report-only', 'enforce', 'off' ), true ) ? $mode : 'report-only';
}

/* -------------------------------------------------------------------------
 * Nonce.
 * ---------------------------------------------------------------------- */

/**
 * The per-request CSP nonce (128 random bits, base64). Minted on first use so
 * the header and every stamped tag agree.
 *
 * @return string
 */
function progressnow_csp_nonce() {
	static $nonce = null;

	if ( null === $nonce || ! empty( $GLOBALS['progressnow_csp_nonce_reset'] ) ) {
		unset( $GLOBALS['progressnow_csp_nonce_reset'] );
		try {
			$nonce = base64_encode( random_bytes( 16 ) );
		} catch ( Exception $e ) {
			$nonce = base64_encode( wp_generate_password( 16, true, true ) );
		}
	}

	return $nonce;
}

/**
 * Forget the current nonce (tests only — a real request mints exactly one).
 */
function progressnow_csp_reset_nonce() {
	$GLOBALS['progressnow_csp_nonce_reset'] = true;
}

/**
 * Stamp the nonce on executable script tags. Data blocks (JSON, JSON-LD) are
 * never executed and stay unstamped so a leaked nonce cannot be lifted from
 * them by a content-injection that only controls text.
 *
 * @param array $attributes Script tag attributes.
 * @return array
 */
function progressnow_csp_nonce_attribute( $attributes ) {
	if ( is_admin() ) {
		return $attributes;
	}
	$type = isset( $attributes['type'] ) ? strtolower( trim( (string) $attributes['type'] ) ) : '';
	if ( in_array( $type, array( 'application/json', 'application/ld+json' ), true ) ) {
		return $attributes;
	}
	$attributes['nonce'] = progressnow_csp_nonce();

	return $attributes;
}
add_filter( 'wp_script_attributes', 'progressnow_csp_nonce_attribute' );
add_filter( 'wp_inline_script_attributes', 'progressnow_csp_nonce_attribute' );

/**
 * `nonce="…"` attribute fragment for hand-built tags (shell app tags).
 *
 * @return string Leading space + attribute.
 */
function progressnow_csp_nonce_attr() {
	return ' nonce="' . esc_attr( progressnow_csp_nonce() ) . '"';
}

/**
 * Twig: `{{ csp_nonce }}` for any template that must inline an executable script.
 *
 * @param array $context Timber context.
 * @return array
 */
function progressnow_csp_context( $context ) {
	$context['csp_nonce'] = progressnow_csp_nonce();

	return $context;
}
add_filter( 'timber/context', 'progressnow_csp_context' );

/* -------------------------------------------------------------------------
 * Policy.
 * ---------------------------------------------------------------------- */

/**
 * Scheme+host(+port) of a URL, '' when unparseable.
 *
 * @param string $url URL.
 * @return string
 */
function progressnow_csp_origin( $url ) {
	$parts = wp_parse_url( (string) $url );
	if ( empty( $parts['scheme'] ) || empty( $parts['host'] ) ) {
		return '';
	}
	$origin = strtolower( $parts['scheme'] . '://' . $parts['host'] );
	if ( ! empty( $parts['port'] ) ) {
		$origin .= ':' . (int) $parts['port'];
	}

	return $origin;
}

/**
 * Origins the policy must allow beyond `'self'`: the Vite dev server when
 * `dist/vite-dev-server.json` exists (kucrut/vite-for-wp dev mode, HMR over
 * websocket) and a Nuxt static origin that is not the site itself
 * (inc/shell.php CHAPTER_STATIC_ORIGIN).
 *
 * @return string[] Origins (http/https), with the ws/wss twin for connect-src.
 */
function progressnow_csp_extra_origins() {
	$origins = array();
	$self    = progressnow_csp_origin( home_url( '/' ) );

	$dev_manifest = get_template_directory() . '/dist/vite-dev-server.json';
	if ( is_readable( $dev_manifest ) ) {
		$dev = json_decode( (string) file_get_contents( $dev_manifest ), true );
		if ( ! empty( $dev['origin'] ) ) {
			$origins[] = progressnow_csp_origin( $dev['origin'] );
		}
	}

	if ( function_exists( 'progressnow_shell_setting' ) ) {
		$static = progressnow_csp_origin( progressnow_shell_setting( 'CHAPTER_STATIC_ORIGIN' ) );
		if ( $static ) {
			$origins[] = $static;
		}
	}

	$origins = array_values( array_unique( array_filter( $origins ) ) );

	return array_values( array_diff( $origins, array( $self ) ) );
}

/**
 * The directives, each a source list, before serialization. Hosts extend via
 * `progressnow/security/csp` — the `script-src` list must never gain
 * `'unsafe-inline'` (tests pin this).
 *
 * @param string $nonce Request nonce.
 * @return array<string, string[]>
 */
function progressnow_csp_directives( $nonce ) {
	$extra   = progressnow_csp_extra_origins();
	$sockets = array();
	foreach ( $extra as $origin ) {
		$sockets[] = preg_replace( '#^http#', 'ws', $origin );
	}

	$directives = array(
		'default-src'     => array( "'self'" ),
		'script-src'      => array_merge( array( "'self'", "'nonce-" . $nonce . "'" ), $extra ),
		// Vue style bindings, the inline first-paint <style> (html-header.twig)
		// and Vite's dev <style> injection cannot carry a nonce; a style nonce
		// buys little once scripts are locked (same call as next-js).
		'style-src'       => array_merge( array( "'self'", "'unsafe-inline'" ), $extra ),
		'img-src'         => array_merge( array( "'self'", 'data:', 'blob:' ), PROGRESSNOW_CSP_IMAGE_SOURCES, $extra ),
		'font-src'        => array_merge( array( "'self'", 'data:' ), $extra ),
		'connect-src'     => array_merge( array( "'self'" ), $extra, $sockets ),
		'media-src'       => array_merge( array( "'self'" ), $extra ),
		'frame-src'       => PROGRESSNOW_CSP_FRAME_SOURCES,
		// 'self', not 'none': the Customizer and block-editor previews frame the
		// front end from wp-admin on the same origin.
		'frame-ancestors' => array( "'self'" ),
		'object-src'      => array( "'none'" ),
		'base-uri'        => array( "'self'" ),
		'form-action'     => array( "'self'" ),
	);

	$report_uri = progressnow_csp_report_uri();
	if ( '' !== $report_uri ) {
		$directives['report-uri'] = array( $report_uri );
	}

	/**
	 * Extend the CSP (extra embed/analytics origins). Keys are directive
	 * names, values source lists.
	 *
	 * @param array  $directives Directive => sources.
	 * @param string $nonce      Request nonce.
	 */
	return apply_filters( 'progressnow/security/csp', $directives, $nonce );
}

/**
 * Where browsers post violations ('' disables the directive).
 *
 * @return string
 */
function progressnow_csp_report_uri() {
	/**
	 * Override the `report-uri` (an external collector, or '' to omit).
	 *
	 * @param string $uri Default: this site's /wp-json/progressnow/v1/csp-report.
	 */
	return (string) apply_filters( 'progressnow/security/csp_report_uri', rest_url( 'progressnow/v1/csp-report' ) );
}

/**
 * Serialize the policy for a request.
 *
 * @param string|null $nonce Request nonce (default: the current one).
 * @return string
 */
function progressnow_csp_policy( $nonce = null ) {
	$nonce = null === $nonce ? progressnow_csp_nonce() : $nonce;
	$parts = array();
	foreach ( progressnow_csp_directives( $nonce ) as $directive => $sources ) {
		$sources = array_values( array_unique( array_filter( array_map( 'strval', (array) $sources ) ) ) );
		if ( ! $sources ) {
			continue;
		}
		$parts[] = $directive . ' ' . implode( ' ', $sources );
	}

	return implode( '; ', $parts );
}

/**
 * The header name for the current CSP mode ('' when off).
 *
 * @return string
 */
function progressnow_csp_header_name() {
	switch ( progressnow_csp_mode() ) {
		case 'enforce':
			return 'Content-Security-Policy';
		case 'off':
			return '';
		default:
			return 'Content-Security-Policy-Report-Only';
	}
}

/* -------------------------------------------------------------------------
 * Headers.
 * ---------------------------------------------------------------------- */

/**
 * The header set for a response.
 *
 * @param bool $html Whether the response is an HTML document (adds the CSP).
 * @return array<string, string> Header name => value.
 */
function progressnow_security_headers( $html = true ) {
	$headers = array(
		'X-Content-Type-Options' => 'nosniff',
		'X-Frame-Options'        => 'SAMEORIGIN',
		'Referrer-Policy'        => 'strict-origin-when-cross-origin',
		'Permissions-Policy'     => 'camera=(), microphone=(), geolocation=(), payment=()',
	);

	if ( is_ssl() ) {
		/**
		 * HSTS max-age in seconds (0 omits the header).
		 *
		 * @param int $max_age Default PROGRESSNOW_HSTS_MAX_AGE.
		 */
		$max_age = (int) apply_filters( 'progressnow/security/hsts_max_age', PROGRESSNOW_HSTS_MAX_AGE );
		if ( $max_age > 0 ) {
			$headers['Strict-Transport-Security'] = 'max-age=' . $max_age;
		}
	}

	if ( $html ) {
		$name = progressnow_csp_header_name();
		if ( '' !== $name ) {
			$headers[ $name ] = progressnow_csp_policy();
		}
	}

	/**
	 * Final say over the response headers (drop or override one).
	 *
	 * @param array $headers Name => value.
	 * @param bool  $html    Whether the response is an HTML document.
	 */
	return apply_filters( 'progressnow/security/headers', $headers, $html );
}

/**
 * Whether the request being served is an HTML document (the CSP target):
 * feeds (RSS, the ICS calendar), REST and robots/sitemap XML are not.
 *
 * @return bool
 */
function progressnow_security_is_html_request() {
	if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
		return false;
	}
	if ( function_exists( 'is_feed' ) && is_feed() ) {
		return false;
	}
	if ( function_exists( 'is_robots' ) && is_robots() ) {
		return false;
	}

	return true;
}

/**
 * send_headers: emit the set for this response.
 */
function progressnow_security_send_headers() {
	if ( headers_sent() ) {
		return;
	}
	foreach ( progressnow_security_headers( progressnow_security_is_html_request() ) as $name => $value ) {
		header( $name . ': ' . $value );
	}
}
add_action( 'send_headers', 'progressnow_security_send_headers' );

/* -------------------------------------------------------------------------
 * Violation sink — POST /progressnow/v1/csp-report.
 * ---------------------------------------------------------------------- */

/**
 * Register the sink. Public and unauthenticated by nature (browsers post
 * without credentials); bounded by body size, field length and the number of
 * distinct signatures kept, so it cannot grow wp_options.
 */
function progressnow_csp_register_report_route() {
	register_rest_route(
		'progressnow/v1',
		'/csp-report',
		array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'progressnow_csp_report_handler',
			'permission_callback' => '__return_true',
		)
	);
}
add_action( 'rest_api_init', 'progressnow_csp_register_report_route' );

/**
 * Accept a report in either wire format and record it.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response 204 recorded, 400 unparseable, 413 too large.
 */
function progressnow_csp_report_handler( WP_REST_Request $request ) {
	$body = (string) $request->get_body();
	if ( strlen( $body ) > PROGRESSNOW_CSP_REPORT_MAX_BYTES ) {
		return new WP_REST_Response( null, 413 );
	}

	$reports = progressnow_csp_normalize_reports( json_decode( $body, true, 8 ) );
	if ( ! $reports ) {
		return new WP_REST_Response( null, 400 );
	}

	progressnow_csp_record_reports( $reports );

	return new WP_REST_Response( null, 204 );
}

/**
 * Both wire formats → a flat list of violations:
 *   report-uri:  { "csp-report": { "document-uri", "violated-directive", "effective-directive", "blocked-uri", "source-file", "line-number", ... } }
 *   report-to:   [ { "type": "csp-violation", "body": { "documentURL", "effectiveDirective", "blockedURL", "sourceFile", "lineNumber", ... } } ]
 *
 * @param mixed $data Decoded JSON.
 * @return array<int, array{directive:string, blocked:string, document:string, source:string}>
 */
function progressnow_csp_normalize_reports( $data ) {
	if ( ! is_array( $data ) ) {
		return array();
	}

	$bodies = array();
	if ( isset( $data['csp-report'] ) && is_array( $data['csp-report'] ) ) {
		$bodies[] = $data['csp-report'];
	} elseif ( array_keys( $data ) === range( 0, count( $data ) - 1 ) ) {
		foreach ( array_slice( $data, 0, 10 ) as $item ) {
			if ( is_array( $item ) && isset( $item['body'] ) && is_array( $item['body'] ) && ( ! isset( $item['type'] ) || 'csp-violation' === $item['type'] ) ) {
				$bodies[] = $item['body'];
			}
		}
	}

	$out = array();
	foreach ( $bodies as $body ) {
		$directive = progressnow_csp_report_field( $body, array( 'effective-directive', 'effectiveDirective', 'violated-directive', 'violatedDirective' ) );
		if ( '' === $directive ) {
			continue;
		}
		$source = progressnow_csp_report_field( $body, array( 'source-file', 'sourceFile' ) );
		$line   = progressnow_csp_report_field( $body, array( 'line-number', 'lineNumber' ) );
		$out[]  = array(
			'directive' => $directive,
			'blocked'   => progressnow_csp_report_field( $body, array( 'blocked-uri', 'blockedURL' ) ),
			'document'  => progressnow_csp_report_document( progressnow_csp_report_field( $body, array( 'document-uri', 'documentURL' ) ) ),
			'source'    => '' === $source ? '' : ( $source . ( '' === $line ? '' : ':' . $line ) ),
		);
	}

	return $out;
}

/**
 * First present field among aliases, as a bounded scalar string.
 *
 * @param array    $body Report body.
 * @param string[] $keys Aliases.
 * @return string
 */
function progressnow_csp_report_field( array $body, array $keys ) {
	foreach ( $keys as $key ) {
		if ( isset( $body[ $key ] ) && is_scalar( $body[ $key ] ) ) {
			$value = trim( (string) $body[ $key ] );
			if ( '' !== $value ) {
				return mb_substr( $value, 0, PROGRESSNOW_CSP_REPORT_MAX_FIELD );
			}
		}
	}

	return '';
}

/**
 * The page path only — query strings carry search terms and would explode
 * the signature cardinality.
 *
 * @param string $uri Document URI.
 * @return string
 */
function progressnow_csp_report_document( $uri ) {
	if ( '' === $uri ) {
		return '';
	}
	$path = wp_parse_url( $uri, PHP_URL_PATH );

	return is_string( $path ) && '' !== $path ? $path : $uri;
}

/**
 * Aggregate into the bounded option: one row per (directive, blocked,
 * document) with a count and first/last timestamps.
 *
 * @param array $reports Normalized reports.
 */
function progressnow_csp_record_reports( array $reports ) {
	$store = progressnow_csp_reports();
	$now   = time();

	foreach ( $reports as $report ) {
		$key = substr( md5( $report['directive'] . '|' . $report['blocked'] . '|' . $report['document'] ), 0, 12 );

		if ( isset( $store['rows'][ $key ] ) ) {
			++$store['rows'][ $key ]['count'];
			$store['rows'][ $key ]['last'] = $now;
			continue;
		}
		if ( count( $store['rows'] ) >= PROGRESSNOW_CSP_REPORTS_MAX ) {
			++$store['dropped'];
			continue;
		}

		$store['rows'][ $key ] = $report + array(
			'count' => 1,
			'first' => $now,
			'last'  => $now,
		);

		/**
		 * A violation signature seen for the first time (log shipping, alerts).
		 *
		 * @param array $report directive, blocked, document, source.
		 */
		do_action( 'progressnow/security/csp_violation', $report );
		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			error_log( sprintf( '[progressnow] CSP violation: %s blocked %s on %s%s', $report['directive'], $report['blocked'] ?: '(inline)', $report['document'] ?: '?', $report['source'] ? ' (' . $report['source'] . ')' : '' ) ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		}
	}

	update_option( PROGRESSNOW_CSP_REPORTS_OPTION, $store, false );
}

/**
 * The aggregated reports.
 *
 * @return array{rows: array<string, array>, dropped: int}
 */
function progressnow_csp_reports() {
	$store = get_option( PROGRESSNOW_CSP_REPORTS_OPTION, array() );
	if ( ! is_array( $store ) ) {
		$store = array();
	}

	return array(
		'rows'    => isset( $store['rows'] ) && is_array( $store['rows'] ) ? $store['rows'] : array(),
		'dropped' => isset( $store['dropped'] ) ? (int) $store['dropped'] : 0,
	);
}

/**
 * Forget every recorded report (after tuning the allow-list).
 */
function progressnow_csp_clear_reports() {
	delete_option( PROGRESSNOW_CSP_REPORTS_OPTION );
}
