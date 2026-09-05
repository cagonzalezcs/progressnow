<?php
/**
 * Static-site rebuild orchestration (static-rebuild-pipeline).
 *
 * WordPress never runs a build itself: on content change it DISPATCHES a
 * rebuild through a pluggable transport and later LEARNS which build is live
 * from the static build's shell-manifest.json (inc/shell.php) or an optional
 * signed status callback. No process is ever spawned on the host.
 *
 * Configuration (wp-config.php constants):
 * - CHAPTER_REBUILD_TRANSPORT   'github' (default) | 'webhook' | 'none'
 * - CHAPTER_GITHUB_REPO         'owner/repo'      (github transport)
 * - CHAPTER_GITHUB_TOKEN        fine-grained PAT, contents: write (github transport)
 * - CHAPTER_REBUILD_WEBHOOK_URL receiver URL      (webhook transport)
 * - CHAPTER_REBUILD_SECRET      HMAC shared secret (webhook transport + status callback)
 * - CHAPTER_REBUILD_DEBOUNCE    seconds to coalesce automatic triggers (default 90)
 *
 * Public contract:
 * - progressnow_rebuild_request( $reason, $immediate = false ): array — record the
 *   request and either dispatch now (admin button / CLI) or schedule the
 *   coalesced dispatch.
 * - progressnow_rebuild_dispatch(): array — send the pending request through the
 *   transport (cron callback; also used by --wait flows).
 * - progressnow_rebuild_state(): array — chapter_build_state option.
 * - progressnow_rebuild_mark_live( $build_id, $content_version ): void — called
 *   by inc/shell.php when a new manifest is observed.
 * - progressnow_rebuild_sign( $body, $timestamp ): string — HMAC signature.
 * - progressnow_rebuild_verify( $body, $timestamp, $signature ): bool.
 */

const PROGRESSNOW_REBUILD_CRON_HOOK = 'progressnow_rebuild_dispatch';
const PROGRESSNOW_REBUILD_STATE_KEY = 'chapter_build_state';

/* -------------------------------------------------------------------------
 * Configuration.
 * ---------------------------------------------------------------------- */

/**
 * Read a rebuild constant ('' when undefined).
 */
function progressnow_rebuild_setting( $name, $default = '' ) {
	$value = defined( $name ) ? (string) constant( $name ) : $default;

	/**
	 * Override a rebuild setting (tests; hosts that inject config differently).
	 *
	 * @param string $value Constant value or default.
	 * @param string $name  Constant name.
	 */
	return (string) apply_filters( 'progressnow/rebuild/setting', $value, $name );
}

/**
 * The configured transport: github | webhook | none.
 */
function progressnow_rebuild_transport() {
	$transport = strtolower( progressnow_rebuild_setting( 'CHAPTER_REBUILD_TRANSPORT', 'github' ) );
	if ( ! in_array( $transport, array( 'github', 'webhook', 'none' ), true ) ) {
		return 'none';
	}
	if ( 'github' === $transport && ( '' === progressnow_rebuild_setting( 'CHAPTER_GITHUB_REPO' ) || '' === progressnow_rebuild_setting( 'CHAPTER_GITHUB_TOKEN' ) ) ) {
		return 'none';
	}
	if ( 'webhook' === $transport && ( '' === progressnow_rebuild_setting( 'CHAPTER_REBUILD_WEBHOOK_URL' ) || '' === progressnow_rebuild_setting( 'CHAPTER_REBUILD_SECRET' ) ) ) {
		return 'none';
	}

	return $transport;
}

/**
 * Debounce window for automatic triggers (seconds).
 */
function progressnow_rebuild_debounce() {
	$seconds = (int) progressnow_rebuild_setting( 'CHAPTER_REBUILD_DEBOUNCE', '90' );

	return max( 5, $seconds );
}

/* -------------------------------------------------------------------------
 * State.
 * ---------------------------------------------------------------------- */

/**
 * Default state shape.
 */
function progressnow_rebuild_state_defaults() {
	return array(
		'status'           => 'idle', // idle | scheduled | requested | building | live | failed | needs_attention | not_configured
		'requestedVersion' => 0,
		'requestedAt'      => '',
		'requestId'        => '',
		'liveVersion'      => 0,
		'liveBuildId'      => '',
		'liveAt'           => '',
		'lastBuildId'      => '',
		'lastError'        => '',
		'attempts'         => 0,
		'updatedAt'        => '',
	);
}

/**
 * Current build state (option-backed).
 *
 * @return array
 */
function progressnow_rebuild_state() {
	$state = get_option( PROGRESSNOW_REBUILD_STATE_KEY, array() );

	return wp_parse_args( is_array( $state ) ? $state : array(), progressnow_rebuild_state_defaults() );
}

/**
 * Merge and persist state.
 *
 * @param array $patch Keys to update.
 * @return array
 */
function progressnow_rebuild_update_state( array $patch ) {
	$state              = array_merge( progressnow_rebuild_state(), $patch );
	$state['updatedAt'] = gmdate( 'c' );
	update_option( PROGRESSNOW_REBUILD_STATE_KEY, $state, false );

	return $state;
}

/**
 * Record that a build is live (called from inc/shell.php when the manifest
 * changes, or from the status callback). Re-dispatches when content moved on
 * while the build ran (lost-update guard).
 *
 * @param string $build_id        Build id from the manifest.
 * @param int    $content_version Content version the build was generated from.
 */
function progressnow_rebuild_mark_live( $build_id, $content_version ) {
	$state = progressnow_rebuild_state();
	if ( $state['liveBuildId'] === (string) $build_id ) {
		return; // idempotent
	}

	progressnow_rebuild_update_state(
		array(
			'status'      => 'live',
			'liveBuildId' => (string) $build_id,
			'liveVersion' => (int) $content_version,
			'liveAt'      => gmdate( 'c' ),
			'lastError'   => '',
			'attempts'    => 0,
		)
	);

	do_action( 'progressnow/rebuild/live', (string) $build_id, (int) $content_version );

	// Content changed while the build ran → the live build is already behind.
	if ( function_exists( 'progressnow_content_version' ) && (int) $content_version < progressnow_content_version() ) {
		progressnow_rebuild_request( 'stale-after-build' );
	}
}

/* -------------------------------------------------------------------------
 * Triggers + coalescing.
 * ---------------------------------------------------------------------- */

/**
 * Ask for a rebuild. Automatic triggers are coalesced: one cron event per
 * debounce window; manual triggers dispatch immediately.
 *
 * @param string $reason    Why (content-version, admin, cli, stale-after-build).
 * @param bool   $immediate Dispatch now instead of scheduling.
 * @return array State after the request.
 */
function progressnow_rebuild_request( $reason = 'content-version', $immediate = false ) {
	$version = function_exists( 'progressnow_content_version' ) ? progressnow_content_version() : 0;

	if ( 'none' === progressnow_rebuild_transport() ) {
		return progressnow_rebuild_update_state(
			array(
				'status'           => 'not_configured',
				'requestedVersion' => $version,
				'requestedAt'      => gmdate( 'c' ),
			)
		);
	}

	$state = progressnow_rebuild_update_state(
		array(
			'status'           => 'scheduled',
			'requestedVersion' => $version,
			'requestedAt'      => gmdate( 'c' ),
			'requestId'        => progressnow_rebuild_new_request_id(),
			'attempts'         => 0,
		)
	);
	update_option( 'progressnow_rebuild_reason', sanitize_key( $reason ), false );

	if ( $immediate ) {
		return progressnow_rebuild_dispatch();
	}

	if ( ! wp_next_scheduled( PROGRESSNOW_REBUILD_CRON_HOOK ) ) {
		wp_schedule_single_event( time() + progressnow_rebuild_debounce(), PROGRESSNOW_REBUILD_CRON_HOOK );
	}

	return $state;
}

/**
 * Content writes (posts, events, terms, Chapter Settings) all bump the
 * content version through inc/cache.php — hook the rebuild there.
 */
add_action( 'progressnow/content_version_bumped', 'progressnow_rebuild_on_content_change' );
function progressnow_rebuild_on_content_change() {
	if ( defined( 'WP_INSTALLING' ) && WP_INSTALLING ) {
		return;
	}
	progressnow_rebuild_request( 'content-version' );
}

add_action( PROGRESSNOW_REBUILD_CRON_HOOK, 'progressnow_rebuild_dispatch' );

/**
 * A short, unique request id.
 */
function progressnow_rebuild_new_request_id() {
	return substr( str_replace( '-', '', wp_generate_uuid4() ), 0, 12 );
}

/**
 * The dispatch payload every transport sends.
 */
function progressnow_rebuild_payload( array $state ) {
	return array(
		'event'          => 'rebuild',
		'requestId'      => (string) $state['requestId'],
		'contentVersion' => (int) $state['requestedVersion'],
		'reason'         => (string) get_option( 'progressnow_rebuild_reason', 'content-version' ),
		'siteUrl'        => home_url( '/' ),
		'requestedAt'    => (string) $state['requestedAt'],
	);
}

/**
 * Send the pending request through the transport, with retries. Returns the
 * state after the attempt(s).
 *
 * @return array
 */
function progressnow_rebuild_dispatch() {
	$state     = progressnow_rebuild_state();
	$transport = progressnow_rebuild_transport();

	if ( 'none' === $transport ) {
		return progressnow_rebuild_update_state( array( 'status' => 'not_configured' ) );
	}
	if ( '' === $state['requestId'] ) {
		$state = progressnow_rebuild_update_state( array( 'requestId' => progressnow_rebuild_new_request_id() ) );
	}

	$payload = progressnow_rebuild_payload( $state );
	$error   = '';

	for ( $attempt = 1; $attempt <= 3; $attempt++ ) {
		$result = 'github' === $transport
			? progressnow_rebuild_send_github( $payload )
			: progressnow_rebuild_send_webhook( $payload );

		if ( true === $result ) {
			return progressnow_rebuild_update_state(
				array(
					'status'    => 'requested',
					'lastError' => '',
					'attempts'  => $attempt,
				)
			);
		}

		$error = (string) $result;
		progressnow_rebuild_update_state( array( 'attempts' => $attempt, 'lastError' => $error ) );

		if ( $attempt < 3 ) {
			// Backoff: 2s, 4s (bounded so a cron tick never runs away).
			$sleep = min( 4, 2 ** ( $attempt - 1 ) * 2 );
			/** Tests short-circuit the sleep. */
			if ( apply_filters( 'progressnow/rebuild/sleep', true, $sleep ) ) {
				sleep( $sleep );
			}
		}
	}

	do_action( 'progressnow/rebuild/failed', $error, $payload );

	return progressnow_rebuild_update_state( array( 'status' => 'needs_attention', 'lastError' => $error ) );
}

/**
 * github transport: repository_dispatch → .github/workflows/rebuild-site.yml.
 *
 * @return true|string True on 204, the error message otherwise.
 */
function progressnow_rebuild_send_github( array $payload ) {
	$repo  = progressnow_rebuild_setting( 'CHAPTER_GITHUB_REPO' );
	$token = progressnow_rebuild_setting( 'CHAPTER_GITHUB_TOKEN' );

	$response = wp_remote_post(
		'https://api.github.com/repos/' . $repo . '/dispatches',
		array(
			'timeout'    => 10,
			'user-agent' => 'progressnow-rebuild/1.0',
			'headers'    => array(
				'Accept'               => 'application/vnd.github+json',
				'Authorization'        => 'Bearer ' . $token,
				'X-GitHub-Api-Version' => '2022-11-28',
				'Content-Type'         => 'application/json',
			),
			'body'       => wp_json_encode(
				array(
					'event_type'     => 'rebuild-site',
					'client_payload' => $payload,
				)
			),
		)
	);

	if ( is_wp_error( $response ) ) {
		return 'github: ' . $response->get_error_message();
	}
	$code = (int) wp_remote_retrieve_response_code( $response );
	if ( 204 !== $code ) {
		return 'github: HTTP ' . $code . ' ' . wp_strip_all_tags( (string) wp_remote_retrieve_body( $response ) );
	}

	return true;
}

/**
 * webhook transport: signed POST to any receiver (AWS, a CI proxy, …).
 *
 * @return true|string True on 202, the error message otherwise.
 */
function progressnow_rebuild_send_webhook( array $payload ) {
	$body      = (string) wp_json_encode( $payload );
	$timestamp = (string) time();

	$response = wp_remote_post(
		progressnow_rebuild_setting( 'CHAPTER_REBUILD_WEBHOOK_URL' ),
		array(
			'timeout'    => 10,
			'user-agent' => 'progressnow-rebuild/1.0',
			'headers'    => array(
				'Content-Type'        => 'application/json',
				'X-Chapter-Timestamp' => $timestamp,
				'X-Chapter-Signature' => 'sha256=' . progressnow_rebuild_sign( $body, $timestamp ),
			),
			'body'       => $body,
		)
	);

	if ( is_wp_error( $response ) ) {
		return 'webhook: ' . $response->get_error_message();
	}
	$code = (int) wp_remote_retrieve_response_code( $response );
	if ( 202 !== $code ) {
		return 'webhook: HTTP ' . $code . ' ' . wp_strip_all_tags( (string) wp_remote_retrieve_body( $response ) );
	}

	$data = json_decode( (string) wp_remote_retrieve_body( $response ), true );
	if ( is_array( $data ) && ! empty( $data['buildId'] ) ) {
		progressnow_rebuild_update_state( array( 'lastBuildId' => (string) $data['buildId'] ) );
	}

	return true;
}

/* -------------------------------------------------------------------------
 * Signing (webhook transport + status callback share the scheme).
 * ---------------------------------------------------------------------- */

/**
 * HMAC-SHA256 over "timestamp.body" with the shared secret (hex).
 */
function progressnow_rebuild_sign( $body, $timestamp, $secret = null ) {
	$secret = null === $secret ? progressnow_rebuild_setting( 'CHAPTER_REBUILD_SECRET' ) : (string) $secret;

	return hash_hmac( 'sha256', $timestamp . '.' . $body, $secret );
}

/**
 * Verify a signed request: constant-time compare + ±5 minute replay window.
 *
 * @param string $body      Raw body.
 * @param string $timestamp X-Chapter-Timestamp.
 * @param string $signature X-Chapter-Signature (with or without `sha256=`).
 * @return bool
 */
function progressnow_rebuild_verify( $body, $timestamp, $signature ) {
	$secret = progressnow_rebuild_setting( 'CHAPTER_REBUILD_SECRET' );
	if ( '' === $secret || ! preg_match( '/^\d{9,11}$/', (string) $timestamp ) ) {
		return false;
	}
	if ( abs( time() - (int) $timestamp ) > 300 ) {
		return false;
	}
	$given = strtolower( preg_replace( '/^sha256=/i', '', trim( (string) $signature ) ) );

	return hash_equals( progressnow_rebuild_sign( $body, $timestamp, $secret ), $given );
}

/* -------------------------------------------------------------------------
 * Status callback — POST /progressnow/v1/build-status (optional).
 * ---------------------------------------------------------------------- */

add_action( 'rest_api_init', 'progressnow_rebuild_register_routes' );
function progressnow_rebuild_register_routes() {
	register_rest_route(
		'progressnow/v1',
		'/build-status',
		array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'progressnow_rebuild_rest_status',
			'permission_callback' => 'progressnow_rebuild_rest_permission',
		)
	);
}

/**
 * Permission = a valid signature over the raw body.
 */
function progressnow_rebuild_rest_permission( WP_REST_Request $request ) {
	$ok = progressnow_rebuild_verify(
		(string) $request->get_body(),
		(string) $request->get_header( 'x_chapter_timestamp' ),
		(string) $request->get_header( 'x_chapter_signature' )
	);

	return $ok ? true : new WP_Error( 'progressnow_bad_signature', 'Invalid or stale signature.', array( 'status' => 401 ) );
}

/**
 * Record a build result. Idempotent per buildId. 204 on acceptance.
 */
function progressnow_rebuild_rest_status( WP_REST_Request $request ) {
	$data     = json_decode( (string) $request->get_body(), true );
	$build_id = is_array( $data ) ? sanitize_text_field( (string) ( $data['buildId'] ?? '' ) ) : '';
	$status   = is_array( $data ) ? sanitize_key( (string) ( $data['status'] ?? '' ) ) : '';
	$version  = is_array( $data ) ? (int) ( $data['contentVersion'] ?? 0 ) : 0;
	$error    = is_array( $data ) ? sanitize_text_field( (string) ( $data['error'] ?? '' ) ) : '';

	if ( '' === $build_id || ! in_array( $status, array( 'succeeded', 'failed', 'started' ), true ) ) {
		return new WP_Error( 'progressnow_bad_status', 'buildId and status (succeeded|failed|started) are required.', array( 'status' => 400 ) );
	}

	$state = progressnow_rebuild_state();
	if ( 'succeeded' === $status ) {
		progressnow_rebuild_mark_live( $build_id, $version );
	} elseif ( 'failed' === $status ) {
		// Idempotent: a repeated failure report for the same build is a no-op.
		if ( 'failed' !== $state['status'] || $state['lastBuildId'] !== $build_id ) {
			progressnow_rebuild_update_state( array( 'status' => 'failed', 'lastError' => $error ?: 'Build failed', 'lastBuildId' => $build_id ) );
			do_action( 'progressnow/rebuild/failed', $error, array( 'buildId' => $build_id ) );
		}
	} else {
		progressnow_rebuild_update_state( array( 'status' => 'building', 'lastBuildId' => $build_id ) );
	}

	$response = new WP_REST_Response( null, 204 );
	$response->header( 'Cache-Control', 'no-store' );

	return $response;
}

/* -------------------------------------------------------------------------
 * Admin notices.
 * ---------------------------------------------------------------------- */

add_action( 'admin_notices', 'progressnow_rebuild_admin_notice' );
function progressnow_rebuild_admin_notice() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$state = progressnow_rebuild_state();
	if ( ! in_array( $state['status'], array( 'needs_attention', 'failed' ), true ) ) {
		return;
	}
	printf(
		'<div class="notice notice-error"><p><strong>%s</strong> %s <a href="%s">%s</a></p></div>',
		esc_html__( 'Site build needs attention:', 'progressnow' ),
		esc_html( $state['lastError'] ?: $state['status'] ),
		esc_url( function_exists( 'progressnow_admin_build_url' ) ? progressnow_admin_build_url() : admin_url( 'admin.php?page=progressnow-site-build' ) ),
		esc_html__( 'Open the Site build panel', 'progressnow' )
	);
}
