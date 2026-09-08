<?php
/**
 * REST API (inc/rest.php): progressnow/v1 routes exercised through
 * rest_do_request() — pagination math, arg validation, search, 404 shape,
 * ETag/304, and publish-only visibility.
 */

use WorDBless\BaseTestCase;

class TestRest extends BaseTestCase {

	public function set_up() {
		switch_theme( basename( dirname( __DIR__ ) ) );

		// Plain require: WorDBless restores hooks to a pre-theme snapshot
		// after every test, so hooks must re-register per test.
		require dirname( __DIR__ ) . '/functions.php';

		do_action( 'after_setup_theme' );

		parent::set_up();

		// parent::set_up() restores the pre-theme hook snapshot, so the REST
		// hooks must re-attach afterwards; fresh server per test so
		// rest_api_init re-registers our routes.
		add_action( 'rest_api_init', 'progressnow_rest_register_routes' );
		add_filter( 'rest_post_dispatch', 'progressnow_rest_cache_headers', 10, 3 );
		$GLOBALS['wp_rest_server'] = null;
	}

	public function tear_down() {
		parent::tear_down();
	}

	/** IDs registered with the query seam, in insert order. */
	private $seam_ids = array();

	private function make_post( $title, $args = array() ) {
		$id = wp_insert_post(
			wp_parse_args(
				$args,
				array(
					'post_type'    => 'post',
					'post_status'  => 'publish',
					'post_title'   => $title,
					'post_content' => 'Body of ' . $title,
				)
			)
		);

		$this->seam_ids[] = (int) $id;
		$this->supply_query_seam();

		return $id;
	}

	/**
	 * WorDBless WP_Query SQL returns nothing, so post queries are served
	 * through the `posts_pre_query` seam (same approach as the front-page
	 * and performance suites), honoring status/search/name/exclusion args
	 * and setting found_posts/max_num_pages per the filter contract.
	 */
	private function supply_query_seam() {
		remove_all_filters( 'posts_pre_query' );
		add_filter(
			'posts_pre_query',
			function ( $pre, $query ) {
				if ( 'post' !== $query->get( 'post_type' ) ) {
					return $pre;
				}

				$posts = array_values( array_filter( array_map( 'get_post', $this->seam_ids ) ) );

				$status = $query->get( 'post_status' ) ?: 'publish';
				$posts  = array_filter(
					$posts,
					static function ( $p ) use ( $status ) {
						return 'any' === $status || $p->post_status === $status;
					}
				);

				$search = (string) $query->get( 's' );
				if ( '' !== $search ) {
					$posts = array_filter(
						$posts,
						static function ( $p ) use ( $search ) {
							return false !== stripos( $p->post_title . ' ' . $p->post_content, $search );
						}
					);
				}

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

				$posts = array_values( $posts );
				$per   = (int) $query->get( 'posts_per_page' ) ?: 24;
				$paged = max( 1, (int) $query->get( 'paged' ) );

				$query->found_posts   = count( $posts );
				$query->max_num_pages = $per > 0 ? (int) ceil( count( $posts ) / $per ) : 1;

				return array_slice( $posts, ( $paged - 1 ) * $per, $per );
			},
			10,
			2
		);
	}

	private function get_json( $path, $params = array(), $headers = array() ) {
		$request = new WP_REST_Request( 'GET', $path );
		foreach ( $params as $key => $value ) {
			$request->set_param( $key, $value );
		}
		foreach ( $headers as $key => $value ) {
			$request->set_header( $key, $value );
		}

		// rest_do_request() stops at dispatch(); production requests go
		// through serve_request(), which applies rest_post_dispatch (where
		// the cache/ETag headers attach) — mirror that here.
		return apply_filters( 'rest_post_dispatch', rest_do_request( $request ), rest_get_server(), $request );
	}

	/** 30 posts → total 30 / 2 pages of 24; page 2 has the remaining 6. */
	public function test_posts_pagination_math() {
		for ( $i = 1; $i <= 30; $i++ ) {
			$this->make_post( "Post {$i}" );
		}

		$page1 = $this->get_json( '/progressnow/v1/posts' );
		$data1 = $page1->get_data();
		$this->assertSame( 200, $page1->get_status() );
		$this->assertCount( 24, $data1['posts'] );
		$this->assertSame( 30, $data1['total'] );
		$this->assertSame( 2, $data1['totalPages'] );
		$this->assertSame( 1, $data1['page'] );
		$this->assertSame( 24, $data1['perPage'] );

		$page2 = $this->get_json( '/progressnow/v1/posts', array( 'page' => 2 ) );
		$this->assertCount( 6, $page2->get_data()['posts'] );
	}

	/** Non-canonical category slugs are rejected by the core arg schema. */
	public function test_invalid_category_is_400() {
		$response = $this->get_json( '/progressnow/v1/posts', array( 'category' => 'not-a-category' ) );

		$this->assertSame( 400, $response->get_status() );
		$this->assertSame( 'rest_invalid_param', $response->get_data()['code'] );
	}

	/** Search matches body text and reports honest totals. */
	public function test_posts_search() {
		$this->make_post( 'Hit', array( 'post_content' => 'A xylophonic organizing drive.' ) );
		$this->make_post( 'Miss', array( 'post_content' => 'Nothing to see.' ) );

		$data = $this->get_json( '/progressnow/v1/posts', array( 's' => 'xylophonic' ) )->get_data();

		$this->assertSame( 1, $data['total'] );
		$this->assertSame( 'Hit', $data['posts'][0]['title'] );
	}

	/** Unknown slug → standard WP error envelope with our named code. */
	public function test_single_post_404() {
		$response = $this->get_json( '/progressnow/v1/posts/no-such-post' );

		$this->assertSame( 404, $response->get_status() );
		$this->assertSame( 'progressnow_post_not_found', $response->get_data()['code'] );
	}

	/** /posts/{slug} returns SinglePostData + the readNext pool. */
	public function test_single_post_payload() {
		$this->make_post( 'Target', array( 'post_name' => 'target-post' ) );
		$this->make_post( 'Neighbor' );

		$data = $this->get_json( '/progressnow/v1/posts/target-post' )->get_data();

		$this->assertSame( 'Target', $data['title'] );
		$this->assertArrayHasKey( 'blocks', $data );
		$this->assertCount( 1, $data['readNext'] );
		$this->assertSame( 'Neighbor', $data['readNext'][0]['title'] );
	}

	/** Anonymous responses carry Cache-Control + ETag; If-None-Match → 304. */
	public function test_etag_304() {
		$this->make_post( 'Cached' );

		$first   = $this->get_json( '/progressnow/v1/posts' );
		$headers = $first->get_headers();
		$this->assertSame( 'public, max-age=300, stale-while-revalidate=3600', $headers['Cache-Control'] );
		$this->assertNotEmpty( $headers['ETag'] );

		$second = $this->get_json( '/progressnow/v1/posts', array(), array( 'If-None-Match' => $headers['ETag'] ) );
		$this->assertSame( 304, $second->get_status() );
		$this->assertNull( $second->get_data() );
	}

	/** Drafts are invisible on the list and by slug. */
	public function test_publish_only() {
		$this->make_post( 'Public' );
		$this->make_post( 'Secret', array(
			'post_status' => 'draft',
			'post_name'   => 'secret-draft',
		) );

		$list = $this->get_json( '/progressnow/v1/posts' )->get_data();
		$this->assertSame( 1, $list['total'] );
		$this->assertSame( 'Public', $list['posts'][0]['title'] );

		$single = $this->get_json( '/progressnow/v1/posts/secret-draft' );
		$this->assertSame( 404, $single->get_status() );
	}

	/** /events and /categories respond with their envelopes. */
	public function test_events_and_categories_envelopes() {
		$events = $this->get_json( '/progressnow/v1/events' )->get_data();
		$this->assertArrayHasKey( 'events', $events );
		$this->assertArrayHasKey( 'categories', $events );

		$cats = $this->get_json( '/progressnow/v1/categories' )->get_data();
		$this->assertCount( 6, $cats['categories'] );
		$this->assertSame( 'chapter', $cats['categories'][0]['id'] );
	}

	/** Count transient writes whose name starts with a prefix (WP fires `setted_transient`). */
	private function count_transient_writes( $prefix ) {
		$counter = (object) array( 'n' => 0 );
		add_action(
			'setted_transient',
			static function ( $transient ) use ( $counter, $prefix ) {
				if ( 0 === strpos( (string) $transient, $prefix ) ) {
					$counter->n++;
				}
			}
		);

		return static function () use ( $counter ) {
			return $counter->n;
		};
	}

	/** `page` above the cap is a schema 400, never a huge-OFFSET query. */
	public function test_page_above_maximum_is_400() {
		$this->make_post( 'Only' );

		$this->assertSame( 200, $this->get_json( '/progressnow/v1/posts', array( 'page' => PROGRESSNOW_REST_MAX_PAGE ) )->get_status() );

		$response = $this->get_json( '/progressnow/v1/posts', array( 'page' => PROGRESSNOW_REST_MAX_PAGE + 1 ) );
		$this->assertSame( 400, $response->get_status() );
		$this->assertSame( 'rest_invalid_param', $response->get_data()['code'] );
	}

	/** Distinct `?s=` values must not accumulate transient rows; non-search pages still do. */
	public function test_search_is_not_transient_cached() {
		$this->make_post( 'Hit', array( 'post_content' => 'A xylophonic organizing drive.' ) );
		$writes = $this->count_transient_writes( 'progressnow_rest_posts_' );

		foreach ( array( 'aaa', 'bbb', 'xylophonic' ) as $term ) {
			$this->get_json( '/progressnow/v1/posts', array( 's' => $term ) );
		}
		$this->assertSame( 0, $writes(), 'search responses must not be persisted' );

		$listed = $this->get_json( '/progressnow/v1/posts' );
		$this->assertSame( 1, $writes(), 'the plain list is still cached' );

		// The uncached search response still carries the HTTP cache headers.
		$search  = $this->get_json( '/progressnow/v1/posts', array( 's' => 'xylophonic' ) );
		$headers = $search->get_headers();
		$this->assertSame( 'public, max-age=300, stale-while-revalidate=3600', $headers['Cache-Control'] );
		$this->assertNotEmpty( $headers['ETag'] );
		$this->assertSame( 'Hit', $search->get_data()['posts'][0]['title'] );
		$this->assertSame( 1, $listed->get_data()['total'] );
	}

	/** Unknown slugs are served as 404 without a negative transient, but with a short public Cache-Control. */
	public function test_unknown_slug_is_not_negatively_cached() {
		$writes = $this->count_transient_writes( 'progressnow_rest_' );

		foreach ( array( 'no-such-a', 'no-such-b' ) as $slug ) {
			$response = $this->get_json( '/progressnow/v1/posts/' . $slug );
			$this->assertSame( 404, $response->get_status() );
			$this->assertSame( 'public, max-age=60', $response->get_headers()['Cache-Control'] );
		}
		$this->assertSame( 404, $this->get_json( '/progressnow/v1/events/no-such-event' )->get_status() );
		$this->assertSame( 404, $this->get_json( '/progressnow/v1/pages/no/such/page' )->get_status() );
		$this->assertSame( 0, $writes(), '404 lookups must not write transients' );

		// A resolving slug is still cached, and a 400 stays uncached (no Cache-Control).
		$this->make_post( 'Real', array( 'post_name' => 'real-post' ) );
		$this->assertSame( 200, $this->get_json( '/progressnow/v1/posts/real-post' )->get_status() );
		$this->assertSame( 1, $writes() );
		$bad = $this->get_json( '/progressnow/v1/posts', array( 'category' => 'nope' ) );
		$this->assertArrayNotHasKey( 'Cache-Control', $bad->get_headers() );
	}

	/** Pure clamp: reversed ranges swap, out-of-range ends pin to [now-2y, now+5y]. */
	public function test_event_window_clamp() {
		$now = new DateTimeImmutable( '2026-09-07', new DateTimeZone( 'UTC' ) );

		$this->assertSame( array( '2026-01-01', '2026-12-31' ), progressnow_rest_clamp_event_window( '2026-01-01', '2026-12-31', $now ) );
		$this->assertSame( array( '2026-01-01', '2026-12-31' ), progressnow_rest_clamp_event_window( '2026-12-31', '2026-01-01', $now ), 'reversed → swapped' );
		$this->assertSame( array( '2024-09-07', '2031-09-07' ), progressnow_rest_clamp_event_window( '1900-01-01', '2999-12-31', $now ), 'centuries → bounds' );
		$this->assertSame( array( '2031-09-07', '2031-09-07' ), progressnow_rest_clamp_event_window( '2100-01-01', '2200-01-01', $now ), 'fully past max → pinned' );
		$this->assertSame( array( '2024-09-07', '2024-09-07' ), progressnow_rest_clamp_event_window( '1900-01-01', '1901-01-01', $now ), 'fully before min → pinned' );
	}

	/** The effective /events query window is the clamped one. */
	public function test_events_window_is_clamped_in_query() {
		$seen = array();
		add_filter(
			'posts_pre_query',
			function ( $pre, $query ) use ( &$seen ) {
				if ( 'event' === $query->get( 'post_type' ) ) {
					$seen[] = $query->get( 'meta_query' );
				}
				return $pre;
			},
			5,
			2
		);

		$response = $this->get_json( '/progressnow/v1/events', array( 'after' => '2999-01-01', 'before' => '1900-01-01' ) );
		$this->assertSame( 200, $response->get_status() );
		$this->assertCount( 1, $seen );

		$now = new DateTimeImmutable( 'now', progressnow_events_timezone() );
		$this->assertSame(
			array(
				$now->modify( PROGRESSNOW_REST_EVENTS_WINDOW_MIN )->format( 'Y-m-d' ) . ' 00:00:00',
				$now->modify( PROGRESSNOW_REST_EVENTS_WINDOW_MAX )->format( 'Y-m-d' ) . ' 23:59:59',
			),
			$seen[0][0]['value']
		);
	}

	/** Malformed /events dates are rejected. */
	public function test_events_bad_date_is_400() {
		$response = $this->get_json( '/progressnow/v1/events', array( 'after' => '2026-13-99' ) );

		$this->assertSame( 400, $response->get_status() );
	}
}
