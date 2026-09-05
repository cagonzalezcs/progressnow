<?php
/**
 * Contract governance (dual-sided fixture tests): deterministic seeded
 * content → serializer + REST output must equal the committed
 * tests/fixtures/*.json byte-for-byte (volatile keys — IDs, permalinks,
 * avatar URLs — are normalized). vitest parses the same files with the zod
 * schemas (src/lib/__tests__/contracts.spec.ts); a contract change fails
 * one side until both layers agree.
 *
 * Regenerate fixtures intentionally with:
 *   PROGRESSNOW_WRITE_FIXTURES=1 vendor/bin/phpunit --filter TestContracts
 */

use WorDBless\BaseTestCase;

class TestContracts extends BaseTestCase {

	private $fixture_dir;

	public function set_up() {
		switch_theme( basename( dirname( __DIR__ ) ) );

		// Plain require: WorDBless restores hooks to a pre-theme snapshot
		// after every test, so hooks must re-register per test.
		require dirname( __DIR__ ) . '/functions.php';

		do_action( 'after_setup_theme' );

		parent::set_up();

		add_action( 'rest_api_init', 'progressnow_rest_register_routes' );
		$GLOBALS['wp_rest_server'] = null;

		kses_remove_filters();

		$this->fixture_dir = dirname( __DIR__ ) . '/tests/fixtures';
		if ( ! is_dir( $this->fixture_dir ) ) {
			mkdir( $this->fixture_dir, 0755, true );
		}
	}

	public function tear_down() {
		parent::tear_down();
	}

	/* ---------------------------------------------------------------------
	 * Helpers.
	 * ------------------------------------------------------------------ */

	/**
	 * Compare $actual to the committed fixture. Volatile keys (per-run IDs
	 * and URLs) are overwritten in the EXPECTED tree with the actual values
	 * before comparison, so the fixture pins every stable byte. With
	 * PROGRESSNOW_WRITE_FIXTURES=1 the fixture is (re)written instead.
	 */
	private function assert_matches_fixture( $name, array $actual, array $volatile_paths = array() ) {
		$file = $this->fixture_dir . '/' . $name . '.json';

		if ( getenv( 'PROGRESSNOW_WRITE_FIXTURES' ) ) {
			file_put_contents(
				$file,
				json_encode( $actual, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . "\n"
			);
			$this->assertFileExists( $file );
			return;
		}

		$this->assertFileExists( $file, "Missing fixture {$name}.json — generate with PROGRESSNOW_WRITE_FIXTURES=1" );
		$expected = json_decode( (string) file_get_contents( $file ), true );
		$this->assertIsArray( $expected );

		foreach ( $volatile_paths as $path ) {
			$value = $this->array_get( $actual, $path );
			if ( null !== $value || null === $this->array_get( $expected, $path ) ) {
				$expected = $this->array_set( $expected, $path, $value );
			}
		}

		$this->assertSame( $expected, $actual, "Serializer output drifted from fixtures/{$name}.json" );
	}

	/**
	 * Fixture comparison for the route payloads, whose volatile values are
	 * scattered (ids, ?p= permalinks, timestamps): both trees are normalized —
	 * every `id`/`ID` → 0, every `?p=`/`page_id=` → 0, `generatedAt` → '' —
	 * before the byte comparison.
	 */
	private function assert_matches_fixture_normalized( $name, array $actual ) {
		$file   = $this->fixture_dir . '/' . $name . '.json';
		$actual = $this->normalize_volatile( $actual );

		if ( getenv( 'PROGRESSNOW_WRITE_FIXTURES' ) ) {
			file_put_contents(
				$file,
				json_encode( $actual, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . "\n"
			);
			$this->assertFileExists( $file );
			return;
		}

		$this->assertFileExists( $file, "Missing fixture {$name}.json — generate with PROGRESSNOW_WRITE_FIXTURES=1" );
		$expected = json_decode( (string) file_get_contents( $file ), true );
		$this->assertIsArray( $expected );
		$this->assertSame( $this->normalize_volatile( $expected ), $actual, "Payload drifted from fixtures/{$name}.json" );
	}

	private function normalize_volatile( $value, $key = null ) {
		if ( is_array( $value ) ) {
			$out = array();
			foreach ( $value as $k => $v ) {
				$out[ $k ] = $this->normalize_volatile( $v, $k );
			}
			return $out;
		}
		if ( in_array( $key, array( 'id', 'ID' ), true ) && is_int( $value ) ) {
			return 0;
		}
		if ( 'generatedAt' === $key ) {
			return '';
		}
		if ( is_string( $value ) ) {
			return preg_replace( '/([?&](?:p|page_id|post_type=event&p)=)\d+/', '${1}0', $value );
		}
		return $value;
	}

	/** Serve pages/events too (the route payloads query every post type). */
	private function supply_all( array $ids ) {
		add_filter(
			'posts_pre_query',
			function ( $pre, $query ) use ( $ids ) {
				$types = (array) ( $query->get( 'post_type' ) ?: 'post' );
				$posts = array_values( array_filter( array_map( 'get_post', $ids ) ) );
				$posts = array_filter(
					$posts,
					static function ( $p ) use ( $types ) {
						return in_array( $p->post_type, $types, true );
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
				$posts                = $limit > 0 ? array_slice( $posts, 0, $limit ) : $posts;

				if ( 'ids' === $query->get( 'fields' ) ) {
					return array_map( static function ( $p ) { return (int) $p->ID; }, $posts );
				}

				return $posts;
			},
			10,
			2
		);
	}

	private function seed_site() {
		// Register the CPT so event permalinks are deterministic (?event=slug)
		// regardless of which test ran `init` first.
		progressnow_events_register_post_type();

		$front = wp_insert_post( array( 'post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'Home', 'post_name' => 'home', 'post_date' => '2026-06-01 12:00:00' ) );
		$blog  = wp_insert_post( array( 'post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'Blog', 'post_name' => 'blog', 'post_date' => '2026-06-01 12:00:00' ) );
		$about = wp_insert_post( array( 'post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'About the Chapter', 'post_name' => 'about', 'post_date' => '2026-06-01 12:00:00', 'post_content' => '<p>About body.</p>' ) );
		$gi    = wp_insert_post( array( 'post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'Get involved', 'post_name' => 'get-involved', 'post_date' => '2026-06-01 12:00:00' ) );
		$cal   = wp_insert_post( array( 'post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'Event Calendar', 'post_name' => 'calendar', 'post_date' => '2026-06-01 12:00:00' ) );
		update_post_meta( $about, '_wp_page_template', 'page-templates/about.php' );
		update_post_meta( $gi, '_wp_page_template', 'page-templates/get-involved.php' );
		update_post_meta( $cal, '_wp_page_template', 'page-templates/calendar.php' );
		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', $front );
		update_option( 'page_for_posts', $blog );
		update_option( 'blogname', 'Progress Now' );
		update_option( 'blogdescription', 'Organizing our community.' );

		$post  = $this->seed_post();
		$event = wp_insert_post( array( 'post_type' => 'event', 'post_status' => 'publish', 'post_title' => 'Contract Test Event', 'post_name' => 'contract-test-event', 'post_content' => 'March at dawn.', 'post_date' => '2026-06-01 12:00:00' ) );
		update_post_meta( $event, 'start_datetime', '2030-07-04 18:00:00' );
		update_post_meta( $event, 'end_datetime', '2030-07-04 20:00:00' );
		update_post_meta( $event, 'venue', 'Union Hall' );
		update_post_meta( $event, 'city', 'Downtown' );

		$this->supply_all( array( $front, $blog, $about, $gi, $cal, $post, $event ) );
		add_filter( 'progressnow/context/front_page', 'progressnow_options_front_page_context', 5, 2 );
		add_filter( 'progressnow/context/front_page', 'progressnow_events_front_page_context' );
		add_filter( 'progressnow/context/front_page', 'progressnow_blog_front_page_context' );
		add_filter( 'progressnow/context/page', 'progressnow_interior_page_context', 10, 2 );
		add_filter( 'progressnow/context/page', 'progressnow_pages_page_context', 10, 2 );
		add_filter( 'progressnow/context/page', 'progressnow_events_calendar_context', 10, 2 );
		add_filter( 'progressnow/context/single', 'progressnow_events_single_context', 10, 2 );

		return compact( 'front', 'blog', 'about', 'gi', 'cal', 'post', 'event' );
	}

	private function array_get( array $tree, array $path ) {
		foreach ( $path as $key ) {
			if ( ! is_array( $tree ) || ! array_key_exists( $key, $tree ) ) {
				return null;
			}
			$tree = $tree[ $key ];
		}
		return $tree;
	}

	private function array_set( array $tree, array $path, $value ) {
		$ref =& $tree;
		foreach ( array_slice( $path, 0, -1 ) as $key ) {
			if ( ! isset( $ref[ $key ] ) || ! is_array( $ref[ $key ] ) ) {
				$ref[ $key ] = array();
			}
			$ref =& $ref[ $key ];
		}
		$ref[ $path[ count( $path ) - 1 ] ] = $value;
		return $tree;
	}

	private function seed_post() {
		return wp_insert_post(
			array(
				'post_type'    => 'post',
				'post_status'  => 'publish',
				'post_title'   => 'Contract Test Post',
				'post_name'    => 'contract-test-post',
				'post_date'    => '2026-06-01 12:00:00',
				'post_excerpt' => 'A deterministic excerpt.',
				'post_content' => "<!-- wp:paragraph -->\n<p>Deterministic body prose for the contract test.</p>\n<!-- /wp:paragraph -->\n\n"
					. "<!-- wp:pullquote -->\n<figure class=\"wp-block-pullquote\"><blockquote><p>Fixed quote.</p><cite>Fixture</cite></blockquote></figure>\n<!-- /wp:pullquote -->",
			)
		);
	}

	/** Serve the seeded posts through the WorDBless posts_pre_query seam. */
	private function supply_posts( array $ids ) {
		add_filter(
			'posts_pre_query',
			function ( $pre, $query ) use ( $ids ) {
				if ( 'post' !== $query->get( 'post_type' ) ) {
					return $pre;
				}
				$posts = array_values( array_filter( array_map( 'get_post', $ids ) ) );

				$name = (string) $query->get( 'name' );
				if ( '' !== $name ) {
					$posts = array_values(
						array_filter(
							$posts,
							static function ( $p ) use ( $name ) {
								return $p->post_name === $name;
							}
						)
					);
				}
				$not_in = array_map( 'intval', (array) $query->get( 'post__not_in' ) );
				if ( $not_in ) {
					$posts = array_values(
						array_filter(
							$posts,
							static function ( $p ) use ( $not_in ) {
								return ! in_array( (int) $p->ID, $not_in, true );
							}
						)
					);
				}

				$query->found_posts   = count( $posts );
				$query->max_num_pages = $posts ? 1 : 0;

				return $posts;
			},
			10,
			2
		);
	}

	/* ---------------------------------------------------------------------
	 * Fixture assertions.
	 * ------------------------------------------------------------------ */

	public function test_blog_post_matches_fixture() {
		$id = $this->seed_post();

		$this->assert_matches_fixture(
			'blog-post',
			progressnow_post_to_blog_post( $id ),
			array( array( 'id' ), array( 'url' ) )
		);
	}

	public function test_single_post_matches_fixture() {
		$id = $this->seed_post();
		$this->supply_posts( array( $id ) );

		$request = new WP_REST_Request( 'GET', '/progressnow/v1/posts/contract-test-post' );
		$data    = rest_do_request( $request )->get_data();

		$this->assert_matches_fixture(
			'single-post',
			$data,
			array( array( 'authorAvatar' ), array( 'seo', 'canonical' ) )
		);
	}

	public function test_posts_envelope_matches_fixture() {
		$id = $this->seed_post();
		$this->supply_posts( array( $id ) );

		$data = rest_do_request( new WP_REST_Request( 'GET', '/progressnow/v1/posts' ) )->get_data();

		$this->assert_matches_fixture(
			'posts-envelope',
			$data,
			array( array( 'posts', 0, 'id' ), array( 'posts', 0, 'url' ) )
		);
	}

	public function test_chapter_event_matches_fixture() {
		$id = wp_insert_post(
			array(
				'post_type'    => 'event',
				'post_status'  => 'publish',
				'post_title'   => 'Contract Test Event',
				'post_name'    => 'contract-test-event',
				'post_content' => 'March at dawn.',
			)
		);
		update_post_meta( $id, 'start_datetime', '2026-07-04 18:00:00' );
		update_post_meta( $id, 'end_datetime', '2026-07-04 20:00:00' );
		update_post_meta( $id, 'venue', 'Union Hall' );
		update_post_meta( $id, 'city', 'Downtown' );

		$this->assert_matches_fixture(
			'chapter-event',
			progressnow_event_to_chapter_event( $id ),
			array( array( 'id' ), array( 'url' ) )
		);
	}

	public function test_categories_envelope_matches_fixture() {
		$data = rest_do_request( new WP_REST_Request( 'GET', '/progressnow/v1/categories' ) )->get_data();

		$this->assert_matches_fixture( 'categories', $data );
	}

	/* ---- route payloads (php-shell-handoff / nuxt-static-site) ---- */

	public function test_site_payload_matches_fixture() {
		$this->seed_site();

		$data = rest_do_request( new WP_REST_Request( 'GET', '/progressnow/v1/site' ) )->get_data();

		$this->assert_matches_fixture_normalized( 'site', $data );
	}

	public function test_routes_manifest_matches_fixture() {
		$this->seed_site();

		$data = rest_do_request( new WP_REST_Request( 'GET', '/progressnow/v1/routes' ) )->get_data();

		$this->assert_matches_fixture_normalized( 'routes-manifest', $data );
	}

	public function test_front_page_payload_matches_fixture() {
		$this->seed_site();

		$data = rest_do_request( new WP_REST_Request( 'GET', '/progressnow/v1/front-page' ) )->get_data();

		$this->assert_matches_fixture_normalized( 'front-page', $data );
	}

	public function test_page_payloads_match_fixtures() {
		$this->seed_site();

		foreach ( array( 'about' => 'page-about', 'get-involved' => 'page-get-involved', 'calendar' => 'page-calendar' ) as $path => $fixture ) {
			$data = rest_do_request( new WP_REST_Request( 'GET', '/progressnow/v1/pages/' . $path ) )->get_data();
			$this->assert_matches_fixture_normalized( $fixture, $data );
		}
	}

	public function test_single_event_payload_matches_fixture() {
		$this->seed_site();

		$data = rest_do_request( new WP_REST_Request( 'GET', '/progressnow/v1/events/contract-test-event' ) )->get_data();

		$this->assert_matches_fixture_normalized( 'single-event', $data );
	}
}
