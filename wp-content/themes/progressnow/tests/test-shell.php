<?php
/**
 * PHP shell → Nuxt handoff (inc/shell.php): mode flag + admin-bar bypass,
 * manifest fetch/validation/degraded mode, app tags, __SHELL_DATA__ (payload
 * equality with the REST builders, HTML-safe encoding), islands exclusivity,
 * static passthrough resolution (MIME, cache, traversal), and new-build
 * detection. Content comes through the WorDBless `posts_pre_query` seam.
 */

use WorDBless\BaseTestCase;

class TestShell extends BaseTestCase {

	private $seam_ids = array();
	private $settings = array();
	private $static_dir = '';

	public function set_up() {
		switch_theme( basename( dirname( __DIR__ ) ) );

		require dirname( __DIR__ ) . '/functions.php';

		do_action( 'after_setup_theme' );

		parent::set_up();

		add_filter( 'progressnow/context/front_page', 'progressnow_options_front_page_context', 5, 2 );
		add_filter( 'progressnow/context/front_page', 'progressnow_events_front_page_context' );
		add_filter( 'progressnow/context/front_page', 'progressnow_blog_front_page_context' );
		add_filter( 'progressnow/context/page', 'progressnow_interior_page_context', 10, 2 );
		add_filter( 'progressnow/context/page', 'progressnow_pages_page_context', 10, 2 );
		add_filter( 'progressnow/context/page', 'progressnow_events_calendar_context', 10, 2 );
		add_filter( 'progressnow/context/single', 'progressnow_events_single_context', 10, 2 );
		add_filter( 'progressnow/context/single', 'progressnow_blog_single_context', 10, 2 );
		// Timber context/Twig wiring the shell views rely on (hooks reset per test).
		add_filter( 'timber/context', array( StarterSite::instance(), 'add_to_context' ) );
		add_filter( 'timber/twig', array( StarterSite::instance(), 'add_to_twig' ) );
		add_filter( 'timber/context', 'progressnow_i18n_context' );
		add_filter( 'timber/twig', 'progressnow_i18n_twig' );
		add_filter( 'timber/context', 'progressnow_shell_context', 20 );
		// Timber's own `function()` Twig helper is registered on a hook the
		// snapshot restore drops; the views call it for wp_head/wp_footer.
		add_filter(
			'timber/twig',
			static function ( $twig ) {
				$twig->addFunction(
					new \Twig\TwigFunction(
						'function',
						static function ( $name, ...$args ) {
							return is_callable( $name ) ? call_user_func_array( $name, $args ) : '';
						}
					)
				);

				return $twig;
			}
		);

		progressnow_events_register_post_type();

		$this->seam_ids = array();
		$this->settings = array();
		$this->supply_query_seam();

		add_filter(
			'progressnow/shell/setting',
			function ( $value, $name ) {
				return array_key_exists( $name, $this->settings ) ? $this->settings[ $name ] : $value;
			},
			10,
			2
		);

		delete_transient( PROGRESSNOW_SHELL_MANIFEST_TRANSIENT );
		delete_transient( PROGRESSNOW_SHELL_LOG_TRANSIENT );
		delete_option( 'chapter_build_state' );
		Timber\Timber::$context_cache = array(); // Timber caches context() per request.
		update_option( 'blogname', 'Progress Now' );
		kses_remove_filters();
		$this->static_dir = '';
	}

	public function tear_down() {
		if ( $this->static_dir && is_dir( $this->static_dir ) ) {
			$this->rrmdir( $this->static_dir );
		}
		parent::tear_down();
	}

	/* ---- helpers ---- */

	private function rrmdir( $dir ) {
		foreach ( scandir( $dir ) as $entry ) {
			if ( '.' === $entry || '..' === $entry ) {
				continue;
			}
			$path = $dir . DIRECTORY_SEPARATOR . $entry;
			is_dir( $path ) ? $this->rrmdir( $path ) : unlink( $path );
		}
		rmdir( $dir );
	}

	private function make( array $args ) {
		$id = wp_insert_post(
			wp_parse_args(
				$args,
				array(
					'post_status'  => 'publish',
					'post_content' => 'Body copy.',
				)
			)
		);
		$this->seam_ids[] = (int) $id;

		return (int) $id;
	}

	private function supply_query_seam() {
		remove_all_filters( 'posts_pre_query' );
		add_filter(
			'posts_pre_query',
			function ( $pre, $query ) {
				$types = (array) ( $query->get( 'post_type' ) ?: 'post' );
				$posts = array_values( array_filter( array_map( 'get_post', $this->seam_ids ) ) );
				$posts = array_filter(
					$posts,
					static function ( $p ) use ( $types ) {
						return in_array( $p->post_type, $types, true ) || in_array( 'any', $types, true );
					}
				);
				$name = (string) $query->get( 'name' );
				if ( '' !== $name ) {
					$posts = array_filter(
						$posts,
						static function ( $p ) use ( $name ) {
							return $p->post_name === $name;
						}
					);
				}
				$not_in = array_map( 'intval', (array) $query->get( 'post__not_in' ) );
				if ( $not_in ) {
					$posts = array_filter(
						$posts,
						static function ( $p ) use ( $not_in ) {
							return ! in_array( (int) $p->ID, $not_in, true );
						}
					);
				}
				$posts                = array_values( $posts );
				$query->found_posts   = count( $posts );
				$query->max_num_pages = $posts ? 1 : 0;
				$limit                = (int) $query->get( 'posts_per_page' );
				if ( $limit > 0 ) {
					$posts = array_slice( $posts, 0, $limit );
				}
				if ( 'ids' === $query->get( 'fields' ) ) {
					return array_map( static fn( $p ) => (int) $p->ID, $posts );
				}

				return $posts;
			},
			10,
			2
		);
	}

	private function manifest( array $overrides = array() ) {
		return array_merge(
			array(
				'buildId'           => 'build-1',
				'builtAt'           => '2026-01-01T00:00:00.000Z',
				'contentVersion'    => 7,
				'entry'             => '/_nuxt/entry.abc.js',
				'css'               => array( '/_nuxt/entry.abc.css' ),
				'modulepreload'     => array( '/_nuxt/entry.abc.js', '/_nuxt/chunk.def.js' ),
				'prefetch'          => array( '/_nuxt/route.ghi.js' ),
				'importmap'         => array( '#entry' => '/_nuxt/entry.abc.js' ),
				'prerenderedRoutes' => 15,
				'runtimeConfig'     => array(
					'public' => array( 'wpApiBase' => '/wp-json/progressnow/v1', 'themeStatic' => '/wp-content/themes/progressnow/static', 'mockApi' => false ),
					'app'    => array( 'baseURL' => '/', 'buildId' => 'build-1', 'buildAssetsDir' => '/_nuxt/', 'cdnURL' => '' ),
				),
			),
			$overrides
		);
	}

	/** A static dir with a manifest and a couple of assets; sets CHAPTER_STATIC_DIR. */
	private function static_dir( array $manifest_overrides = array(), $with_manifest = true ) {
		$dir = sys_get_temp_dir() . '/progressnow-static-' . uniqid();
		mkdir( $dir . '/_nuxt', 0777, true );
		mkdir( $dir . '/about', 0777, true );
		file_put_contents( $dir . '/_nuxt/entry.abc.js', 'export {};' );
		file_put_contents( $dir . '/_nuxt/entry.abc.css', 'body{}' );
		file_put_contents( $dir . '/about/_payload.json', '[{"data":1},{}]' );
		file_put_contents( $dir . '/_payload.json', '[{"data":1},{}]' );
		if ( $with_manifest ) {
			file_put_contents( $dir . '/shell-manifest.json', wp_json_encode( $this->manifest( $manifest_overrides ) ) );
		}
		$this->static_dir                  = $dir;
		$this->settings['CHAPTER_STATIC_DIR'] = $dir;

		return realpath( $dir );
	}

	/**
	 * Fake the main query (no go_to() in WorDBless): is_* flags, queried
	 * object, query vars, and the request path the shell reports.
	 *
	 * @param string       $path    Request path.
	 * @param array        $flags   is_* flags to set true.
	 * @param WP_Post|null $queried Queried object.
	 * @param array        $vars    Query vars.
	 */
	private function go( $path, array $flags = array(), $queried = null, array $vars = array() ) {
		$query = new WP_Query();
		foreach ( $flags as $flag ) {
			$query->$flag = true;
		}
		if ( $queried ) {
			$query->queried_object    = $queried;
			$query->queried_object_id = (int) $queried->ID;
		}
		foreach ( $vars as $key => $value ) {
			$query->set( $key, $value );
		}
		$GLOBALS['wp_query']     = $query;
		$GLOBALS['wp_the_query'] = $query;
		$_SERVER['REQUEST_URI']  = $path;

		return $query;
	}

	/* ---- mode + bypass ---- */

	public function test_mode_defaults_to_islands_and_nuxt_needs_the_flag() {
		$this->assertSame( 'islands', progressnow_shell_mode() );
		$this->assertFalse( progressnow_shell_is_nuxt() );

		$this->settings['CHAPTER_FRONTEND'] = 'NUXT';
		$this->assertSame( 'nuxt', progressnow_shell_mode() );
		$this->assertTrue( progressnow_shell_is_nuxt() );

		$this->settings['CHAPTER_FRONTEND'] = 'something-else';
		$this->assertSame( 'islands', progressnow_shell_mode() );
	}

	public function test_admin_bar_bypasses_the_app_and_marks_the_document() {
		$this->settings['CHAPTER_FRONTEND'] = 'nuxt';
		add_filter( 'show_admin_bar', '__return_true' );

		$this->assertFalse( progressnow_shell_is_nuxt() );
		$context = progressnow_shell_context( array() );
		$this->assertSame( ' data-frontend="php"', $context['html_data_attrs'] );
		$this->assertFalse( $context['shell_nuxt'] );
		$this->assertSame( '', $context['shell_data_json'] );

		remove_filter( 'show_admin_bar', '__return_true' );
		add_filter( 'show_admin_bar', '__return_false' );
		$context = progressnow_shell_context( array() );
		$this->assertSame( '', $context['html_data_attrs'] );
		$this->assertTrue( $context['shell_nuxt'] );
	}

	/* ---- islands exclusivity ---- */

	public function test_islands_bundle_is_not_enqueued_in_nuxt_mode() {
		$site = StarterSite::instance();
		add_filter( 'show_admin_bar', '__return_false' );

		$this->settings['CHAPTER_FRONTEND'] = 'nuxt';
		$site->theme_enqueue_scripts();
		$this->assertFalse( wp_script_is( 'main-app-script', 'enqueued' ) );

		ob_start();
		$site->preload_fonts();
		$preloads = ob_get_clean();
		$this->assertStringContainsString( '/static/fonts/bowlby-one/BowlbyOne-Regular.woff2', $preloads );
		$this->assertStringContainsString( '/static/fonts/public-sans/PublicSans', $preloads );
		$this->assertStringNotContainsString( 'manifold', $preloads );
		$this->assertStringContainsString( 'rel="preload"', $preloads );
	}

	/* ---- manifest ---- */

	public function test_manifest_is_read_from_the_static_dir_cached_and_observed() {
		$this->static_dir();
		$manifest = progressnow_shell_manifest();

		$this->assertSame( 'build-1', $manifest['buildId'] );
		$this->assertSame( 7, $manifest['contentVersion'] );
		$this->assertSame( array( '#entry' => '/_nuxt/entry.abc.js' ), $manifest['importmap'] );

		// New build recorded live (inc/rebuild.php) and the purge hook fired.
		$state = progressnow_rebuild_state();
		$this->assertSame( 'build-1', $state['liveBuildId'] );
		$this->assertSame( 7, $state['liveVersion'] );

		// Cached: deleting the file does not change the next read within the TTL.
		unlink( $this->static_dir . '/shell-manifest.json' );
		$this->assertSame( 'build-1', progressnow_shell_manifest()['buildId'] );
		$this->assertNull( progressnow_shell_manifest( true ) );
	}

	public function test_missing_or_invalid_manifest_degrades_quietly() {
		$this->static_dir( array(), false );
		$missing = 0;
		add_action( 'progressnow/shell/manifest_missing', function () use ( &$missing ) { ++$missing; } );

		$this->assertNull( progressnow_shell_manifest() );
		$this->assertSame( 1, $missing );
		// Negative result cached too — one fetch per minute.
		$this->assertNull( progressnow_shell_manifest() );
		$this->assertSame( 1, $missing );

		file_put_contents( $this->static_dir . '/shell-manifest.json', '{"entry":"/x.js"}' );
		$this->assertNull( progressnow_shell_manifest( true ) );
		$this->assertNull( progressnow_shell_validate_manifest( 'nope' ) );
		$this->assertNull( progressnow_shell_validate_manifest( $this->manifest( array( 'runtimeConfig' => array() ) ) ) );
	}

	public function test_manifest_is_fetched_over_http_without_a_static_dir() {
		$this->settings['CHAPTER_STATIC_ORIGIN'] = 'https://static.example';
		$requested = '';
		add_filter(
			'pre_http_request',
			function ( $pre, $args, $url ) use ( &$requested ) {
				$requested = $url;

				return array(
					'response' => array( 'code' => 200, 'message' => 'OK' ),
					'headers'  => array(),
					'body'     => wp_json_encode( $this->manifest( array( 'buildId' => 'build-http' ) ) ),
				);
			},
			10,
			3
		);

		$manifest = progressnow_shell_manifest();
		$this->assertSame( 'https://static.example/shell-manifest.json', $requested );
		$this->assertSame( 'build-http', $manifest['buildId'] );
	}

	public function test_new_build_detection_is_idempotent() {
		$purged = 0;
		$seen   = array();
		add_action( 'progressnow/shell/purge', function () use ( &$purged ) { ++$purged; } );
		add_action( 'progressnow/shell/new_build', function ( $m ) use ( &$seen ) { $seen[] = $m['buildId']; } );

		$this->assertTrue( progressnow_shell_observe_build( $this->manifest() ) );
		$this->assertFalse( progressnow_shell_observe_build( $this->manifest() ) );
		$this->assertTrue( progressnow_shell_observe_build( $this->manifest( array( 'buildId' => 'build-2', 'contentVersion' => 8 ) ) ) );

		$this->assertSame( 2, $purged );
		$this->assertSame( array( 'build-1', 'build-2' ), $seen );
		$this->assertSame( 'build-2', progressnow_rebuild_state()['liveBuildId'] );
	}

	/* ---- app tags ---- */

	public function test_tags_follow_the_manifest_in_nuxt_order() {
		$html  = progressnow_shell_render_tags( $this->manifest() );
		$lines = array_values( array_filter( explode( "\n", $html ) ) );

		$this->assertStringStartsWith( '<script type="importmap">{"imports":{"#entry":"/_nuxt/entry.abc.js"}}</script>', $lines[0] );
		$this->assertSame( '<link rel="stylesheet" href="/_nuxt/entry.abc.css" crossorigin>', $lines[1] );
		$this->assertSame( '<link rel="modulepreload" as="script" crossorigin href="/_nuxt/entry.abc.js">', $lines[2] );
		$this->assertSame( '<link rel="modulepreload" as="script" crossorigin href="/_nuxt/chunk.def.js">', $lines[3] );
		$this->assertStringStartsWith( '<script>window.__NUXT__={};window.__NUXT__.config={"public":{"wpApiBase":"/wp-json/progressnow/v1"', $lines[4] );
		$this->assertStringContainsString( '"app":{"baseURL":"/","buildId":"build-1"', $lines[4] );
		$this->assertSame( '<script type="module" src="/_nuxt/entry.abc.js" crossorigin></script>', $lines[5] );
		$this->assertSame( '<link rel="prefetch" as="script" crossorigin href="/_nuxt/route.ghi.js">', $lines[6] );
		$this->assertStringNotContainsString( '__NUXT_DATA__', $html );
	}

	public function test_wp_head_emits_tags_only_for_nuxt_shells_with_a_build() {
		add_filter( 'show_admin_bar', '__return_false' );
		$this->static_dir();

		ob_start();
		progressnow_shell_head();
		$this->assertSame( '', ob_get_clean(), 'islands mode: no app tags' );

		$this->settings['CHAPTER_FRONTEND'] = 'nuxt';
		ob_start();
		progressnow_shell_head();
		$out = ob_get_clean();
		$this->assertStringContainsString( '<script type="module" src="/_nuxt/entry.abc.js"', $out );

		unlink( $this->static_dir . '/shell-manifest.json' );
		delete_transient( PROGRESSNOW_SHELL_MANIFEST_TRANSIENT );
		ob_start();
		progressnow_shell_head();
		$this->assertSame( '', ob_get_clean(), 'degraded mode: content renders, no app tags' );
	}

	/* ---- __SHELL_DATA__ ---- */

	public function test_shell_data_for_a_post_equals_the_rest_builders() {
		add_filter( 'show_admin_bar', '__return_false' );
		$this->settings['CHAPTER_FRONTEND'] = 'nuxt';
		$post_id = $this->make( array( 'post_title' => 'Shell Post', 'post_name' => 'shell-post', 'post_content' => '<p>Body</p>' ) );
		$this->make( array( 'post_title' => 'Other', 'post_name' => 'other' ) );

		$this->go( '/blog/shell-post/', array( 'is_singular', 'is_single' ), get_post( $post_id ) );
		$data = progressnow_shell_data( $this->manifest() );

		$this->assertSame( 'post', $data['routeKind'] );
		$this->assertSame( '/blog/shell-post/', $data['path'] );
		$this->assertSame( 'build-1', $data['buildId'] );
		$this->assertSame( progressnow_content_version(), $data['contentVersion'] );
		$this->assertSame( array( 'site:', 'post::shell-post' ), array_keys( $data['data'] ) );
		$this->assertEquals( progressnow_payload_site( '' ), $data['data']['site:'] );
		$this->assertEquals( progressnow_payload_post( 'shell-post', '' ), $data['data']['post::shell-post'] );
		$this->assertSame( 'Shell Post', $data['data']['post::shell-post']['title'] );
	}

	public function test_shell_data_for_pages_and_the_front_page() {
		add_filter( 'show_admin_bar', '__return_false' );
		$this->settings['CHAPTER_FRONTEND'] = 'nuxt';
		$front = $this->make( array( 'post_type' => 'page', 'post_title' => 'Home', 'post_name' => 'home' ) );
		$about = $this->make( array( 'post_type' => 'page', 'post_title' => 'About', 'post_name' => 'about' ) );
		update_post_meta( $about, '_wp_page_template', 'page-templates/about.php' );
		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', $front );

		$this->go( '/about', array( 'is_singular', 'is_page' ), get_post( $about ) );
		$data = progressnow_shell_data( $this->manifest() );
		$this->assertSame( 'about', $data['routeKind'] );
		$this->assertSame( '/about/', $data['path'] );
		$this->assertArrayHasKey( 'page::about', $data['data'] );
		$this->assertSame( 'about', $data['data']['page::about']['kind'] );
		$this->assertEquals( progressnow_payload_page( 'about', '' ), $data['data']['page::about'] );

		$this->go( '/', array( 'is_singular', 'is_page' ), get_post( $front ) );
		$data = progressnow_shell_data( $this->manifest() );
		$this->assertSame( 'front', $data['routeKind'] );
		$this->assertSame( '/', $data['path'] );
		$this->assertArrayHasKey( 'front:', $data['data'] );
		$this->assertEquals( progressnow_payload_front( '' ), $data['data']['front:'] );
	}

	public function test_shell_data_for_the_posts_index_and_search() {
		add_filter( 'show_admin_bar', '__return_false' );
		$this->settings['CHAPTER_FRONTEND'] = 'nuxt';
		$front = $this->make( array( 'post_type' => 'page', 'post_title' => 'Home', 'post_name' => 'home' ) );
		$blog  = $this->make( array( 'post_type' => 'page', 'post_title' => 'Blog', 'post_name' => 'blog' ) );
		$this->make( array( 'post_title' => 'A post', 'post_name' => 'a-post' ) );
		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', $front );
		update_option( 'page_for_posts', $blog );

		$this->go( '/blog/', array( 'is_home' ), get_post( $blog ) );
		$data = progressnow_shell_data( $this->manifest() );
		$this->assertSame( 'posts_index', $data['routeKind'] );
		$this->assertArrayHasKey( 'page::blog', $data['data'] );
		$this->assertArrayHasKey( 'posts:', $data['data'] );
		$this->assertEquals( progressnow_payload_posts( '', 1, 24 ), $data['data']['posts:'] );
		$this->assertSame( 'A post', $data['data']['posts:']['posts'][0]['title'] );

		$this->go( '/?s=fridge', array( 'is_search' ), null, array( 's' => 'fridge' ) );
		$data = progressnow_shell_data( $this->manifest() );
		$this->assertSame( 'search', $data['routeKind'] );
		$this->assertSame( '/', $data['path'] );
		$this->assertSame( array( 'site:' ), array_keys( $data['data'] ) );
	}

	public function test_shell_data_json_is_html_safe() {
		$json = progressnow_shell_data_json(
			array(
				'lang' => '',
				'data' => array( 'x' => array( 'html' => '</script><script>alert(1)</script> & <b>' ) ),
			)
		);

		$this->assertStringNotContainsString( '</script>', $json );
		$this->assertStringNotContainsString( '<', $json );
		$this->assertStringNotContainsString( '&', $json );
		// The closing tag survives only as its JSON unicode escape.
		$this->assertStringContainsString( chr( 92 ) . 'u003C/script' . chr( 92 ) . 'u003E', $json );
		$this->assertSame( '</script><script>alert(1)</script> & <b>', json_decode( $json, true )['data']['x']['html'] );
	}

	public function test_posts_key_grammar_matches_the_app() {
		$this->assertSame( 'posts:en', progressnow_payload_posts_key( 'en', 1, '' ) );
		$this->assertSame( 'posts:en:2:', progressnow_payload_posts_key( 'en', 2, '' ) );
		$this->assertSame( 'posts:en:1:labor', progressnow_payload_posts_key( 'en', 1, 'labor' ) );
		$this->assertSame( 'posts:es', progressnow_payload_key( 'posts', 'es' ) );
	}

	/* ---- passthrough ---- */

	public function test_passthrough_resolves_static_paths_with_mime_and_cache_headers() {
		$dir = $this->static_dir();

		$js = progressnow_shell_passthrough_resolve( '/_nuxt/entry.abc.js', $dir );
		$this->assertSame( 200, $js['status'] );
		$this->assertSame( 'text/javascript; charset=utf-8', $js['mime'] );
		$this->assertSame( 'public, max-age=31536000, immutable', $js['cache'] );
		$this->assertSame( realpath( $dir . '/_nuxt/entry.abc.js' ), $js['file'] );

		$payload = progressnow_shell_passthrough_resolve( '/about/_payload.json?_b=build-1', $dir );
		$this->assertSame( 200, $payload['status'] );
		$this->assertSame( 'application/json; charset=utf-8', $payload['mime'] );
		$this->assertSame( 'public, max-age=60', $payload['cache'] );

		$this->assertSame( 200, progressnow_shell_passthrough_resolve( '/_payload.json', $dir )['status'] );
		$this->assertSame( 200, progressnow_shell_passthrough_resolve( '/shell-manifest.json', $dir )['status'] );
		$this->assertSame( 'text/css; charset=utf-8', progressnow_shell_passthrough_resolve( '/_nuxt/entry.abc.css', $dir )['mime'] );
	}

	public function test_passthrough_ignores_non_static_paths_and_404s_missing_files() {
		$dir = $this->static_dir();

		$this->assertNull( progressnow_shell_passthrough_resolve( '/about/', $dir ) );
		$this->assertNull( progressnow_shell_passthrough_resolve( '/wp-json/progressnow/v1/site', $dir ) );
		$this->assertNull( progressnow_shell_passthrough_resolve( '/blog/payload.json', $dir ) );
		$this->assertSame( 404, progressnow_shell_passthrough_resolve( '/_nuxt/nope.js', $dir )['status'] );
		$this->assertSame( 404, progressnow_shell_passthrough_resolve( '/calendar/_payload.json', $dir )['status'] );
	}

	public function test_passthrough_rejects_traversal() {
		$dir = $this->static_dir();
		file_put_contents( dirname( $dir ) . '/progressnow-outside.txt', 'secret' );

		$this->assertSame( 404, progressnow_shell_passthrough_resolve( '/_nuxt/../progressnow-outside.txt', $dir )['status'] );
		$this->assertSame( 404, progressnow_shell_passthrough_resolve( '/_nuxt/%2e%2e/progressnow-outside.txt', $dir )['status'] );
		$this->assertSame( 404, progressnow_shell_passthrough_resolve( "/_nuxt/entry.abc.js\0.txt", $dir )['status'] );

		unlink( dirname( $dir ) . '/progressnow-outside.txt' );
	}

	public function test_passthrough_is_inert_without_a_static_dir() {
		$this->assertSame( '', progressnow_shell_static_dir() );
		$this->settings['CHAPTER_STATIC_DIR'] = '/definitely/not/here';
		$this->assertSame( '', progressnow_shell_static_dir() );
	}

	/* ---- rendered shell ---- */

	public function test_base_template_renders_the_nuxt_root_with_payload_and_chrome() {
		add_filter( 'show_admin_bar', '__return_false' );
		$this->settings['CHAPTER_FRONTEND'] = 'nuxt';
		$this->static_dir();
		$post_id = $this->make( array( 'post_title' => 'Shell Post', 'post_name' => 'shell-post', 'post_content' => '<p>Body</p>' ) );
		$this->go( '/blog/shell-post/', array( 'is_singular', 'is_single' ), get_post( $post_id ) );

		$context = Timber\Timber::context();
		$this->assertTrue( $context['shell_nuxt'] );
		$this->assertStringContainsString( '"routeKind":"post"', $context['shell_data_json'] );

		$html = Timber\Timber::compile( 'single.twig', array_merge( $context, array( 'post' => Timber\Timber::get_post( $post_id ) ) ) );

		$this->assertStringContainsString( '<div id="__nuxt">', $html );
		$this->assertStringContainsString( '<script type="application/json" id="__SHELL_DATA__">', $html );
		$this->assertStringContainsString( 'class="site-header', $html );
		$this->assertStringContainsString( 'class="site-footer', $html );
		$this->assertStringContainsString( '<main id="main"', $html );
		$this->assertStringNotContainsString( 'data-vue-island="SiteHeader"', $html );
		// Head tags come from wp_head; the shell's document data attribute is absent for real shells.
		$this->assertStringNotContainsString( 'data-frontend="php"', $html );
	}

	public function test_base_template_keeps_islands_in_islands_mode() {
		add_filter( 'show_admin_bar', '__return_false' );
		$post_id = $this->make( array( 'post_title' => 'Island Post', 'post_name' => 'island-post' ) );
		$this->go( '/blog/island-post/', array( 'is_singular', 'is_single' ), get_post( $post_id ) );

		$context = Timber\Timber::context();
		$this->assertFalse( $context['shell_nuxt'] );
		$html = Timber\Timber::compile( 'single.twig', array_merge( $context, array( 'post' => Timber\Timber::get_post( $post_id ) ) ) );

		$this->assertStringContainsString( 'data-vue-island="SiteHeader"', $html );
		$this->assertStringNotContainsString( '__SHELL_DATA__', $html );
		$this->assertStringNotContainsString( 'id="__nuxt"', $html );
	}
}
