<?php
/**
 * Static-site rebuild orchestration (static-rebuild-pipeline).
 *
 * WordPress never runs a build itself: on content change it DISPATCHES a
 * rebuild through a pluggable transport and later LEARNS which build is live
 * from the static build's shell-manifest.json (inc/shell.php) or an optional
 * signed status callback. No process is ever spawned on the host.
 *
 * Configuration. Every setting resolves from the process environment first
 * (getenv( NAME ); an empty value counts as unset), then the wp-config.php
 * constant, then the default, then the `progressnow/rebuild/setting` filter —
 * so a host with a secret manager never writes a secret into a PHP file
 * (openspec rebuild-credential-boundary § Settings may be supplied by
 * environment). Precedence is documented in docs/deployment.md §2.
 * - CHAPTER_REBUILD_TRANSPORT   'github' (default) | 'webhook' | 'none'
 * - CHAPTER_GITHUB_REPO         'owner/repo' — the DISPATCH repository, never the
 *                               code repository (docs/rebuild-dispatch-repo.md)
 * - CHAPTER_GITHUB_TOKEN        fine-grained PAT, Contents: write on the dispatch
 *                               repository only (github transport)
 * - CHAPTER_REBUILD_WEBHOOK_URL receiver URL      (webhook transport)
 * - CHAPTER_REBUILD_SECRET      HMAC shared secret, ≥ 32 characters (webhook
 *                               transport + status callback)
 * - CHAPTER_REBUILD_SECRET_OUT  optional: signs the outbound webhook only
 * - CHAPTER_REBUILD_SECRET_IN   optional: verifies the inbound /build-status only
 *                               (each falls back to CHAPTER_REBUILD_SECRET)
 * - CHAPTER_REBUILD_DEBOUNCE    seconds to coalesce automatic triggers (default 90)
 *
 * No secret or token value ever reaches an admin page, a notice, WP-CLI
 * output, chapter_build_state or a log: upstream error bodies are redacted
 * and truncated (progressnow_rebuild_redact) and the Site build panel shows
 * only the SOURCE of each setting (env / constant / filter / unset).
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

const PROGRESSNOW_REBUILD_CRON_HOOK  = 'progressnow_rebuild_dispatch';
const PROGRESSNOW_REBUILD_STATE_KEY  = 'chapter_build_state';
const PROGRESSNOW_REBUILD_SECRET_MIN = 32;
const PROGRESSNOW_REBUILD_ERROR_MAX  = 200;

/* -------------------------------------------------------------------------
 * Configuration.
 * ---------------------------------------------------------------------- */

/**
 * Resolve NAME from the process environment, then the constant, then the
 * default. Shared by the rebuild settings here and the shell settings in
 * inc/shell.php. An environment value of '' counts as unset (same rule as the
 * Next receiver's contract), so `NAME=` in a unit file cannot blank a constant.
 *
 * @param string $name    Setting name (CHAPTER_*).
 * @param string $default Default when neither is set.
 * @return string
 */
function progressnow_setting_from_env_or_constant( $name, $default = '' ) {
	$env = getenv( $name );
	if ( false !== $env && '' !== $env ) {
		return (string) $env;
	}

	return defined( $name ) ? (string) constant( $name ) : (string) $default;
}

/**
 * Where a setting comes from — env | constant | filter | unset — never its
 * value. `filter` means a `progressnow/<area>/setting` callback replaced what
 * the environment / constant resolved to (tests; hosts wiring their own
 * config store); `unset` means the default applies.
 *
 * @param string $name   Setting name.
 * @param string $filter Filter hook that may override the setting.
 * @return string
 */
function progressnow_setting_source( $name, $filter ) {
	$raw   = progressnow_setting_from_env_or_constant( $name );
	$value = (string) apply_filters( $filter, $raw, $name );
	if ( $value !== $raw ) {
		return 'filter';
	}
	if ( '' === $value ) {
		return 'unset';
	}
	$env = getenv( $name );

	return false !== $env && '' !== $env ? 'env' : 'constant';
}

/**
 * Read a rebuild setting: environment first, then the wp-config.php
 * constant, then the default ('' when nothing is set).
 */
function progressnow_rebuild_setting( $name, $default = '' ) {
	$value = progressnow_setting_from_env_or_constant( $name, $default );

	/**
	 * Override a rebuild setting (tests; hosts that inject config differently).
	 *
	 * @param string $value Environment or constant value, or the default.
	 * @param string $name  Setting name.
	 */
	return (string) apply_filters( 'progressnow/rebuild/setting', $value, $name );
}

/**
 * env | constant | filter | unset for a rebuild setting (Site build panel,
 * `wp chapter build-status`). Never returns the value.
 */
function progressnow_rebuild_setting_source( $name ) {
	return progressnow_setting_source( $name, 'progressnow/rebuild/setting' );
}

/**
 * The rebuild settings the panel reports the source of, in display order.
 *
 * @return string[]
 */
function progressnow_rebuild_setting_names() {
	return array(
		'CHAPTER_REBUILD_TRANSPORT',
		'CHAPTER_GITHUB_REPO',
		'CHAPTER_GITHUB_TOKEN',
		'CHAPTER_REBUILD_WEBHOOK_URL',
		'CHAPTER_REBUILD_SECRET',
		'CHAPTER_REBUILD_SECRET_OUT',
		'CHAPTER_REBUILD_SECRET_IN',
		'CHAPTER_REBUILD_DEBOUNCE',
	);
}

/**
 * The HMAC secret for one direction: `out` signs the webhook dispatch, `in`
 * verifies the /build-status callback. CHAPTER_REBUILD_SECRET_OUT / _IN win
 * when set; each falls back to the shared CHAPTER_REBUILD_SECRET. A value
 * shorter than PROGRESSNOW_REBUILD_SECRET_MIN bytes is treated as unset — an
 * HMAC over a short secret is brute-forceable offline — and a short _OUT/_IN
 * does not fall back to the shared value (the operator meant to split them).
 * progressnow_rebuild_secret_problems() names the offending constant(s).
 *
 * @param string $direction out | in
 * @return string '' when unset or too short.
 */
function progressnow_rebuild_secret( $direction = 'out' ) {
	$secret = progressnow_rebuild_setting( 'in' === $direction ? 'CHAPTER_REBUILD_SECRET_IN' : 'CHAPTER_REBUILD_SECRET_OUT' );
	if ( '' === $secret ) {
		$secret = progressnow_rebuild_setting( 'CHAPTER_REBUILD_SECRET' );
	}

	return strlen( $secret ) >= PROGRESSNOW_REBUILD_SECRET_MIN ? $secret : '';
}

/**
 * Names of the secret settings that are set but shorter than the minimum.
 *
 * @return string[]
 */
function progressnow_rebuild_secret_problems() {
	$short = array();
	foreach ( array( 'CHAPTER_REBUILD_SECRET', 'CHAPTER_REBUILD_SECRET_OUT', 'CHAPTER_REBUILD_SECRET_IN' ) as $name ) {
		$value = progressnow_rebuild_setting( $name );
		if ( '' !== $value && strlen( $value ) < PROGRESSNOW_REBUILD_SECRET_MIN ) {
			$short[] = $name;
		}
	}

	return $short;
}

/**
 * Why the transport resolves to `none` — '' when it is usable. Names the
 * setting at fault, never a value (panel row, CLI, notices).
 *
 * @return string
 */
function progressnow_rebuild_transport_problem() {
	$transport = strtolower( progressnow_rebuild_setting( 'CHAPTER_REBUILD_TRANSPORT', 'github' ) );
	if ( 'none' === $transport ) {
		return 'CHAPTER_REBUILD_TRANSPORT is none';
	}
	if ( ! in_array( $transport, array( 'github', 'webhook' ), true ) ) {
		return 'CHAPTER_REBUILD_TRANSPORT is not github, webhook or none';
	}
	if ( 'github' === $transport ) {
		foreach ( array( 'CHAPTER_GITHUB_REPO', 'CHAPTER_GITHUB_TOKEN' ) as $name ) {
			if ( '' === progressnow_rebuild_setting( $name ) ) {
				return $name . ' is unset';
			}
		}

		return '';
	}
	if ( '' === progressnow_rebuild_setting( 'CHAPTER_REBUILD_WEBHOOK_URL' ) ) {
		return 'CHAPTER_REBUILD_WEBHOOK_URL is unset';
	}
	if ( '' === progressnow_rebuild_secret( 'out' ) ) {
		$name = '' !== progressnow_rebuild_setting( 'CHAPTER_REBUILD_SECRET_OUT' ) ? 'CHAPTER_REBUILD_SECRET_OUT' : 'CHAPTER_REBUILD_SECRET';

		return in_array( $name, progressnow_rebuild_secret_problems(), true )
			? sprintf( '%s is shorter than %d characters', $name, PROGRESSNOW_REBUILD_SECRET_MIN )
			: $name . ' is unset';
	}

	return '';
}

/**
 * The configured transport: github | webhook | none. Incomplete configuration
 * — including a webhook secret under the minimum length — degrades to `none`
 * (the freshness guard keeps the site correct); progressnow_rebuild_transport_problem()
 * says why.
 */
function progressnow_rebuild_transport() {
	if ( '' !== progressnow_rebuild_transport_problem() ) {
		return 'none';
	}

	return strtolower( progressnow_rebuild_setting( 'CHAPTER_REBUILD_TRANSPORT', 'github' ) );
}

/**
 * Make an upstream error safe to store and show: every configured token or
 * secret is replaced by [redacted] whatever its length (a short secret is
 * still a secret), bearer credentials are masked, tags are stripped, and the
 * text is cut to PROGRESSNOW_REBUILD_ERROR_MAX characters AFTER redaction so a
 * truncated value can never survive. Idempotent.
 *
 * @param string $text Upstream message or response body.
 * @return string
 */
function progressnow_rebuild_redact( $text ) {
	$text   = wp_strip_all_tags( (string) $text );
	$values = array();
	foreach ( array( 'CHAPTER_GITHUB_TOKEN', 'CHAPTER_REBUILD_SECRET', 'CHAPTER_REBUILD_SECRET_OUT', 'CHAPTER_REBUILD_SECRET_IN' ) as $name ) {
		$value = progressnow_rebuild_setting( $name );
		if ( '' !== $value ) {
			$values[] = $value;
		}
	}
	if ( $values ) {
		// Longest first, so a value that contains another is replaced whole.
		usort( $values, static fn( $a, $b ) => strlen( $b ) <=> strlen( $a ) );
		$text = str_replace( $values, '[redacted]', $text );
	}
	// Credential-shaped fragments a receiver might echo back: "Bearer xyz", token=xyz, "secret": "xyz".
	$text = preg_replace( '/\bBearer\s+[A-Za-z0-9._~+\/=-]{8,}/i', 'Bearer [redacted]', $text );
	$text = preg_replace( '/\b(token|secret)(["\']?\s*[:=]\s*["\']?)[A-Za-z0-9._~+\/=-]{8,}/i', '$1$2[redacted]', (string) $text );
	$text = trim( preg_replace( '/\s+/', ' ', (string) $text ) );
	if ( mb_strlen( $text ) > PROGRESSNOW_REBUILD_ERROR_MAX ) {
		$text = mb_substr( $text, 0, PROGRESSNOW_REBUILD_ERROR_MAX ) . '...';
	}

	return $text;
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
	$state = wp_parse_args( is_array( $state ) ? $state : array(), progressnow_rebuild_state_defaults() );
	// Redacted on write too; the read covers a state stored before redaction existed.
	$state['lastError'] = progressnow_rebuild_redact( $state['lastError'] );

	return $state;
}

/**
 * Merge and persist state.
 *
 * @param array $patch Keys to update.
 * @return array
 */
function progressnow_rebuild_update_state( array $patch ) {
	if ( array_key_exists( 'lastError', $patch ) ) {
		$patch['lastError'] = progressnow_rebuild_redact( $patch['lastError'] );
	}
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
 * Every editor write that changes a public payload (posts, events, pages,
 * terms, menus, Chapter Settings, attachment metadata, string translations)
 * bumps the content version through inc/cache.php, once per request — hook
 * the rebuild there.
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

		$error = progressnow_rebuild_redact( (string) $result );
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
		return 'github: ' . progressnow_rebuild_redact( $response->get_error_message() );
	}
	$code = (int) wp_remote_retrieve_response_code( $response );
	if ( 204 !== $code ) {
		// Status first, then the redacted + truncated body (GitHub echoes request details on 401/422).
		return 'github: HTTP ' . $code . ' ' . progressnow_rebuild_redact( wp_remote_retrieve_body( $response ) );
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
		return 'webhook: ' . progressnow_rebuild_redact( $response->get_error_message() );
	}
	$code = (int) wp_remote_retrieve_response_code( $response );
	if ( 202 !== $code ) {
		return 'webhook: HTTP ' . $code . ' ' . progressnow_rebuild_redact( wp_remote_retrieve_body( $response ) );
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
 * HMAC-SHA256 over "timestamp.body" (hex) with the OUTBOUND secret
 * (CHAPTER_REBUILD_SECRET_OUT, else CHAPTER_REBUILD_SECRET) unless one is given.
 */
function progressnow_rebuild_sign( $body, $timestamp, $secret = null ) {
	$secret = null === $secret ? progressnow_rebuild_secret( 'out' ) : (string) $secret;

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
	// INBOUND secret (CHAPTER_REBUILD_SECRET_IN, else the shared one); '' — unset
	// or under the minimum length — rejects every callback.
	$secret = progressnow_rebuild_secret( 'in' );
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
		esc_html( progressnow_rebuild_redact( $state['lastError'] ?: $state['status'] ) ),
		esc_url( function_exists( 'progressnow_admin_build_url' ) ? progressnow_admin_build_url() : admin_url( 'admin.php?page=progressnow-site-build' ) ),
		esc_html__( 'Open the Site build panel', 'progressnow' )
	);
}

/**
 * A secret under the minimum length: name the constant, never the value
 * (openspec rebuild-credential-boundary § Shared secrets meet a minimum strength).
 */
add_action( 'admin_notices', 'progressnow_rebuild_secret_notice' );
function progressnow_rebuild_secret_notice() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$short = progressnow_rebuild_secret_problems();
	if ( ! $short ) {
		return;
	}
	printf(
		'<div class="notice notice-error"><p><strong>%s</strong> %s</p></div>',
		esc_html__( 'Rebuild secret too short:', 'progressnow' ),
		esc_html(
			sprintf(
				/* translators: 1: constant name(s), 2: minimum length */
				__( '%1$s must be at least %2$d characters. Until it is replaced (docs/secrets-rotation.md) the webhook transport is disabled and every /build-status callback is rejected; the freshness guard keeps the site correct.', 'progressnow' ),
				implode( ', ', $short ),
				PROGRESSNOW_REBUILD_SECRET_MIN
			)
		)
	);
}
