<?php
/**
 * HTTP security headers + CSP (inc/security.php; openspec
 * security-headers-and-cicd-gates).
 *
 * The static header set, HSTS over TLS only, the nonce CSP (report-only by
 * default, `CHAPTER_CSP_MODE` flips it), nonce stamping on every executable
 * script core prints, the enumerated third-party origins, and the bounded
 * violation sink.
 */

use WorDBless\BaseTestCase;

class TestSecurityHeaders extends BaseTestCase {

	private $settings = array();
	private $https;
	private $dev_manifest;
	private $created_dist = false;

	public function set_up() {
		switch_theme( basename( dirname( __DIR__ ) ) );

		// Plain require: WorDBless restores hooks to a pre-theme snapshot
		// after every test, so hooks must re-register per test.
		require dirname( __DIR__ ) . '/functions.php';

		do_action( 'after_setup_theme' );

		parent::set_up();

		// parent::set_up() restores the pre-theme hook snapshot; re-attach the
		// hooks under test exactly as functions.php registers them.
		add_filter( 'wp_script_attributes', 'progressnow_csp_nonce_attribute' );
		add_filter( 'wp_inline_script_attributes', 'progressnow_csp_nonce_attribute' );
		add_filter( 'timber/context', 'progressnow_csp_context' );
		add_action( 'send_headers', 'progressnow_security_send_headers' );
		add_action( 'rest_api_init', 'progressnow_csp_register_report_route' );
		$GLOBALS['wp_rest_server'] = null;

		$this->settings = array();
		add_filter(
			'progressnow/security/setting',
			function ( $value, $name ) {
				return array_key_exists( $name, $this->settings ) ? $this->settings[ $name ] : $value;
			},
			10,
			2
		);

		$this->https        = $_SERVER['HTTPS'] ?? null;
		$this->dev_manifest = get_template_directory() . '/dist/vite-dev-server.json';
		progressnow_csp_reset_nonce();
		progressnow_csp_clear_reports();
	}

	public function tear_down() {
		if ( null === $this->https ) {
			unset( $_SERVER['HTTPS'] );
		} else {
			$_SERVER['HTTPS'] = $this->https;
		}
		if ( $this->created_dist ) {
			@unlink( $this->dev_manifest );
			@rmdir( dirname( $this->dev_manifest ) );
			$this->created_dist = false;
		}
		progressnow_csp_clear_reports();
		parent::tear_down();
	}

	/** directive => sources, parsed back from the serialized policy. */
	private function directives( $policy ) {
		$out = array();
		foreach ( explode( '; ', $policy ) as $part ) {
			$tokens = explode( ' ', $part );
			$out[ array_shift( $tokens ) ] = $tokens;
		}

		return $out;
	}

	private function post_report( $body, $content_type = 'application/csp-report' ) {
		$request = new WP_REST_Request( 'POST', '/progressnow/v1/csp-report' );
		$request->set_header( 'Content-Type', $content_type );
		$request->set_body( $body );

		return rest_do_request( $request );
	}

	private function report_uri_body( $directive, $blocked, $document = 'http://example.org/blog/post/', $extra = array() ) {
		return wp_json_encode(
			array(
				'csp-report' => $extra + array(
					'document-uri'       => $document,
					'violated-directive' => $directive . " 'self'",
					'effective-directive' => $directive,
					'blocked-uri'        => $blocked,
				),
			)
		);
	}

	/* ---- static headers ---- */

	public function test_every_response_carries_the_static_header_set() {
		$headers = progressnow_security_headers( false );

		$this->assertSame( 'nosniff', $headers['X-Content-Type-Options'] );
		$this->assertSame( 'SAMEORIGIN', $headers['X-Frame-Options'], 'the Customizer/editor preview frames the front end from the same origin' );
		$this->assertSame( 'strict-origin-when-cross-origin', $headers['Referrer-Policy'] );
		$this->assertSame( 'camera=(), microphone=(), geolocation=(), payment=()', $headers['Permissions-Policy'] );
		$this->assertArrayNotHasKey( 'Content-Security-Policy', $headers, 'non-HTML responses carry no CSP' );
		$this->assertArrayNotHasKey( 'Content-Security-Policy-Report-Only', $headers );
	}

	public function test_hsts_is_sent_only_over_tls_with_a_modest_max_age() {
		unset( $_SERVER['HTTPS'] );
		$this->assertArrayNotHasKey( 'Strict-Transport-Security', progressnow_security_headers( false ), 'no HSTS over plain HTTP' );

		$_SERVER['HTTPS'] = 'on';
		$headers          = progressnow_security_headers( false );
		$this->assertSame( 'max-age=86400', $headers['Strict-Transport-Security'], 'one day to start; ramp via the filter' );
		$this->assertStringNotContainsString( 'preload', $headers['Strict-Transport-Security'] );

		add_filter( 'progressnow/security/hsts_max_age', static fn() => 63072000 );
		$this->assertSame( 'max-age=63072000', progressnow_security_headers( false )['Strict-Transport-Security'] );

		add_filter( 'progressnow/security/hsts_max_age', '__return_zero', 20 );
		$this->assertArrayNotHasKey( 'Strict-Transport-Security', progressnow_security_headers( false ), '0 omits the header' );
	}

	public function test_send_headers_hook_is_registered_and_targets_html_only() {
		$this->assertSame( 10, has_action( 'send_headers', 'progressnow_security_send_headers' ) );

		$this->assertTrue( progressnow_security_is_html_request(), 'a page request is HTML' );

		$GLOBALS['wp_query']->is_feed = true;
		$this->assertFalse( progressnow_security_is_html_request(), 'feeds (RSS, the ICS calendar) get no CSP' );
		$GLOBALS['wp_query']->is_feed = false;

		$GLOBALS['wp_query']->is_robots = true;
		$this->assertFalse( progressnow_security_is_html_request() );
		$GLOBALS['wp_query']->is_robots = false;
	}

	public function test_headers_filter_has_the_final_say() {
		add_filter(
			'progressnow/security/headers',
			static function ( $headers ) {
				unset( $headers['X-Frame-Options'] );
				$headers['X-Custom'] = 'yes';
				return $headers;
			}
		);
		$headers = progressnow_security_headers( true );
		$this->assertArrayNotHasKey( 'X-Frame-Options', $headers );
		$this->assertSame( 'yes', $headers['X-Custom'] );
	}

	/* ---- CSP mode ---- */

	public function test_csp_ships_report_only_by_default_with_the_local_sink() {
		$headers = progressnow_security_headers( true );

		$this->assertArrayHasKey( 'Content-Security-Policy-Report-Only', $headers );
		$this->assertArrayNotHasKey( 'Content-Security-Policy', $headers );
		$this->assertSame( array( rest_url( 'progressnow/v1/csp-report' ) ), $this->directives( $headers['Content-Security-Policy-Report-Only'] )['report-uri'] );
	}

	public function test_csp_mode_constant_flips_to_enforcing_or_off() {
		$this->settings['CHAPTER_CSP_MODE'] = 'enforce';
		$headers                            = progressnow_security_headers( true );
		$this->assertArrayHasKey( 'Content-Security-Policy', $headers );
		$this->assertArrayNotHasKey( 'Content-Security-Policy-Report-Only', $headers );
		$this->assertSame( 'enforce', progressnow_csp_mode() );

		$this->settings['CHAPTER_CSP_MODE'] = 'off';
		$headers                            = progressnow_security_headers( true );
		$this->assertArrayNotHasKey( 'Content-Security-Policy', $headers );
		$this->assertArrayNotHasKey( 'Content-Security-Policy-Report-Only', $headers );
		$this->assertSame( 'nosniff', $headers['X-Content-Type-Options'], 'the static set stays' );

		$this->settings['CHAPTER_CSP_MODE'] = 'bogus';
		$this->assertSame( 'report-only', progressnow_csp_mode(), 'an unknown value falls back to report-only' );
	}

	public function test_report_uri_filter_can_point_elsewhere_or_drop_the_directive() {
		add_filter( 'progressnow/security/csp_report_uri', static fn() => 'https://collector.example/csp' );
		$this->assertSame( array( 'https://collector.example/csp' ), $this->directives( progressnow_csp_policy() )['report-uri'] );

		add_filter( 'progressnow/security/csp_report_uri', '__return_empty_string', 20 );
		$this->assertArrayNotHasKey( 'report-uri', $this->directives( progressnow_csp_policy() ) );
	}

	/* ---- policy ---- */

	public function test_policy_locks_scripts_to_self_plus_nonce_and_fences_the_rest() {
		$nonce      = progressnow_csp_nonce();
		$directives = $this->directives( progressnow_csp_policy() );

		$this->assertSame( array( "'self'" ), $directives['default-src'] );
		$this->assertSame( array( "'self'", "'nonce-{$nonce}'" ), $directives['script-src'], 'no unsafe-inline, no unsafe-eval, no wildcard' );
		$this->assertSame( array( "'self'", "'unsafe-inline'" ), $directives['style-src'] );
		$this->assertSame( array( 'https://www.youtube-nocookie.com', 'https://player.vimeo.com' ), $directives['frame-src'], 'the video block players (BlockVideo.vue)' );
		$this->assertContains( 'https://secure.gravatar.com', $directives['img-src'], 'author avatars' );
		$this->assertContains( 'data:', $directives['img-src'] );
		$this->assertSame( array( "'self'" ), $directives['connect-src'], 'the REST fast-path is same-origin' );
		$this->assertSame( array( "'self'", 'data:' ), $directives['font-src'], 'fonts are self-hosted' );
		$this->assertSame( array( "'self'" ), $directives['media-src'] );
		$this->assertSame( array( "'self'" ), $directives['frame-ancestors'] );
		$this->assertSame( array( "'none'" ), $directives['object-src'] );
		$this->assertSame( array( "'self'" ), $directives['base-uri'] );
		$this->assertSame( array( "'self'" ), $directives['form-action'], 'search, comments and the password form post to this origin' );
	}

	public function test_policy_filter_extends_a_directive() {
		add_filter(
			'progressnow/security/csp',
			static function ( $directives ) {
				$directives['script-src'][] = 'https://analytics.example';
				$directives['img-src'][]    = 'https://analytics.example';
				return $directives;
			}
		);
		$directives = $this->directives( progressnow_csp_policy() );
		$this->assertContains( 'https://analytics.example', $directives['script-src'] );
		$this->assertContains( 'https://analytics.example', $directives['img-src'] );
	}

	public function test_vite_dev_server_origin_is_allowed_while_the_dev_manifest_exists() {
		if ( file_exists( $this->dev_manifest ) ) {
			$this->markTestSkipped( 'a real Vite dev server is running; not clobbering its manifest' );
		}
		if ( ! is_dir( dirname( $this->dev_manifest ) ) ) {
			mkdir( dirname( $this->dev_manifest ) );
		}
		file_put_contents( $this->dev_manifest, wp_json_encode( array( 'base' => '/', 'origin' => 'https://localhost:3000/', 'port' => 3000 ) ) );
		$this->created_dist = true;

		$directives = $this->directives( progressnow_csp_policy() );
		$this->assertContains( 'https://localhost:3000', $directives['script-src'] );
		$this->assertContains( 'https://localhost:3000', $directives['style-src'] );
		$this->assertContains( 'https://localhost:3000', $directives['connect-src'] );
		$this->assertContains( 'wss://localhost:3000', $directives['connect-src'], 'HMR websocket' );
		$this->assertContains( 'https://localhost:3000', $directives['font-src'] );
		$this->assertContains( 'https://localhost:3000', $directives['img-src'] );
		$this->assertNotContains( "'unsafe-inline'", $directives['script-src'], 'dev mode still never opens inline script' );
	}

	public function test_separate_static_origin_is_allowed_for_nuxt_shells() {
		add_filter(
			'progressnow/shell/setting',
			static fn( $value, $name ) => 'CHAPTER_STATIC_ORIGIN' === $name ? 'https://static.example' : $value,
			10,
			2
		);
		$directives = $this->directives( progressnow_csp_policy() );
		$this->assertContains( 'https://static.example', $directives['script-src'] );
		$this->assertContains( 'https://static.example', $directives['connect-src'] );
		$this->assertContains( 'https://static.example', $directives['style-src'] );
	}

	public function test_site_origin_itself_is_never_listed_twice() {
		add_filter(
			'progressnow/shell/setting',
			static fn( $value, $name ) => 'CHAPTER_STATIC_ORIGIN' === $name ? 'http://example.org' : $value,
			10,
			2
		);
		$this->assertSame( array( "'self'", "'nonce-" . progressnow_csp_nonce() . "'" ), $this->directives( progressnow_csp_policy() )['script-src'] );
	}

	/* ---- nonce ---- */

	public function test_nonce_is_minted_once_per_request_and_matches_the_header() {
		$nonce = progressnow_csp_nonce();

		$this->assertSame( $nonce, progressnow_csp_nonce(), 'stable within a request' );
		$this->assertSame( 16, strlen( base64_decode( $nonce, true ) ), '128 random bits, base64' );
		$this->assertStringContainsString( "'nonce-{$nonce}'", progressnow_security_headers( true )['Content-Security-Policy-Report-Only'] );
		$this->assertSame( ' nonce="' . $nonce . '"', progressnow_csp_nonce_attr() );

		progressnow_csp_reset_nonce();
		$this->assertNotSame( $nonce, progressnow_csp_nonce(), 'a new request mints a new nonce' );
	}

	public function test_core_script_tags_carry_the_nonce_but_data_blocks_do_not() {
		$nonce = progressnow_csp_nonce();

		$this->assertStringContainsString( 'nonce="' . $nonce . '"', wp_get_script_tag( array( 'src' => '/x.js' ) ), 'enqueued script' );
		$this->assertStringContainsString( 'nonce="' . $nonce . '"', wp_get_inline_script_tag( 'window.x=1;' ), 'inline script' );
		$this->assertStringContainsString( 'nonce="' . $nonce . '"', wp_get_inline_script_tag( 'import x from "y";', array( 'type' => 'module' ) ), 'module script' );
		$this->assertStringContainsString( 'nonce="' . $nonce . '"', wp_get_inline_script_tag( '{}', array( 'type' => 'importmap' ) ), 'import maps are script-src governed' );

		$this->assertStringNotContainsString( 'nonce=', wp_get_inline_script_tag( '{}', array( 'type' => 'application/json' ) ), 'JSON data block' );
		$this->assertStringNotContainsString( 'nonce=', wp_get_inline_script_tag( '{}', array( 'type' => 'application/ld+json' ) ), 'JSON-LD data block' );
	}

	public function test_twig_context_exposes_the_nonce() {
		$this->assertSame( progressnow_csp_nonce(), progressnow_csp_context( array() )['csp_nonce'] );
	}

	/**
	 * Every executable <script> core and the theme print in wp_head/wp_footer
	 * carries the request nonce — the emoji loader, an enqueued handle, its
	 * localized data and inline additions, the SEO JSON-LD (data, unstamped).
	 */
	public function test_wp_head_and_footer_print_no_executable_script_without_the_nonce() {
		add_filter( 'show_admin_bar', '__return_false' );
		add_action( 'wp_head', 'progressnow_seo_head', 5 );
		add_action(
			'wp_enqueue_scripts',
			static function () {
				wp_enqueue_script( 'probe', '/probe.js', array(), '1', true );
				wp_localize_script( 'probe', 'probeData', array( 'a' => 1 ) );
				wp_add_inline_script( 'probe', 'window.probe = 1;' );
			}
		);

		ob_start();
		do_action( 'wp_head' );
		do_action( 'wp_footer' );
		$html  = ob_get_clean();
		$nonce = progressnow_csp_nonce();

		preg_match_all( '#<script\b([^>]*)>#i', $html, $m );
		$this->assertGreaterThanOrEqual( 3, count( $m[1] ), 'probe + localized data + inline printed' );
		foreach ( array( 'probe-js-extra', 'probe-js', 'probe-js-after' ) as $id ) {
			$this->assertStringContainsString( 'id="' . $id . '"', $html, $id . ' printed' );
		}

		$executable = 0;
		foreach ( $m[1] as $attrs ) {
			$is_data = (bool) preg_match( '#type=["\']?application/(?:ld\+)?json#i', $attrs );
			if ( $is_data ) {
				$this->assertStringNotContainsString( 'nonce=', $attrs, 'data blocks stay unstamped: ' . $attrs );
				continue;
			}
			++$executable;
			$this->assertStringContainsString( 'nonce="' . $nonce . '"', $attrs, 'executable script without the nonce: <script' . $attrs . '>' );
		}
		$this->assertGreaterThanOrEqual( 3, $executable );
		$this->assertStringContainsString( "'nonce-{$nonce}'", progressnow_csp_policy(), 'the same nonce the header carries' );
	}

	/* ---- report sink ---- */

	public function test_report_route_is_public_post_only() {
		$routes = rest_get_server()->get_routes( 'progressnow/v1' );
		$this->assertArrayHasKey( '/progressnow/v1/csp-report', $routes );
		$this->assertSame( array( 'POST' => true ), $routes['/progressnow/v1/csp-report'][0]['methods'] );

		$this->assertSame( 404, ( new WP_REST_Response( null, 404 ) )->get_status() );
		$get = rest_do_request( new WP_REST_Request( 'GET', '/progressnow/v1/csp-report' ) );
		$this->assertSame( 404, $get->get_status(), 'GET is not a report' );
	}

	public function test_report_uri_format_is_recorded_and_aggregated() {
		$this->assertSame( 204, $this->post_report( $this->report_uri_body( 'script-src', 'inline', 'http://example.org/blog/post/?s=secret', array( 'source-file' => 'http://example.org/blog/post/', 'line-number' => 12 ) ) )->get_status() );

		$store = progressnow_csp_reports();
		$this->assertCount( 1, $store['rows'] );
		$row = reset( $store['rows'] );
		$this->assertSame( 'script-src', $row['directive'] );
		$this->assertSame( 'inline', $row['blocked'] );
		$this->assertSame( '/blog/post/', $row['document'], 'query string dropped (search terms would explode cardinality)' );
		$this->assertSame( 'http://example.org/blog/post/:12', $row['source'] );
		$this->assertSame( 1, $row['count'] );
		$this->assertSame( 0, $store['dropped'] );

		$this->post_report( $this->report_uri_body( 'script-src', 'inline', 'http://example.org/blog/post/?page=2' ) );
		$store = progressnow_csp_reports();
		$this->assertCount( 1, $store['rows'], 'same signature aggregates' );
		$this->assertSame( 2, reset( $store['rows'] )['count'] );

		$this->post_report( $this->report_uri_body( 'frame-src', 'https://www.youtube.com/embed/x' ) );
		$this->assertCount( 2, progressnow_csp_reports()['rows'] );
	}

	public function test_reporting_api_format_is_accepted() {
		$body = wp_json_encode(
			array(
				array(
					'type' => 'csp-violation',
					'age'  => 10,
					'url'  => 'http://example.org/about/',
					'body' => array(
						'documentURL'        => 'http://example.org/about/',
						'effectiveDirective' => 'img-src',
						'blockedURL'         => 'https://tracker.example/pixel.gif',
						'sourceFile'         => 'http://example.org/about/',
						'lineNumber'         => 3,
					),
				),
				array( 'type' => 'deprecation', 'body' => array( 'id' => 'x' ) ),
			)
		);
		$this->assertSame( 204, $this->post_report( $body, 'application/reports+json' )->get_status() );

		$rows = progressnow_csp_reports()['rows'];
		$this->assertCount( 1, $rows, 'only csp-violation entries are kept' );
		$row = reset( $rows );
		$this->assertSame( 'img-src', $row['directive'] );
		$this->assertSame( 'https://tracker.example/pixel.gif', $row['blocked'] );
		$this->assertSame( '/about/', $row['document'] );
	}

	public function test_first_sighting_fires_the_violation_action() {
		$seen = array();
		add_action(
			'progressnow/security/csp_violation',
			static function ( $report ) use ( &$seen ) {
				$seen[] = $report['directive'];
			}
		);
		$this->post_report( $this->report_uri_body( 'script-src', 'inline' ) );
		$this->post_report( $this->report_uri_body( 'script-src', 'inline' ) );
		$this->assertSame( array( 'script-src' ), $seen, 'fires once per signature, not per report' );
	}

	public function test_sink_rejects_oversized_and_malformed_bodies() {
		$this->assertSame( 413, $this->post_report( str_repeat( 'x', PROGRESSNOW_CSP_REPORT_MAX_BYTES + 1 ) )->get_status() );
		$this->assertSame( 400, $this->post_report( 'not json' )->get_status() );
		$this->assertSame( 400, $this->post_report( '{"csp-report":{}}' )->get_status(), 'no directive, nothing to record' );
		$this->assertSame( 400, $this->post_report( '{"csp-report":"string"}' )->get_status() );
		$this->assertSame( 400, $this->post_report( '[]' )->get_status() );
		$this->assertSame( 400, $this->post_report( '{"csp-report":{"effective-directive":["not","scalar"]}}' )->get_status() );
		$this->assertSame( array(), progressnow_csp_reports()['rows'] );
	}

	public function test_store_is_bounded_in_rows_and_field_length() {
		for ( $i = 0; $i < PROGRESSNOW_CSP_REPORTS_MAX + 3; $i++ ) {
			$this->post_report( $this->report_uri_body( 'img-src', 'https://host' . $i . '.example/' ) );
		}
		$store = progressnow_csp_reports();
		$this->assertCount( PROGRESSNOW_CSP_REPORTS_MAX, $store['rows'] );
		$this->assertSame( 3, $store['dropped'], 'new signatures past the cap are counted, not stored' );

		$this->post_report( $this->report_uri_body( 'img-src', 'https://host0.example/' ) );
		$this->assertSame( 2, progressnow_csp_reports()['rows'][ substr( md5( 'img-src|https://host0.example/|/blog/post/' ), 0, 12 ) ]['count'], 'known signatures still aggregate when full' );

		progressnow_csp_clear_reports();
		$long = str_repeat( 'a', 1000 );
		$this->post_report( $this->report_uri_body( 'script-src', 'https://x.example/' . $long ) );
		$row = reset( progressnow_csp_reports()['rows'] );
		$this->assertSame( PROGRESSNOW_CSP_REPORT_MAX_FIELD, mb_strlen( $row['blocked'] ) );
	}

	public function test_clear_forgets_everything() {
		$this->post_report( $this->report_uri_body( 'script-src', 'inline' ) );
		$this->assertCount( 1, progressnow_csp_reports()['rows'] );
		progressnow_csp_clear_reports();
		$this->assertSame( array( 'rows' => array(), 'dropped' => 0 ), progressnow_csp_reports() );
	}
}
