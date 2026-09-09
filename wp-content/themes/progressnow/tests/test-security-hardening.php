<?php
/**
 * Runtime attack-surface hardening (inc/security-hardening.php): xmlrpc
 * disabled end to end (enabled flag, method table, X-Pingback), anonymous
 * `wp/v2/users*` removed while logged-in keeps it, `?author=N` → 404 without
 * the canonical redirect, users sitemap dropped, discovery/version noise
 * gone from wp_head + headers, core `?ver=` stripped, and the debug-drift
 * admin notice.
 */

use WorDBless\BaseTestCase;

class TestSecurityHardening extends BaseTestCase {

	public function set_up() {
		switch_theme( basename( dirname( __DIR__ ) ) );

		// Plain require: WorDBless restores hooks to a pre-theme snapshot
		// after every test, so hooks must re-register per test.
		require dirname( __DIR__ ) . '/functions.php';

		do_action( 'after_setup_theme' );

		parent::set_up();

		// parent::set_up() restores the pre-theme hook snapshot; re-attach
		// the hooks under test (same pattern as test-rest.php).
		progressnow_hardening_register();
		$GLOBALS['wp_rest_server'] = null;
	}

	public function tear_down() {
		$_GET = array();
		wp_set_current_user( 0 );
		parent::tear_down();
	}

	// -----------------------------------------------------------------------
	// XML-RPC
	// -----------------------------------------------------------------------

	public function test_xmlrpc_enabled_flag_is_false() {
		$this->assertFalse( apply_filters( 'xmlrpc_enabled', true ) );
	}

	public function test_xmlrpc_method_table_is_empty_so_pingback_ping_cannot_run() {
		require_once ABSPATH . WPINC . '/class-IXR.php';
		require_once ABSPATH . WPINC . '/class-wp-xmlrpc-server.php';

		$server = new WP_XMLRPC_Server();

		$this->assertArrayNotHasKey( 'pingback.ping', $server->methods );
		$this->assertArrayNotHasKey( 'wp.getUsersBlogs', $server->methods );
		$this->assertArrayNotHasKey( 'demo.sayHello', $server->methods );
		$this->assertSame( array(), progressnow_hardening_xmlrpc_methods( array( 'pingback.ping' => 'x' ) ) );
	}

	public function test_pingback_header_and_ping_support_removed() {
		$headers = apply_filters( 'wp_headers', array( 'X-Pingback' => 'https://example.org/xmlrpc.php', 'Link' => 'x' ) );
		$this->assertArrayNotHasKey( 'X-Pingback', $headers );
		$this->assertArrayHasKey( 'Link', $headers );

		$this->assertFalse( apply_filters( 'pings_open', true, 0 ) );
		$this->assertSame( 'closed', get_option( 'default_ping_status' ) );
	}

	// -----------------------------------------------------------------------
	// User enumeration
	// -----------------------------------------------------------------------

	private function rest_routes() {
		$server = rest_get_server();
		return array_keys( $server->get_routes() );
	}

	public function test_anonymous_rest_has_no_users_routes() {
		wp_set_current_user( 0 );
		$routes = $this->rest_routes();

		$this->assertNotEmpty( $routes );
		foreach ( $routes as $route ) {
			$this->assertStringStartsNotWith( '/wp/v2/users', $route, "route {$route} exposed to anonymous" );
		}
		$this->assertContains( '/wp/v2/posts', $routes, 'unrelated routes must stay' );
	}

	public function test_anonymous_users_request_is_404_not_a_listing() {
		wp_set_current_user( 0 );
		$response = rest_do_request( new WP_REST_Request( 'GET', '/wp/v2/users' ) );

		$this->assertSame( 404, $response->get_status() );
		$this->assertSame( 'rest_no_route', $response->as_error()->get_error_code() );

		$response = rest_do_request( new WP_REST_Request( 'GET', '/wp/v2/users/1' ) );
		$this->assertSame( 404, $response->get_status() );
	}

	public function test_logged_in_rest_keeps_users_routes() {
		$user_id = wp_insert_user(
			array(
				'user_login' => 'editor_hardening',
				'user_pass'  => wp_generate_password(),
				'role'       => 'editor',
			)
		);
		wp_set_current_user( $user_id );

		$routes = $this->rest_routes();
		$this->assertContains( '/wp/v2/users', $routes );
		$this->assertContains( '/wp/v2/users/me', $routes );
	}

	public function test_numeric_author_query_detection() {
		$_GET = array();
		$this->assertFalse( progressnow_hardening_is_author_id_probe() );

		$_GET = array( 'author' => '1' );
		$this->assertTrue( progressnow_hardening_is_author_id_probe() );

		$_GET = array( 'author' => ' 12 ' );
		$this->assertTrue( progressnow_hardening_is_author_id_probe() );

		$_GET = array( 'author' => array( 'x', '3' ) );
		$this->assertTrue( progressnow_hardening_is_author_id_probe() );

		// A slug is not the ID → slug vector (and pretty archives use author_name).
		$_GET = array( 'author' => 'cesar' );
		$this->assertFalse( progressnow_hardening_is_author_id_probe() );

		$_GET = array( 'author_name' => 'cesar' );
		$this->assertFalse( progressnow_hardening_is_author_id_probe() );
	}

	public function test_author_id_probe_becomes_404_before_canonical_redirect() {
		$_GET = array( 'author' => '1' );

		$query            = new WP_Query();
		$query->is_author = true;
		$query->is_archive = true;
		$query->set( 'author', 1 );
		$GLOBALS['wp_query']     = $query;
		$GLOBALS['wp_the_query'] = $query;

		progressnow_hardening_author_query();

		$this->assertTrue( $query->is_404() );
		$this->assertFalse( $query->is_author() );
	}

	public function test_pretty_author_archive_is_untouched() {
		$_GET = array();

		$query             = new WP_Query();
		$query->is_author  = true;
		$query->is_archive = true;
		$query->set( 'author_name', 'cesar' );
		$GLOBALS['wp_query']     = $query;
		$GLOBALS['wp_the_query'] = $query;

		progressnow_hardening_author_query();

		$this->assertFalse( $query->is_404() );
		$this->assertTrue( $query->is_author() );
	}

	public function test_users_sitemap_provider_is_dropped() {
		$provider = new WP_Sitemaps_Users();
		$this->assertFalse( apply_filters( 'wp_sitemaps_add_provider', $provider, 'users' ) );

		$posts = new WP_Sitemaps_Posts();
		$this->assertSame( $posts, apply_filters( 'wp_sitemaps_add_provider', $posts, 'posts' ) );
	}

	// -----------------------------------------------------------------------
	// Discovery + version noise
	// -----------------------------------------------------------------------

	public function test_wp_head_has_no_discovery_or_generator_tags() {
		foreach ( array( 'wp_generator', 'rsd_link', 'wlwmanifest_link', 'wp_shortlink_wp_head', 'rest_output_link_wp_head' ) as $callback ) {
			$this->assertFalse( has_action( 'wp_head', $callback ), "{$callback} still on wp_head" );
		}
		$this->assertFalse( has_action( 'template_redirect', 'wp_shortlink_header' ) );
		$this->assertFalse( has_action( 'template_redirect', 'rest_output_link_header' ) );

		$this->assertSame( '', get_the_generator( 'html' ) );
		$this->assertSame( '', get_the_generator( 'rss2' ) );
		$this->assertSame( '', get_the_generator( 'atom' ) );
		ob_start();
		the_generator( 'xhtml' );
		$this->assertSame( '', trim( ob_get_clean() ) );

		ob_start();
		wp_head();
		$head = ob_get_clean();

		$this->assertStringNotContainsString( 'name="generator"', $head );
		$this->assertStringNotContainsString( 'rel="EditURI"', $head );
		$this->assertStringNotContainsString( 'wlwmanifest', $head );
		$this->assertStringNotContainsString( 'rel="shortlink"', $head );
		$this->assertStringNotContainsString( 'https://api.w.org/', $head );
	}

	public function test_core_version_query_string_is_stripped_but_theme_versions_stay() {
		$core = get_bloginfo( 'version' );

		$this->assertSame(
			'https://example.org/wp-includes/js/dist/i18n.min.js',
			progressnow_hardening_strip_core_version( 'https://example.org/wp-includes/js/dist/i18n.min.js?ver=' . $core )
		);
		$this->assertSame(
			'https://example.org/wp-content/themes/progressnow/dist/app.js?ver=abc123',
			progressnow_hardening_strip_core_version( 'https://example.org/wp-content/themes/progressnow/dist/app.js?ver=abc123' )
		);
		$this->assertSame( 'https://example.org/x.js', progressnow_hardening_strip_core_version( 'https://example.org/x.js' ) );
		$this->assertFalse( progressnow_hardening_strip_core_version( false ) );

		$this->assertSame( 10, has_filter( 'script_loader_src', 'progressnow_hardening_strip_core_version' ) );
		$this->assertSame( 10, has_filter( 'style_loader_src', 'progressnow_hardening_strip_core_version' ) );
	}

	// -----------------------------------------------------------------------
	// Debug drift signal
	// -----------------------------------------------------------------------

	public function test_debug_drift_only_flags_production() {
		$is_debug = defined( 'WP_DEBUG' ) && WP_DEBUG;

		$this->assertFalse( progressnow_hardening_debug_drift( 'local' ) );
		$this->assertFalse( progressnow_hardening_debug_drift( 'staging' ) );
		$this->assertSame(
			$is_debug || ( defined( 'WP_DEBUG_DISPLAY' ) && WP_DEBUG_DISPLAY ),
			progressnow_hardening_debug_drift( 'production' )
		);
		// Live env type is whatever the test runner has; must not throw.
		$this->assertIsBool( progressnow_hardening_debug_drift() );
	}
}
