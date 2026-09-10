<?php
/**
 * Static-site rebuild (inc/rebuild.php): signing + verification, the signed
 * /build-status callback, coalesced scheduling, the github + webhook
 * transports (HTTP mocked via pre_http_request), retries → needs_attention,
 * the lost-update re-dispatch, and the credential boundary (openspec
 * rebuild-credential-boundary): env-first settings, the 32-character secret
 * floor, split outbound/inbound secrets, and redaction of every output.
 */

use WorDBless\BaseTestCase;

if ( ! defined( 'CHAPTER_REBUILD_SECRET' ) ) {
	define( 'CHAPTER_REBUILD_SECRET', 'test-secret-0123456789abcdef0123456789' ); // ≥ 32 characters (PROGRESSNOW_REBUILD_SECRET_MIN)
}
if ( ! defined( 'CHAPTER_GITHUB_REPO' ) ) {
	define( 'CHAPTER_GITHUB_REPO', 'example/site' );
}
if ( ! defined( 'CHAPTER_GITHUB_TOKEN' ) ) {
	define( 'CHAPTER_GITHUB_TOKEN', 'ghp_test' );
}
if ( ! defined( 'CHAPTER_REBUILD_WEBHOOK_URL' ) ) {
	define( 'CHAPTER_REBUILD_WEBHOOK_URL', 'https://hooks.example.test/rebuild' );
}

class TestRebuild extends BaseTestCase {

	/** Captured outbound requests: [ url, args ]. */
	private $requests = array();

	/** Error argument of the last progressnow/rebuild/failed action. */
	private $last_failed_error = '';

	public function set_up() {
		switch_theme( basename( dirname( __DIR__ ) ) );

		require dirname( __DIR__ ) . '/functions.php';

		do_action( 'after_setup_theme' );

		parent::set_up();

		add_action( 'rest_api_init', 'progressnow_rebuild_register_routes' );
		add_action( 'progressnow/content_version_bumped', 'progressnow_rebuild_on_content_change' );
		add_action( PROGRESSNOW_REBUILD_CRON_HOOK, 'progressnow_rebuild_dispatch' );
		add_filter( 'progressnow/rebuild/sleep', '__return_false' );
		$this->last_failed_error = '';
		add_action(
			'progressnow/rebuild/failed',
			function ( $error ) {
				$this->last_failed_error = (string) $error;
			}
		);
		$GLOBALS['wp_rest_server'] = null;

		$this->requests = array();
		delete_option( PROGRESSNOW_REBUILD_STATE_KEY );
		delete_option( 'cron' );
		update_option( 'progressnow_content_ver', 3 );
	}

	/* ---- helpers ---- */

	private function mock_http( $responder ) {
		add_filter(
			'pre_http_request',
			function ( $pre, $args, $url ) use ( $responder ) {
				$this->requests[] = array( $url, $args );

				return is_callable( $responder ) ? $responder( $url, $args ) : $responder;
			},
			10,
			3
		);
	}

	private function http_response( $code, $body = '' ) {
		return array(
			'response' => array( 'code' => $code, 'message' => '' ),
			'body'     => $body,
			'headers'  => array(),
			'cookies'  => array(),
		);
	}

	private function use_transport( $transport ) {
		add_filter(
			'progressnow/rebuild/setting',
			static function ( $value, $name ) use ( $transport ) {
				return 'CHAPTER_REBUILD_TRANSPORT' === $name ? $transport : $value;
			},
			10,
			2
		);
	}

	/** Panel rows keyed by label. */
	private function rows() {
		$rows = progressnow_admin_build_rows( progressnow_rebuild_state(), null );

		return array_combine( array_column( $rows, 'label' ), array_column( $rows, 'value' ) );
	}

	/** Output of the theme's admin_notices callbacks as an Administrator. */
	private function render_notices() {
		$id = wp_insert_user(
			array(
				'user_login' => 'rebuild-admin-' . wp_rand( 1000, 999999 ),
				'user_pass'  => wp_generate_password( 24 ),
				'role'       => 'administrator',
			)
		);
		$this->assertIsInt( $id );
		wp_set_current_user( $id );
		ob_start();
		progressnow_rebuild_admin_notice();
		progressnow_rebuild_secret_notice();
		$html = (string) ob_get_clean();
		wp_set_current_user( 0 );

		return $html;
	}

	private function signed_status( array $body, $timestamp = null, $signature = null ) {
		$json      = wp_json_encode( $body );
		$timestamp = null === $timestamp ? (string) time() : (string) $timestamp;
		$signature = null === $signature ? 'sha256=' . progressnow_rebuild_sign( $json, $timestamp ) : $signature;

		$request = new WP_REST_Request( 'POST', '/progressnow/v1/build-status' );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_header( 'X-Chapter-Timestamp', $timestamp );
		$request->set_header( 'X-Chapter-Signature', $signature );
		$request->set_body( $json );

		return rest_do_request( $request );
	}

	/* ---- signing ---- */

	public function test_sign_and_verify_roundtrip() {
		$ts   = (string) time();
		$body = '{"event":"rebuild"}';
		$sig  = progressnow_rebuild_sign( $body, $ts );

		$this->assertMatchesRegularExpression( '/^[0-9a-f]{64}$/', $sig );
		$this->assertTrue( progressnow_rebuild_verify( $body, $ts, $sig ) );
		$this->assertTrue( progressnow_rebuild_verify( $body, $ts, 'sha256=' . strtoupper( $sig ) ) );
		$this->assertFalse( progressnow_rebuild_verify( $body . ' ', $ts, $sig ), 'tampered body' );
		$this->assertFalse( progressnow_rebuild_verify( $body, (string) ( time() - 600 ), progressnow_rebuild_sign( $body, (string) ( time() - 600 ) ) ), 'stale timestamp' );
		$this->assertFalse( progressnow_rebuild_verify( $body, 'now', $sig ), 'malformed timestamp' );
	}

	/* ---- /build-status ---- */

	public function test_build_status_rejects_unsigned_and_bad_signatures() {
		$this->assertSame( 401, $this->signed_status( array( 'buildId' => 'b1', 'status' => 'succeeded' ), null, 'sha256=deadbeef' )->get_status() );

		$request = new WP_REST_Request( 'POST', '/progressnow/v1/build-status' );
		$request->set_body( '{"buildId":"b1","status":"succeeded"}' );
		$this->assertSame( 401, rest_do_request( $request )->get_status() );
		$this->assertSame( 'idle', progressnow_rebuild_state()['status'] );
	}

	public function test_build_status_succeeded_marks_live_idempotently() {
		$response = $this->signed_status( array( 'buildId' => 'b1', 'status' => 'succeeded', 'contentVersion' => 3 ) );
		$this->assertSame( 204, $response->get_status() );

		$state = progressnow_rebuild_state();
		$this->assertSame( 'live', $state['status'] );
		$this->assertSame( 'b1', $state['liveBuildId'] );
		$this->assertSame( 3, $state['liveVersion'] );
		$this->assertNotEmpty( $state['liveAt'] );

		$live_at = $state['liveAt'];
		$this->assertSame( 204, $this->signed_status( array( 'buildId' => 'b1', 'status' => 'succeeded', 'contentVersion' => 3 ) )->get_status() );
		$this->assertSame( $live_at, progressnow_rebuild_state()['liveAt'], 'repeat is a no-op' );
	}

	public function test_build_status_failed_records_error() {
		$this->assertSame( 204, $this->signed_status( array( 'buildId' => 'b2', 'status' => 'failed', 'error' => 'generate exploded' ) )->get_status() );

		$state = progressnow_rebuild_state();
		$this->assertSame( 'failed', $state['status'] );
		$this->assertSame( 'generate exploded', $state['lastError'] );
		$this->assertSame( 'b2', $state['lastBuildId'] );
	}

	public function test_build_status_validates_payload() {
		$this->assertSame( 400, $this->signed_status( array( 'buildId' => '', 'status' => 'succeeded' ) )->get_status() );
		$this->assertSame( 400, $this->signed_status( array( 'buildId' => 'b3', 'status' => 'whatever' ) )->get_status() );
	}

	/* ---- triggers + coalescing ---- */

	public function test_automatic_requests_coalesce_into_one_cron_event() {
		progressnow_rebuild_request( 'content-version' );
		$first = wp_next_scheduled( PROGRESSNOW_REBUILD_CRON_HOOK );
		$this->assertNotFalse( $first );
		$this->assertGreaterThanOrEqual( time() + 80, $first );

		progressnow_rebuild_request( 'content-version' );
		progressnow_rebuild_request( 'content-version' );
		$this->assertSame( $first, wp_next_scheduled( PROGRESSNOW_REBUILD_CRON_HOOK ), 'no second event while one is pending' );

		$events = 0;
		foreach ( (array) _get_cron_array() as $bucket ) {
			$events += isset( $bucket[ PROGRESSNOW_REBUILD_CRON_HOOK ] ) ? count( $bucket[ PROGRESSNOW_REBUILD_CRON_HOOK ] ) : 0;
		}
		$this->assertSame( 1, $events );

		$state = progressnow_rebuild_state();
		$this->assertSame( 'scheduled', $state['status'] );
		$this->assertSame( 3, $state['requestedVersion'] );
	}

	public function test_content_version_bump_requests_a_rebuild() {
		progressnow_cache_bump_version();

		$state = progressnow_rebuild_state();
		$this->assertSame( 'scheduled', $state['status'] );
		$this->assertSame( 4, $state['requestedVersion'] );
		$this->assertNotFalse( wp_next_scheduled( PROGRESSNOW_REBUILD_CRON_HOOK ) );
	}

	/** A page save (not only posts/events) schedules a rebuild at the new content version within the same request. */
	public function test_page_save_schedules_a_rebuild_at_the_new_version() {
		add_action( 'save_post', 'progressnow_cache_bump_on_post_save', 20, 2 );

		wp_insert_post( array( 'post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'About' ) );

		$state = progressnow_rebuild_state();
		$this->assertSame( 'scheduled', $state['status'] );
		$this->assertSame( 4, $state['requestedVersion'], 'requested at the bumped version' );
		$this->assertSame( 4, progressnow_content_version() );
		$this->assertNotFalse( wp_next_scheduled( PROGRESSNOW_REBUILD_CRON_HOOK ) );
	}

	public function test_transport_none_never_dispatches() {
		$this->use_transport( 'none' );
		$this->mock_http( $this->http_response( 500 ) );

		$state = progressnow_rebuild_request( 'admin', true );

		$this->assertSame( 'not_configured', $state['status'] );
		$this->assertSame( array(), $this->requests );
		$this->assertFalse( wp_next_scheduled( PROGRESSNOW_REBUILD_CRON_HOOK ) );
	}

	/* ---- transports ---- */

	public function test_github_dispatch_sends_repository_dispatch() {
		$this->mock_http( $this->http_response( 204 ) );

		$state = progressnow_rebuild_request( 'admin', true );

		$this->assertSame( 'requested', $state['status'] );
		$this->assertSame( 1, $state['attempts'] );
		$this->assertCount( 1, $this->requests );

		list( $url, $args ) = $this->requests[0];
		$this->assertSame( 'https://api.github.com/repos/example/site/dispatches', $url );
		$this->assertSame( 'Bearer ghp_test', $args['headers']['Authorization'] );

		$body = json_decode( $args['body'], true );
		$this->assertSame( 'rebuild-site', $body['event_type'] );
		$this->assertSame( 'rebuild', $body['client_payload']['event'] );
		$this->assertSame( 3, $body['client_payload']['contentVersion'] );
		$this->assertSame( 'admin', $body['client_payload']['reason'] );
		$this->assertSame( $state['requestId'], $body['client_payload']['requestId'] );
		$this->assertSame( home_url( '/' ), $body['client_payload']['siteUrl'] );
	}

	public function test_dispatch_retries_three_times_then_needs_attention() {
		$this->mock_http( new WP_Error( 'http_request_failed', 'Connection refused' ) );

		$state = progressnow_rebuild_request( 'admin', true );

		$this->assertSame( 'needs_attention', $state['status'] );
		$this->assertSame( 3, $state['attempts'] );
		$this->assertStringContainsString( 'Connection refused', $state['lastError'] );
		$this->assertCount( 3, $this->requests );
	}

	public function test_webhook_dispatch_is_signed_and_records_build_id() {
		$this->use_transport( 'webhook' );
		$this->mock_http( $this->http_response( 202, '{"buildId":"gh-42","status":"queued"}' ) );

		$state = progressnow_rebuild_request( 'cli', true );

		$this->assertSame( 'requested', $state['status'] );
		$this->assertSame( 'gh-42', $state['lastBuildId'] );

		list( $url, $args ) = $this->requests[0];
		$this->assertSame( 'https://hooks.example.test/rebuild', $url );
		$this->assertTrue(
			progressnow_rebuild_verify( $args['body'], $args['headers']['X-Chapter-Timestamp'], $args['headers']['X-Chapter-Signature'] ),
			'signature verifies against the body + timestamp'
		);
		$this->assertSame( 'rebuild', json_decode( $args['body'], true )['event'] );
	}

	/* ---- lost-update guard ---- */

	public function test_stale_live_build_triggers_a_new_request() {
		update_option( 'progressnow_content_ver', 7 );

		progressnow_rebuild_mark_live( 'b9', 5 );

		$state = progressnow_rebuild_state();
		$this->assertSame( 'b9', $state['liveBuildId'] );
		$this->assertSame( 5, $state['liveVersion'] );
		$this->assertSame( 'scheduled', $state['status'], 'content moved on → re-requested' );
		$this->assertSame( 7, $state['requestedVersion'] );
		$this->assertNotFalse( wp_next_scheduled( PROGRESSNOW_REBUILD_CRON_HOOK ) );
	}

	public function test_current_live_build_does_not_redispatch() {
		update_option( 'progressnow_content_ver', 5 );

		progressnow_rebuild_mark_live( 'b10', 5 );

		$this->assertSame( 'live', progressnow_rebuild_state()['status'] );
		$this->assertFalse( wp_next_scheduled( PROGRESSNOW_REBUILD_CRON_HOOK ) );
	}

	/* ---- settings supply (§ Settings may be supplied by environment) ---- */

	public function test_environment_wins_over_the_constant_and_an_empty_value_means_unset() {
		$this->assertSame( 'example/site', progressnow_rebuild_setting( 'CHAPTER_GITHUB_REPO' ) );
		$this->assertSame( 'constant', progressnow_rebuild_setting_source( 'CHAPTER_GITHUB_REPO' ) );
		$this->assertSame( 'unset', progressnow_rebuild_setting_source( 'CHAPTER_REBUILD_SECRET_OUT' ) );

		putenv( 'CHAPTER_GITHUB_REPO=owner/site-dispatch' );
		putenv( 'CHAPTER_FRONTEND=nuxt' );
		try {
			$this->assertSame( 'owner/site-dispatch', progressnow_rebuild_setting( 'CHAPTER_GITHUB_REPO' ) );
			$this->assertSame( 'env', progressnow_rebuild_setting_source( 'CHAPTER_GITHUB_REPO' ) );
			$this->assertSame( 'nuxt', progressnow_shell_mode(), 'shell settings follow the same rule' );
			$this->assertSame( 'env', progressnow_shell_setting_source( 'CHAPTER_FRONTEND' ) );

			putenv( 'CHAPTER_GITHUB_REPO=' );
			$this->assertSame( 'example/site', progressnow_rebuild_setting( 'CHAPTER_GITHUB_REPO' ), 'NAME= counts as unset, not as blank' );
			$this->assertSame( 'constant', progressnow_rebuild_setting_source( 'CHAPTER_GITHUB_REPO' ) );
		} finally {
			putenv( 'CHAPTER_GITHUB_REPO' );
			putenv( 'CHAPTER_FRONTEND' );
		}

		$this->assertSame( 'islands', progressnow_shell_mode() );
	}

	public function test_a_secret_injected_by_the_host_configures_the_webhook_transport() {
		$this->use_transport( 'webhook' );
		$secret = 'host-injected-secret-' . str_repeat( 'h', 24 );
		putenv( 'CHAPTER_REBUILD_SECRET=' . $secret );
		try {
			$this->assertSame( 'webhook', progressnow_rebuild_transport() );
			$this->assertSame( '', progressnow_rebuild_transport_problem() );
			$this->assertSame( $secret, progressnow_rebuild_secret( 'out' ) );
			$this->assertSame( $secret, progressnow_rebuild_secret( 'in' ), 'both directions fall back to the shared value' );

			$export = progressnow_admin_build_export( progressnow_rebuild_state(), null );
			$this->assertSame( 'webhook', $export['transport'] );
			$this->assertSame( 'env', $export['settings']['CHAPTER_REBUILD_SECRET'] );
			$this->assertSame( 'filter', $export['settings']['CHAPTER_REBUILD_TRANSPORT'] );
			$this->assertSame( 'unset', $export['settings']['CHAPTER_REBUILD_SECRET_IN'] );
			$this->assertStringNotContainsString( $secret, wp_json_encode( $export ) );
		} finally {
			putenv( 'CHAPTER_REBUILD_SECRET' );
		}
	}

	/* ---- secret strength (§ Shared secrets meet a minimum strength) ---- */

	public function test_a_short_secret_disables_the_webhook_transport_and_the_callback_and_names_the_constant() {
		$this->use_transport( 'webhook' );
		$this->mock_http( $this->http_response( 202, '{"buildId":"never"}' ) );
		putenv( 'CHAPTER_REBUILD_SECRET=twenty-characters-xx' );
		try {
			$this->assertSame( 'none', progressnow_rebuild_transport() );
			$this->assertSame( 'CHAPTER_REBUILD_SECRET is shorter than 32 characters', progressnow_rebuild_transport_problem() );
			$this->assertSame( array( 'CHAPTER_REBUILD_SECRET' ), progressnow_rebuild_secret_problems() );

			$this->assertSame( 'not_configured', progressnow_rebuild_request( 'admin', true )['status'] );
			$this->assertSame( array(), $this->requests, 'nothing is dispatched' );

			// The inbound side is off too: a short secret verifies nothing.
			$this->assertSame( 401, $this->signed_status( array( 'buildId' => 'b1', 'status' => 'succeeded' ) )->get_status() );

			$notices = $this->render_notices();
			$this->assertStringContainsString( 'Rebuild secret too short', $notices );
			$this->assertStringContainsString( 'CHAPTER_REBUILD_SECRET must be at least 32 characters', $notices );
			$this->assertStringNotContainsString( 'twenty-characters-xx', $notices );
			$this->assertStringContainsString( 'none — CHAPTER_REBUILD_SECRET is shorter than 32 characters', $this->rows()['Rebuild transport'] );
		} finally {
			putenv( 'CHAPTER_REBUILD_SECRET' );
		}
	}

	public function test_a_secret_of_exactly_the_minimum_length_is_accepted() {
		$this->use_transport( 'webhook' );
		putenv( 'CHAPTER_REBUILD_SECRET=' . str_repeat( 'a', 32 ) );
		try {
			$this->assertSame( 'webhook', progressnow_rebuild_transport() );
			$this->assertSame( array(), progressnow_rebuild_secret_problems() );
			$this->assertSame( '', $this->render_notices() );
		} finally {
			putenv( 'CHAPTER_REBUILD_SECRET' );
		}
	}

	/* ---- split secrets (design: optional outbound / inbound constants) ---- */

	public function test_split_secrets_sign_outbound_and_verify_inbound_independently() {
		$out = 'outbound-only-secret-' . str_repeat( 'o', 16 );
		$in  = 'inbound-only-secret-' . str_repeat( 'i', 16 );
		putenv( 'CHAPTER_REBUILD_SECRET_OUT=' . $out );
		putenv( 'CHAPTER_REBUILD_SECRET_IN=' . $in );
		try {
			$this->use_transport( 'webhook' );
			$this->mock_http( $this->http_response( 202, '{"buildId":"b-split"}' ) );
			$this->assertSame( 'requested', progressnow_rebuild_request( 'cli', true )['status'] );

			list( , $args ) = $this->requests[0];
			$this->assertSame(
				'sha256=' . hash_hmac( 'sha256', $args['headers']['X-Chapter-Timestamp'] . '.' . $args['body'], $out ),
				$args['headers']['X-Chapter-Signature'],
				'outbound: signed with _OUT'
			);

			$body = array( 'buildId' => 'b-split', 'status' => 'succeeded', 'contentVersion' => 3 );
			$json = wp_json_encode( $body );
			$ts   = (string) time();
			$sig  = static fn( $secret ) => 'sha256=' . hash_hmac( 'sha256', $ts . '.' . $json, $secret );

			$this->assertSame( 401, $this->signed_status( $body, $ts, $sig( CHAPTER_REBUILD_SECRET ) )->get_status(), 'the shared secret no longer verifies inbound' );
			$this->assertSame( 401, $this->signed_status( $body, $ts, $sig( $out ) )->get_status(), 'the outbound secret never verifies inbound' );
			$this->assertSame( 204, $this->signed_status( $body, $ts, $sig( $in ) )->get_status(), 'inbound: verified with _IN' );
			$this->assertSame( 'live', progressnow_rebuild_state()['status'] );
		} finally {
			putenv( 'CHAPTER_REBUILD_SECRET_OUT' );
			putenv( 'CHAPTER_REBUILD_SECRET_IN' );
		}
	}

	public function test_a_short_split_secret_does_not_fall_back_to_the_shared_one() {
		putenv( 'CHAPTER_REBUILD_SECRET_OUT=short-out' );
		try {
			$this->use_transport( 'webhook' );
			$this->assertSame( '', progressnow_rebuild_secret( 'out' ) );
			$this->assertSame( CHAPTER_REBUILD_SECRET, progressnow_rebuild_secret( 'in' ), 'the other direction still falls back' );
			$this->assertSame( 'none', progressnow_rebuild_transport() );
			$this->assertSame( 'CHAPTER_REBUILD_SECRET_OUT is shorter than 32 characters', progressnow_rebuild_transport_problem() );
			$this->assertSame( array( 'CHAPTER_REBUILD_SECRET_OUT' ), progressnow_rebuild_secret_problems() );
		} finally {
			putenv( 'CHAPTER_REBUILD_SECRET_OUT' );
		}
	}

	/* ---- secrets never appear in output (§ Secrets never appear in output) ---- */

	public function test_upstream_error_bodies_are_redacted_and_truncated_in_every_output() {
		$token  = 'github_pat_example_DISTINCTIVE_token_0000'; // gitleaks stopword "example": a fixture, not a credential
		$secret = 'distinctive-shared-secret-3f9a2c1e7b5d4680';
		putenv( 'CHAPTER_GITHUB_TOKEN=' . $token );
		putenv( 'CHAPTER_REBUILD_SECRET=' . $secret );
		try {
			$body = '<p>Bad credentials for ' . $token . ' (secret=' . $secret . '; Authorization: Bearer ' . $token . ')</p>' . str_repeat( ' padding', 60 );
			$this->mock_http( $this->http_response( 401, $body ) );

			$state = progressnow_rebuild_request( 'admin', true );

			$this->assertSame( 'needs_attention', $state['status'] );
			$this->assertStringStartsWith( 'github: HTTP 401 Bad credentials for [redacted] (secret=[redacted]; Authorization: Bearer [redacted])', $state['lastError'] );
			$this->assertLessThanOrEqual( PROGRESSNOW_REBUILD_ERROR_MAX + 3, mb_strlen( $state['lastError'] ), '200 characters then an ASCII ellipsis' );
			$this->assertStringEndsWith( '...', $state['lastError'] );
			$this->assertStringNotContainsString( '<p>', $state['lastError'] );

			$notices = $this->render_notices();
			$this->assertStringContainsString( 'Site build needs attention', $notices );
			$this->assertStringContainsString( '[redacted]', $notices );

			$outputs = array(
				'chapter_build_state'   => wp_json_encode( get_option( PROGRESSNOW_REBUILD_STATE_KEY ) ),
				'panel rows'            => wp_json_encode( progressnow_admin_build_rows( progressnow_rebuild_state(), null ) ),
				'build-status json'     => wp_json_encode( progressnow_admin_build_export( progressnow_rebuild_state(), null ) ),
				'admin notices'         => $notices,
				'rebuild/failed action' => $this->last_failed_error,
			);
			foreach ( $outputs as $where => $text ) {
				$this->assertIsString( $text, $where );
				$this->assertStringNotContainsString( $token, $text, $where );
				$this->assertStringNotContainsString( $secret, $text, $where );
			}
		} finally {
			putenv( 'CHAPTER_GITHUB_TOKEN' );
			putenv( 'CHAPTER_REBUILD_SECRET' );
		}
	}

	public function test_a_state_stored_before_redaction_existed_is_redacted_on_read() {
		$token = 'ghp_legacy_example_DISTINCTIVE_0000'; // gitleaks stopword "example": a fixture, not a credential
		putenv( 'CHAPTER_GITHUB_TOKEN=' . $token );
		try {
			update_option( PROGRESSNOW_REBUILD_STATE_KEY, array( 'status' => 'needs_attention', 'lastError' => 'github: HTTP 401 ' . $token ) );
			$this->assertSame( 'github: HTTP 401 [redacted]', progressnow_rebuild_state()['lastError'] );
		} finally {
			putenv( 'CHAPTER_GITHUB_TOKEN' );
		}
	}

	public function test_a_failed_callback_error_is_redacted_before_it_is_stored() {
		$secret = 'callback-secret-DISTINCTIVE-0123456789abcdef';
		putenv( 'CHAPTER_REBUILD_SECRET=' . $secret );
		try {
			$response = $this->signed_status( array( 'buildId' => 'b7', 'status' => 'failed', 'error' => 'receiver rejected secret ' . $secret ) );
			$this->assertSame( 204, $response->get_status() );
			$this->assertSame( 'receiver rejected secret [redacted]', progressnow_rebuild_state()['lastError'] );
			$this->assertStringNotContainsString( $secret, wp_json_encode( get_option( PROGRESSNOW_REBUILD_STATE_KEY ) ) );
		} finally {
			putenv( 'CHAPTER_REBUILD_SECRET' );
		}
	}

	public function test_theme_never_spawns_processes() {
		$root  = dirname( __DIR__ );
		$files = array_merge( glob( $root . '/inc/*.php' ), glob( $root . '/src/*.php' ), array( $root . '/functions.php' ) );
		foreach ( $files as $file ) {
			$this->assertDoesNotMatchRegularExpression( '/\b(exec|shell_exec|system|passthru|proc_open|popen)\s*\(/', (string) file_get_contents( $file ), basename( $file ) );
		}
	}
}
