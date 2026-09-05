<?php
/**
 * Static-site rebuild (inc/rebuild.php): signing + verification, the signed
 * /build-status callback, coalesced scheduling, the github + webhook
 * transports (HTTP mocked via pre_http_request), retries → needs_attention,
 * and the lost-update re-dispatch.
 */

use WorDBless\BaseTestCase;

if ( ! defined( 'CHAPTER_REBUILD_SECRET' ) ) {
	define( 'CHAPTER_REBUILD_SECRET', 'test-secret' );
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

	public function set_up() {
		switch_theme( basename( dirname( __DIR__ ) ) );

		require dirname( __DIR__ ) . '/functions.php';

		do_action( 'after_setup_theme' );

		parent::set_up();

		add_action( 'rest_api_init', 'progressnow_rebuild_register_routes' );
		add_action( 'progressnow/content_version_bumped', 'progressnow_rebuild_on_content_change' );
		add_action( PROGRESSNOW_REBUILD_CRON_HOOK, 'progressnow_rebuild_dispatch' );
		add_filter( 'progressnow/rebuild/sleep', '__return_false' );
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

	public function test_theme_never_spawns_processes() {
		$root  = dirname( __DIR__ );
		$files = array_merge( glob( $root . '/inc/*.php' ), glob( $root . '/src/*.php' ), array( $root . '/functions.php' ) );
		foreach ( $files as $file ) {
			$this->assertDoesNotMatchRegularExpression( '/\b(exec|shell_exec|system|passthru|proc_open|popen)\s*\(/', (string) file_get_contents( $file ), basename( $file ) );
		}
	}
}
